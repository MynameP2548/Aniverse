import { randomUUID } from "crypto";
import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";

import {
  AbortMultipartUploadCommand,
  CompleteMultipartUploadCommand,
  CreateMultipartUploadCommand,
  UploadPartCommand,
} from "@aws-sdk/client-s3";

import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

import {
  r2,
  R2_BUCKET_NAME,
} from "@/lib/r2";

export const runtime = "nodejs";

// 5 TiB - สูงสุดตาม R2
const MAX_SIZE =
  5 * 1024 * 1024 * 1024 * 1024;

// 100 MiB ต่อ part
const PART_SIZE =
  100 * 1024 * 1024;

// Presigned URL อยู่ได้นาน 7 วัน
const URL_EXPIRES_IN =
  7 * 24 * 60 * 60;

// =====================================================
// POST
// =====================================================

export async function POST(
  req: NextRequest
) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    if (session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const body = await req.json();

    const action =
      String(body.action || "");

    // =================================================
    // INIT
    // =================================================

    if (action === "init") {
      const fileName =
        String(body.fileName || "");

      const contentType =
        String(body.contentType || "");

      const size =
        Number(body.size || 0);

      if (!fileName) {
        return NextResponse.json(
          {
            error:
              "ไม่พบชื่อไฟล์",
          },
          {
            status: 400,
          }
        );
      }

      if (
        contentType !==
        "video/mp4"
      ) {
        return NextResponse.json(
          {
            error:
              "รองรับเฉพาะไฟล์ MP4",
          },
          {
            status: 400,
          }
        );
      }

      if (
        !size ||
        size <= 0
      ) {
        return NextResponse.json(
          {
            error:
              "ไม่พบขนาดไฟล์",
          },
          {
            status: 400,
          }
        );
      }

      if (
        size > MAX_SIZE
      ) {
        return NextResponse.json(
          {
            error:
              "ไฟล์ใหญ่เกิน 100 GiB",
          },
          {
            status: 400,
          }
        );
      }

      const extension =
        fileName
          .split(".")
          .pop()
          ?.toLowerCase() ||
        "mp4";

      const key =
        `videos/${randomUUID()}.${extension}`;

      // จำนวน part
      const partCount =
        Math.ceil(
          size / PART_SIZE
        );

      // ---------------------------------------------
      // สร้าง Multipart Upload
      // ---------------------------------------------

      const createResult =
        await r2.send(
          new CreateMultipartUploadCommand(
            {
              Bucket:
                R2_BUCKET_NAME,

              Key: key,

              ContentType:
                contentType,
            }
          )
        );

      const uploadId =
        createResult.UploadId;

      if (!uploadId) {
        throw new Error(
          "ไม่สามารถสร้าง Multipart Upload ได้"
        );
      }

      // ---------------------------------------------
      // สร้าง Presigned URL สำหรับทุก part
      // ---------------------------------------------

      const parts = [];

      for (
        let partNumber = 1;
        partNumber <= partCount;
        partNumber++
      ) {
        const command =
          new UploadPartCommand(
            {
              Bucket:
                R2_BUCKET_NAME,

              Key: key,

              UploadId:
                uploadId,

              PartNumber:
                partNumber,
            }
          );

        const uploadUrl =
          await getSignedUrl(
            r2,
            command,
            {
              expiresIn:
                URL_EXPIRES_IN,
            }
          );

        parts.push({
          partNumber,
          uploadUrl,
        });
      }

      return NextResponse.json({
        success: true,

        uploadId,

        key,

        partSize:
          PART_SIZE,

        partCount,

        parts,
      });
    }

    // =================================================
    // COMPLETE
    // =================================================

    if (
      action === "complete"
    ) {
      const uploadId =
        String(
          body.uploadId || ""
        );

      const key =
        String(
          body.key || ""
        );

      const parts =
        Array.isArray(
          body.parts
        )
          ? body.parts
          : [];

      if (
        !uploadId ||
        !key ||
        parts.length === 0
      ) {
        return NextResponse.json(
          {
            error:
              "ข้อมูล Complete Upload ไม่ครบ",
          },
          {
            status: 400,
          }
        );
      }

      // ตรวจสอบและเรียง part
      const completedParts =
        parts
          .map(
            (part: {
              partNumber: number;
              etag: string;
            }) => ({
              PartNumber:
                Number(
                  part.partNumber
                ),

              ETag:
                String(
                  part.etag
                ),
            })
          )
.sort(
  (a: { PartNumber: number | string }, b: { PartNumber: number | string }) =>
    Number(a.PartNumber) - Number(b.PartNumber)
);

      const result =
        await r2.send(
          new CompleteMultipartUploadCommand(
            {
              Bucket:
                R2_BUCKET_NAME,

              Key: key,

              UploadId:
                uploadId,

              MultipartUpload:
                {
                  Parts:
                    completedParts,
                },
            }
          )
        );

      const publicBaseUrl =
        String(
          process.env.R2_PUBLIC_URL ||
            ""
        ).replace(
          /\/$/,
          ""
        );

      if (!publicBaseUrl) {
        throw new Error(
          "ยังไม่ได้ตั้ง R2_PUBLIC_URL"
        );
      }

      const url =
        `${publicBaseUrl}/${key}`;

      return NextResponse.json({
        success: true,

        url,

        key,

        etag:
          result.ETag ||
          null,
      });
    }

    // =================================================
    // ABORT
    // =================================================

    if (
      action === "abort"
    ) {
      const uploadId =
        String(
          body.uploadId || ""
        );

      const key =
        String(
          body.key || ""
        );

      if (
        !uploadId ||
        !key
      ) {
        return NextResponse.json(
          {
            error:
              "ข้อมูล Abort Upload ไม่ครบ",
          },
          {
            status: 400,
          }
        );
      }

      await r2.send(
        new AbortMultipartUploadCommand(
          {
            Bucket:
              R2_BUCKET_NAME,

            Key: key,

            UploadId:
              uploadId,
          }
        )
      );

      return NextResponse.json({
        success: true,
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
      "R2 MULTIPART ERROR:",
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