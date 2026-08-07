import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import bcrypt from "bcryptjs";

export async function POST(req: NextRequest) {
  try {
    const { token, password } = await req.json();

    if (!token || !password) {
      return NextResponse.json(
        { error: "ข้อมูลไม่ครบ" },
        { status: 400 }
      );
    }

    if (password.length < 6) {
      return NextResponse.json(
        { error: "รหัสผ่านต้องมีอย่างน้อย 6 ตัวอักษร" },
        { status: 400 }
      );
    }

    const reset = await prisma.passwordReset.findFirst({
      where: {
        resetToken: token,
        used: false,
        expiresAt: {
          gt: new Date(),
        },
      },
    });

    if (!reset) {
      return NextResponse.json(
        { error: "ลิงก์รีเซ็ตรหัสผ่านไม่ถูกต้องหรือหมดอายุ" },
        { status: 400 }
      );
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    await prisma.user.update({
      where: {
        email: reset.email,
      },
      data: {
        password: hashedPassword,
      },
    });

await prisma.passwordReset.update({
  where: {
    id: reset.id,
  },
  data: {
    used: true,
  },
});

    return NextResponse.json({
      success: true,
    });
  } catch (error) {
    console.error(error);

    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}