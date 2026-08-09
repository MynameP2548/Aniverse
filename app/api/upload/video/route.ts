import { randomUUID } from "crypto";
import { NextRequest, NextResponse } from "next/server";
import { PutObjectCommand } from "@aws-sdk/client-s3";

import { r2, R2_BUCKET_NAME } from "@/lib/r2";

const MAX_SIZE = 2 * 1024 * 1024 * 1024; // 2GB

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();

    const file = formData.get("file") as File | null;

    if (!file) {
      return NextResponse.json(
        { error: "ไม่พบไฟล์" },
        { status: 400 }
      );
    }

    if (file.type !== "video/mp4") {
      return NextResponse.json(
        { error: "รองรับเฉพาะ MP4" },
        { status: 400 }
      );
    }

    if (file.size > MAX_SIZE) {
      return NextResponse.json(
        { error: "ไฟล์ใหญ่เกิน 2GB" },
        { status: 400 }
      );
    }

    const extension =
      file.name.split(".").pop()?.toLowerCase() || "mp4";

    const fileName = `${randomUUID()}.${extension}`;

    const bytes = await file.arrayBuffer();

    const buffer = Buffer.from(bytes);

    await r2.send(
      new PutObjectCommand({
        Bucket: R2_BUCKET_NAME,
        Key: fileName,
        Body: buffer,
        ContentType: file.type,
      })
    );

    const publicUrl =
      `${process.env.R2_PUBLIC_URL}/${fileName}`;

    return NextResponse.json({
      success: true,
      url: publicUrl,
      fileName,
    });
  } catch (err) {
    console.error("R2 UPLOAD ERROR:", err);

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