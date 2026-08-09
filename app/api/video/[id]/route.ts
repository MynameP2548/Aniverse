import { NextRequest, NextResponse } from "next/server";
import { GetObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

import prisma from "@/lib/prisma";
import { r2, R2_BUCKET_NAME } from "@/lib/r2";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    if (!id) {
      return NextResponse.json(
        { error: "ไม่พบ Episode ID" },
        { status: 400 }
      );
    }

    const episode = await prisma.episode.findUnique({
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
        { error: "ไม่พบตอนนี้" },
        { status: 404 }
      );
    }

    if (!episode.videoUrl) {
      return NextResponse.json(
        { error: "ตอนนี้ยังไม่มีวิดีโอ" },
        { status: 404 }
      );
    }

    /*
     * รองรับทั้ง:
     *
     * 1. URL เดิมจาก R2
     *    https://pub-xxxx.r2.dev/xxxxx.mp4
     *
     * 2. Object Key ใหม่
     *    xxxxx.mp4
     */

    let objectKey = episode.videoUrl;

    try {
      const url = new URL(episode.videoUrl);

      if (url.pathname) {
        objectKey = decodeURIComponent(
          url.pathname.replace(/^\/+/, "")
        );
      }
    } catch {
      // videoUrl ไม่ใช่ URL
      // ถือว่าเป็น Object Key อยู่แล้ว
    }

    if (!objectKey) {
      return NextResponse.json(
        { error: "ไม่พบตำแหน่งไฟล์วิดีโอ" },
        { status: 404 }
      );
    }

    const command = new GetObjectCommand({
      Bucket: R2_BUCKET_NAME,
      Key: objectKey,
    });

    /*
     * URL มีอายุ 1 ชั่วโมง
     */
    const signedUrl = await getSignedUrl(r2, command, {
      expiresIn: 60 * 60,
    });

    return NextResponse.json({
      success: true,
      url: signedUrl,
      expiresIn: 60 * 60,
    });
  } catch (error) {
    console.error("VIDEO SIGNED URL ERROR:", error);

    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "ไม่สามารถสร้าง URL วิดีโอได้",
      },
      { status: 500 }
    );
  }
}