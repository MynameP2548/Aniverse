import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { auth } from "@/auth";
import prisma from "@/lib/prisma";

export async function PUT(req: NextRequest) {
  const session = await auth();

  console.log("SESSION:", session);

  if (!session?.user) {
    return NextResponse.json(
      { error: "กรุณาเข้าสู่ระบบก่อน" },
      { status: 401 }
    );
  }

  try {
    const {
  name,
  bio,
  currentPassword,
  newPassword,
} = await req.json();

    const user = await prisma.user.findUnique({ where: { id: session.user.id } });
    if (!user) {
      return NextResponse.json({ error: "ไม่พบผู้ใช้" }, { status: 404 });
    }

const data: {
  name?: string;
  bio?: string;
  password?: string;
} = {};

if (name?.trim()) {
  data.name = name.trim();
}

if (typeof bio === "string") {
  data.bio = bio;
}

if (newPassword) {
  if (!currentPassword) {
    return NextResponse.json(
      { error: "กรุณากรอกรหัสผ่านปัจจุบัน" },
      { status: 400 }
    );
  }

  const isValid = await bcrypt.compare(
    currentPassword,
    user.password
  );

  if (!isValid) {
    return NextResponse.json(
      { error: "รหัสผ่านปัจจุบันไม่ถูกต้อง" },
      { status: 401 }
    );
  }

  // เพิ่มส่วนนี้
  if (newPassword.length < 6) {
    return NextResponse.json(
      { error: "รหัสผ่านใหม่ต้องมีอย่างน้อย 6 ตัวอักษร" },
      { status: 400 }
    );
  }

  data.password = await bcrypt.hash(newPassword, 10);
}

    const updated = await prisma.user.update({
      where: { id: session.user.id },
      data,
    });

    return NextResponse.json({ name: updated.name, email: updated.email });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "อัปเดตโปรไฟล์ไม่สำเร็จ" }, { status: 500 });
  }
}
