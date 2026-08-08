import { randomUUID } from "crypto";
import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase-admin";

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

    const bytes = await file.arrayBuffer();

    const buffer = Buffer.from(bytes);

const extension =
  file.name.split(".").pop() || "mp4";

const fileName =
  `${randomUUID()}.${extension}`;

    const { error } =
      await supabaseAdmin.storage
        .from("videos")
        .upload(fileName, buffer, {
          contentType: file.type,
          upsert: false,
        });

    if (error) {
      return NextResponse.json(
        { error: error.message },
        { status: 500 }
      );
    }

    const { data } =
      supabaseAdmin.storage
        .from("videos")
        .getPublicUrl(fileName);

    return NextResponse.json({
      success: true,
      url: data.publicUrl,
    });
} catch (err) {
  console.error("UPLOAD ERROR:", err);

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