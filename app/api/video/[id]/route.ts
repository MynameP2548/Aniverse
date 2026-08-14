import { NextRequest, NextResponse } from "next/server";
import { GetObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

import prisma from "@/lib/prisma";
import { r2, R2_BUCKET_NAME } from "@/lib/r2";

function isHlsManifest(url: string) {
  return /\.m3u8(?:\?.*)?$/i.test(url);
}

function getObjectKey(videoUrl: string) {
  let objectKey = videoUrl;

  try {
    const url = new URL(videoUrl);

    objectKey = decodeURIComponent(
      url.pathname.replace(/^\/+/, "")
    );
  } catch {
    // videoUrl เป็น object key อยู่แล้ว
  }

  return objectKey.replace(/^\/+/, "");
}

export async function GET(
  _req: NextRequest,
  {
    params,
  }: {
    params: Promise<{ id: string }>;
  }
) {
  try {
    const { id } = await params;

    if (!id) {
      return NextResponse.json(
        {
          error: "ไม่พบ Episode ID",
        },
        {
          status: 400,
        }
      );
    }

    const episode =
      await prisma.episode.findUnique({
        where: {
          id,
        },
        select: {
          id: true,
          videoUrl: true,
        },
      });

    if (!episode) {
      return NextResponse.json(
        {
          error: "ไม่พบตอนนี้",
        },
        {
          status: 404,
        }
      );
    }

    if (!episode.videoUrl) {
      return NextResponse.json(
        {
          error: "ตอนนี้ยังไม่มีวิดีโอ",
        },
        {
          status: 404,
        }
      );
    }

    // ==================================================
    // HLS
    // ==================================================

    if (isHlsManifest(episode.videoUrl)) {
      const proxyUrl =
        new URL(
          `/api/video/${encodeURIComponent(
            id
          )}/hls`,
          _req.url
        );

      return NextResponse.json({
        success: true,
        url: proxyUrl.toString(),
        expiresIn: null,
        hls: true,
      });
    }

    // ==================================================
    // MP4 / ไฟล์วิดีโอเดี่ยว
    // ==================================================

    const objectKey =
      getObjectKey(
        episode.videoUrl
      );

    if (!objectKey) {
      return NextResponse.json(
        {
          error:
            "ไม่พบตำแหน่งไฟล์วิดีโอ",
        },
        {
          status: 404,
        }
      );
    }

    const command =
      new GetObjectCommand({
        Bucket:
          R2_BUCKET_NAME,

        Key: objectKey,
      });

    const signedUrl =
      await getSignedUrl(
        r2,
        command,
        {
          expiresIn:
            60 * 60,
        }
      );

    return NextResponse.json({
      success: true,
      url: signedUrl,
      expiresIn:
        60 * 60,
      hls: false,
    });
  } catch (error) {
    console.error(
      "VIDEO URL ERROR:",
      error
    );

    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "ไม่สามารถสร้าง URL วิดีโอได้",
      },
      {
        status: 500,
      }
    );
  }
}