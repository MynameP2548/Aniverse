import { NextRequest, NextResponse } from "next/server";
import {
  GetObjectCommand,
} from "@aws-sdk/client-s3";
import {
  getSignedUrl,
} from "@aws-sdk/s3-request-presigner";

import prisma from "@/lib/prisma";
import {
  r2,
  R2_BUCKET_NAME,
} from "@/lib/r2";

function getObjectKey(
  videoUrl: string
) {
  let key = videoUrl;

  try {
    const url =
      new URL(videoUrl);

    key = decodeURIComponent(
      url.pathname.replace(
        /^\/+/,
        ""
      )
    );
  } catch {
    // เป็น object key อยู่แล้ว
  }

  return key.replace(
    /^\/+/,
    ""
  );
}

function isM3u8(
  value: string
) {
  return /\.m3u8$/i.test(
    value.split("?")[0]
  );
}

function isTs(
  value: string
) {
  return /\.ts$/i.test(
    value.split("?")[0]
  );
}

// --------------------------------------------------
// ทำ URI ของไฟล์ลูกให้กลายเป็น URL ของ HLS Proxy
// --------------------------------------------------

function makeProxyUrl(
  request: NextRequest,
  episodeId: string,
  key: string
) {
  const url =
    new URL(
      `/api/video/${encodeURIComponent(
        episodeId
      )}/hls`,
      request.url
    );

  url.searchParams.set(
    "key",
    key
  );

  return url.toString();
}

// --------------------------------------------------
// หา path ของ URI แบบ relative
// --------------------------------------------------

function resolveRelativeKey(
  baseKey: string,
  uri: string
) {
  const baseParts =
    baseKey.split("/");

  baseParts.pop();

  const parts =
    uri
      .replace(/\\/g, "/")
      .split("/");

  for (const part of parts) {
    if (!part || part === ".") {
      continue;
    }

    if (part === "..") {
      baseParts.pop();
      continue;
    }

    baseParts.push(part);
  }

  return baseParts.join("/");
}

// --------------------------------------------------
// ตรวจว่า key อยู่ในโฟลเดอร์ HLS เดียวกับ master
// --------------------------------------------------

function isAllowedKey(
  masterKey: string,
  key: string
) {
  const masterPrefix =
    masterKey.substring(
      0,
      masterKey.lastIndexOf("/") + 1
    );

  return (
    key.startsWith(
      masterPrefix
    ) &&
    key.startsWith("hls/")
  );
}

// --------------------------------------------------
// Rewrite HLS Playlist
// --------------------------------------------------

function rewritePlaylist(
  playlist: string,
  currentKey: string,
  episodeId: string,
  request: NextRequest
) {
  const lines =
    playlist.split(/\r?\n/);

  return lines
    .map((line) => {
      const trimmed =
        line.trim();

      if (!trimmed) {
        return line;
      }

      // --------------------------------------------
      // URI="xxx.m3u8"
      // เช่น #EXT-X-MEDIA
      // --------------------------------------------

      if (
        line.includes('URI="')
      ) {
        return line.replace(
          /URI="([^"]+)"/g,
          (_match, uri: string) => {
            const targetKey =
              resolveRelativeKey(
                currentKey,
                uri
              );

            return `URI="${makeProxyUrl(
              request,
              episodeId,
              targetKey
            )}"`;
          }
        );
      }

      // --------------------------------------------
      // comment
      // --------------------------------------------

      if (
        trimmed.startsWith("#")
      ) {
        return line;
      }

      // --------------------------------------------
      // URI ธรรมดา
      // เช่น stream-2.m3u8
      // หรือ *.ts
      // --------------------------------------------

      const targetKey =
        resolveRelativeKey(
          currentKey,
          trimmed
        );

      return makeProxyUrl(
        request,
        episodeId,
        targetKey
      );
    })
    .join("\n");
}

// --------------------------------------------------
// GET
// --------------------------------------------------

export async function GET(
  req: NextRequest,
  {
    params,
  }: {
    params: Promise<{
      id: string;
    }>;
  }
) {
  try {
    const { id } =
      await params;

    if (!id) {
      return new NextResponse(
        "Episode ID missing",
        {
          status: 400,
        }
      );
    }

    // ----------------------------------------------
    // โหลด Episode
    // ----------------------------------------------

    const episode =
      await prisma.episode.findUnique(
        {
          where: {
            id,
          },
          select: {
            id: true,
            videoUrl: true,
          },
        }
      );

    if (!episode) {
      return new NextResponse(
        "Episode not found",
        {
          status: 404,
        }
      );
    }

    if (!episode.videoUrl) {
      return new NextResponse(
        "Video not found",
        {
          status: 404,
        }
      );
    }

    const masterKey =
      getObjectKey(
        episode.videoUrl
      );

    if (
      !isM3u8(masterKey)
    ) {
      return new NextResponse(
        "Episode is not HLS",
        {
          status: 400,
        }
      );
    }

    // ----------------------------------------------
    // ถ้าไม่มี key = master.m3u8
    // ----------------------------------------------

    const keyParam =
      req.nextUrl.searchParams.get(
        "key"
      );

    const requestedKey =
      keyParam
        ? decodeURIComponent(
            keyParam
          )
        : masterKey;

    // ----------------------------------------------
    // Security
    // ----------------------------------------------

    if (
      !isAllowedKey(
        masterKey,
        requestedKey
      )
    ) {
      return new NextResponse(
        "Invalid HLS path",
        {
          status: 403,
        }
      );
    }

    // ----------------------------------------------
    // Playlist
    // ----------------------------------------------

    if (
      isM3u8(
        requestedKey
      )
    ) {
      const object =
        await r2.send(
          new GetObjectCommand({
            Bucket:
              R2_BUCKET_NAME,

            Key:
              requestedKey,
          })
        );

      if (!object.Body) {
        return new NextResponse(
          "HLS playlist empty",
          {
            status: 404,
          }
        );
      }

      const playlist =
        await object.Body.transformToString(
          "utf-8"
        );

      const rewritten =
        rewritePlaylist(
          playlist,
          requestedKey,
          id,
          req
        );

      return new NextResponse(
        rewritten,
        {
          status: 200,

          headers: {
            "Content-Type":
              "application/vnd.apple.mpegurl",

            "Cache-Control":
              "no-store, no-cache, must-revalidate",

            "Access-Control-Allow-Origin":
              "*",

            "Access-Control-Allow-Methods":
              "GET, HEAD, OPTIONS",

            "Access-Control-Allow-Headers":
              "*",
          },
        }
      );
    }

    // ----------------------------------------------
    // TS Segment
    // ----------------------------------------------

    if (
      isTs(
        requestedKey
      )
    ) {
      const command =
        new GetObjectCommand({
          Bucket:
            R2_BUCKET_NAME,

          Key:
            requestedKey,
        });

      const signedUrl =
        await getSignedUrl(
          r2,
          command,
          {
            expiresIn:
              10 * 60,
          }
        );

      return NextResponse.redirect(
        signedUrl,
        307
      );
    }

    return new NextResponse(
      "Unsupported HLS file",
      {
        status: 400,
      }
    );
  } catch (error) {
    console.error(
      "HLS PROXY ERROR:",
      error
    );

    return new NextResponse(
      error instanceof Error
        ? error.message
        : "HLS proxy error",
      {
        status: 500,
      }
    );
  }
}

// --------------------------------------------------
// OPTIONS
// --------------------------------------------------

export async function OPTIONS() {
  return new NextResponse(
    null,
    {
      status: 204,

      headers: {
        "Access-Control-Allow-Origin":
          "*",

        "Access-Control-Allow-Methods":
          "GET, HEAD, OPTIONS",

        "Access-Control-Allow-Headers":
          "*",
      },
    }
  );
}