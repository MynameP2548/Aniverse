import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { resend } from "@/lib/resend";
import crypto from "crypto";

function generateOTP() {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

export async function POST(req: NextRequest) {
  try {
    const { email } = await req.json();

    if (!email) {
      return NextResponse.json(
        { error: "กรุณากรอกอีเมล" },
        { status: 400 }
      );
    }

    const user = await prisma.user.findUnique({
      where: {
        email,
      },
    });

    // ไม่บอกว่าอีเมลมีหรือไม่มี
    if (!user) {
      return NextResponse.json({
        success: true,
      });
    }

    const otp = generateOTP();

    const otpHash = crypto
      .createHash("sha256")
      .update(otp)
      .digest("hex");

    // ลบรหัสเก่า
    await prisma.passwordReset.deleteMany({
      where: {
        email,
      },
    });

    await prisma.passwordReset.create({
      data: {
        email,
        otp: otpHash,
        expiresAt: new Date(Date.now() + 10 * 60 * 1000),
      },
    });

    const { error } = await resend.emails.send({
      from: "Aniverse <onboarding@resend.dev>",
      to: email,
      subject: "รีเซ็ตรหัสผ่าน Aniverse",
      html: `
      <div style="font-family:Arial;padding:24px">
        <h2>Aniverse</h2>

        <p>รหัสยืนยันของคุณคือ</p>

        <h1 style="letter-spacing:6px">${otp}</h1>

        <p>รหัสนี้จะหมดอายุภายใน 10 นาที</p>
      </div>
      `,
    });

    if (error) {
      console.error(error);

      return NextResponse.json(
        {
          error: "ส่งอีเมลไม่สำเร็จ",
        },
        {
          status: 500,
        }
      );
    }

    return NextResponse.json({
      success: true,
    });
  } catch (err) {
    console.error(err);

    return NextResponse.json(
      {
        error: "เกิดข้อผิดพลาด",
      },
      {
        status: 500,
      }
    );
  }
}