import { NextRequest, NextResponse } from "next/server";
import { PutObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

import { r2, R2_BUCKET_NAME } from "@/lib/r2";

export const runtime = "nodejs";

const URL_EXPIRES_IN = 60 * 60; // 1 ชั่วโมง

function getContentType(fileName: string) {
  const lower = fileName.toLowerCase();

  if (lower.endsWith(".m3u8")) {
    return "application/vnd.apple.mpegurl";
  }

  if (lower.endsWith(".ts")) {
    return "video/mp2t";
  }

  return "application/octet-stream";
}

function cleanPath(path: string) {
  return path
    .replace(/\\/g, "/")
    .split("/")
    .filter(Boolean)
    .map((part) =>
      part.replace(/[^a-zA-Z0-9._-]/g, "_")
    )
    .join("/");
}

// =====================================================
// POST
// =====================================================

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    const action = String(body.action || "");

    // =================================================
    // INIT
    // =================================================

    if (action === "init") {
      const files = Array.isArray(body.files)
        ? body.files
        : [];

      if (files.length === 0) {
        return NextResponse.json(
          {
            error: "ไม่พบไฟล์ HLS",
          },
          {
            status: 400,
          }
        );
      }

      if (files.length > 2000) {
        return NextResponse.json(
          {
            error:
              "จำนวนไฟล์ HLS มากเกินไป (สูงสุด 2000 ไฟล์)",
          },
          {
            status: 400,
          }
        );
      }

      // ต้องมี master.m3u8
      const hasMaster = files.some(
        (file: {
          name?: string;
          relativePath?: string;
        }) => {
          const path =
            file.relativePath ||
            file.name ||
            "";

          return (
            path
              .split("/")
              .pop()
              ?.toLowerCase() === "master.m3u8"
          );
        }
      );

      if (!hasMaster) {
        return NextResponse.json(
          {
            error:
              "ไม่พบ master.m3u8 ในโฟลเดอร์ HLS",
          },
          {
            status: 400,
          }
        );
      }

      // สร้างโฟลเดอร์เฉพาะของ HLS ชุดนี้
      const uploadId = crypto.randomUUID();

      const baseKey = `hls/${uploadId}`;

      const uploadFiles = [];

      for (const file of files) {
        const name = String(file.name || "");

        const relativePath = String(
          file.relativePath || name
        );

        if (!name) {
          continue;
        }

        // ---------------------------------------------
        // Browser จะส่งประมาณ:
        //
        // hls-full/master.m3u8
        // hls-full/stream-Thai.m3u8
        // hls-full/stream-2-000.ts
        //
        // เราตัด hls-full/ ออก
        // เพื่อให้ทุกไฟล์อยู่ใน directory เดียวกัน
        // ---------------------------------------------

        const pathParts = relativePath
          .replace(/\\/g, "/")
          .split("/")
          .filter(Boolean);

        if (pathParts.length > 1) {
          pathParts.shift();
        }

        const cleanRelativePath = cleanPath(
          pathParts.join("/")
        );

        if (!cleanRelativePath) {
          continue;
        }

        const key =
          `${baseKey}/${cleanRelativePath}`;

        const contentType =
          getContentType(name);

        const command =
          new PutObjectCommand({
            Bucket: R2_BUCKET_NAME,
            Key: key,
            ContentType: contentType,

            CacheControl:
              name
                .toLowerCase()
                .endsWith(".m3u8")
                ? "no-cache, no-store, must-revalidate"
                : "public, max-age=31536000, immutable",
          });

        const uploadUrl =
          await getSignedUrl(
            r2,
            command,
            {
              expiresIn:
                URL_EXPIRES_IN,
            }
          );

        uploadFiles.push({
          name,
          relativePath: cleanRelativePath,
          key,
          uploadUrl,
          contentType,
        });
      }

      const publicBaseUrl =
        String(
          process.env.R2_PUBLIC_URL || ""
        ).replace(/\/$/, "");

      if (!publicBaseUrl) {
        throw new Error(
          "ยังไม่ได้ตั้ง R2_PUBLIC_URL"
        );
      }

      const masterKey =
        uploadFiles.find(
          (file) =>
            file.relativePath.toLowerCase() ===
            "master.m3u8"
        )?.key;

      if (!masterKey) {
        return NextResponse.json(
          {
            error:
              "ไม่พบ master.m3u8",
          },
          {
            status: 400,
          }
        );
      }

      const masterUrl =
        `${publicBaseUrl}/${masterKey}`;

      return NextResponse.json({
        success: true,

        uploadId,

        baseKey,

        masterUrl,

        files: uploadFiles,
      });
    }

    // =================================================
    // COMPLETE
    //
    // Direct PUT เข้า R2 ไม่ต้อง Complete
    // =================================================

    if (action === "complete") {
      const uploadId = String(
        body.uploadId || ""
      );

      const baseKey = String(
        body.baseKey || ""
      );

      if (!uploadId || !baseKey) {
        return NextResponse.json(
          {
            error:
              "ข้อมูล Complete ไม่ครบ",
          },
          {
            status: 400,
          }
        );
      }

      const publicBaseUrl =
        String(
          process.env.R2_PUBLIC_URL || ""
        ).replace(/\/$/, "");

      if (!publicBaseUrl) {
        throw new Error(
          "ยังไม่ได้ตั้ง R2_PUBLIC_URL"
        );
      }

      const masterUrl =
        `${publicBaseUrl}/${baseKey}/master.m3u8`;

      return NextResponse.json({
        success: true,
        uploadId,
        baseKey,
        masterUrl,
      });
    }

    return NextResponse.json(
      {
        error:
          "ไม่รู้จัก action",
      },
      {
        status: 400,
      }
    );
  } catch (err) {
    console.error(
      "HLS UPLOAD ERROR:",
      err
    );

    return NextResponse.json(
      {
        error:
          err instanceof Error
            ? err.message
            : String(err),
      },
      {
        status: 500,
      }
    );
  }
}