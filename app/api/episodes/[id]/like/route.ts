import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { auth } from "@/auth";

export const dynamic = "force-dynamic";

// GET = ดูจำนวน Like + ดูว่าผู้ใช้ปัจจุบัน Like แล้วหรือยัง
export async function GET(
  _req: Request,
  {
    params,
  }: {
    params: Promise<{ id: string }>;
  }
) {
  try {
    const { id: episodeId } = await params;

    if (!episodeId) {
      return NextResponse.json(
        { error: "ไม่พบ Episode ID" },
        { status: 400 }
      );
    }

    const session = await auth();

    const likeCount =
      await prisma.episodeLike.count({
        where: {
          episodeId,
        },
      });

    let liked = false;

    if (session?.user?.id) {
      const existingLike =
        await prisma.episodeLike.findUnique({
          where: {
            userId_episodeId: {
              userId: session.user.id,
              episodeId,
            },
          },
        });

      liked = !!existingLike;
    }

    return NextResponse.json({
      liked,
      count: likeCount,
    });
  } catch (error) {
    console.error(
      "GET EPISODE LIKE ERROR:",
      error
    );

    return NextResponse.json(
      {
        error: "ไม่สามารถโหลดข้อมูล Like ได้",
      },
      { status: 500 }
    );
  }
}


// POST = Like / Unlike
export async function POST(
  _req: Request,
  {
    params,
  }: {
    params: Promise<{ id: string }>;
  }
) {
  try {
    const { id: episodeId } = await params;

    if (!episodeId) {
      return NextResponse.json(
        { error: "ไม่พบ Episode ID" },
        { status: 400 }
      );
    }

    const session = await auth();

    // ต้อง Login ก่อน
    if (!session?.user?.id) {
      return NextResponse.json(
        {
          error:
            "กรุณาเข้าสู่ระบบก่อนกดถูกใจ",
        },
        { status: 401 }
      );
    }

    const userId = session.user.id;

    // ตรวจสอบว่า Episode มีอยู่จริง
    const episode =
      await prisma.episode.findUnique({
        where: {
          id: episodeId,
        },
        select: {
          id: true,
        },
      });

    if (!episode) {
      return NextResponse.json(
        {
          error: "ไม่พบ Episode นี้",
        },
        { status: 404 }
      );
    }

    // เช็กว่าเคย Like แล้วหรือยัง
    const existingLike =
      await prisma.episodeLike.findUnique({
        where: {
          userId_episodeId: {
            userId,
            episodeId,
          },
        },
      });

    // ถ้า Like อยู่แล้ว → Unlike
    if (existingLike) {
      await prisma.episodeLike.delete({
        where: {
          id: existingLike.id,
        },
      });

      const count =
        await prisma.episodeLike.count({
          where: {
            episodeId,
          },
        });

      return NextResponse.json({
        liked: false,
        count,
      });
    }

    // ถ้ายังไม่ได้ Like → Like
    await prisma.episodeLike.create({
      data: {
        userId,
        episodeId,
      },
    });

    const count =
      await prisma.episodeLike.count({
        where: {
          episodeId,
        },
      });

    return NextResponse.json({
      liked: true,
      count,
    });
  } catch (error) {
    console.error(
      "POST EPISODE LIKE ERROR:",
      error
    );

    return NextResponse.json(
      {
        error:
          "ไม่สามารถกดถูกใจตอนนี้ได้",
      },
      { status: 500 }
    );
  }
}