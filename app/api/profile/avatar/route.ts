import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import prisma from "@/lib/prisma";
import { supabaseAdmin } from "@/lib/supabase-admin";

const MAX_SIZE = 5 * 1024 * 1024;

const ALLOWED_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
];

export async function POST(req: NextRequest) {
  try {
const session = await auth();
    if (!session?.user?.email) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const user = await prisma.user.findUnique({
      where: {
        email: session.user.email,
      },
    });

    if (!user) {
      return NextResponse.json(
        { error: "User not found" },
        { status: 404 }
      );
    }

    const formData = await req.formData();

    const file = formData.get("file") as File | null;

    if (!file) {
      return NextResponse.json(
        { error: "ไม่พบไฟล์" },
        { status: 400 }
      );
    }

    if (!ALLOWED_TYPES.includes(file.type)) {
      return NextResponse.json(
        {
          error:
            "รองรับเฉพาะ JPG, PNG และ WEBP",
        },
        { status: 400 }
      );
    }

    if (file.size > MAX_SIZE) {
      return NextResponse.json(
        {
          error:
            "รูปต้องไม่เกิน 5MB",
        },
        { status: 400 }
      );
    }

    const bytes = await file.arrayBuffer();

    const buffer = Buffer.from(bytes);

    const extension =
      file.name.split(".").pop() || "png";

    const fileName =
      `${user.id}-${Date.now()}.${extension}`;
          // ลบรูปเก่า (ถ้ามี)
    if (user.avatar) {
      const oldPath = user.avatar.split("/avatars/")[1];

      if (oldPath) {
        await supabaseAdmin.storage
          .from("avatars")
          .remove([oldPath]);
      }
    }

    // Upload รูปใหม่
    const { error: uploadError } =
      await supabaseAdmin.storage
        .from("avatars")
        .upload(fileName, buffer, {
          contentType: file.type,
          upsert: true,
        });

    if (uploadError) {
      return NextResponse.json(
        {
          error:
            uploadError.message,
        },
        { status: 500 }
      );
    }

    // ดึง Public URL
    const {
      data: publicData,
    } = supabaseAdmin.storage
      .from("avatars")
      .getPublicUrl(fileName);

    const avatarUrl =
      publicData.publicUrl;

    // บันทึกลง Database
    await prisma.user.update({
      where: {
        id: user.id,
      },
      data: {
        avatar: avatarUrl,
      },
    });

    return NextResponse.json({
      success: true,
      avatar: avatarUrl,
    });
  } catch (error) {
    console.error(error);

    return NextResponse.json(
      {
        error:
          "เกิดข้อผิดพลาด",
      },
      {
        status: 500,
      }
    );
  }
}