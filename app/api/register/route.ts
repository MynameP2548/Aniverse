import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import prisma from "@/lib/prisma";

export async function POST(req: NextRequest) {
  try {
    const { email, password, name } = await req.json();

    if (!email || !password || !name) {
      return NextResponse.json(
        { error: "กรุณากรอกข้อมูลให้ครบ" },
        { status: 400 }
      );
    }

    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
      return NextResponse.json(
        { error: "อีเมลนี้ถูกใช้สมัครไปแล้ว" },
        { status: 409 }
      );
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    // New accounts always start as USER — promote to ADMIN manually
    // via Prisma Studio (`npx prisma studio`) for security.
    const user = await prisma.user.create({
      data: { email, password: hashedPassword, name, role: "USER" },
    });

    return NextResponse.json(
      { id: user.id, email: user.email, name: user.name },
      { status: 201 }
    );
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "สมัครสมาชิกไม่สำเร็จ" }, { status: 500 });
  }
}
