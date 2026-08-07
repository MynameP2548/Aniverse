import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import crypto from "crypto";

export async function POST(req: NextRequest) {
  try {
    const { email, otp } = await req.json();

    if (!email || !otp) {
      return NextResponse.json(
        {
          error: "ข้อมูลไม่ครบ",
        },
        {
          status: 400,
        }
      );
    }

    const otpHash = crypto
      .createHash("sha256")
      .update(otp)
      .digest("hex");

    const reset = await prisma.passwordReset.findFirst({
      where: {
        email,
        otp: otpHash,
        used: false,
      },
    });

    if (!reset) {
      return NextResponse.json(
        {
          error: "OTP ไม่ถูกต้อง",
        },
        {
          status: 400,
        }
      );
    }

    if (reset.expiresAt < new Date()) {
      return NextResponse.json(
        {
          error: "OTP หมดอายุแล้ว",
        },
        {
          status: 400,
        }
      );
    }
        const resetToken = crypto.randomUUID();

    await prisma.passwordReset.update({
      where: {
        id: reset.id,
      },
data: {
  resetToken,
},
    });

    return NextResponse.json({
      success: true,
      resetToken,
    });

  } catch (error) {
    console.error(error);

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