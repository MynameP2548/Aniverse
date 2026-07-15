import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export const dynamic = "force-dynamic";

// GET /api/anime - list all anime (used by homepage + admin list)
export async function GET() {
  try {
    const anime = await prisma.anime.findMany({
      orderBy: { createdAt: "desc" },
      include: { episodes: true },
    });
    return NextResponse.json(anime);
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "ไม่สามารถโหลดรายการอนิเมะได้" },
      { status: 500 }
    );
  }
}

// POST /api/anime - create a new anime (admin only)
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { title, titleEn, description, coverImage, bannerImage, genres, status, releaseYear } = body;

    if (!title) {
      return NextResponse.json(
        { error: "กรุณากรอกชื่อเรื่อง" },
        { status: 400 }
      );
    }

    const anime = await prisma.anime.create({
      data: {
        title,
        titleEn,
        description,
        coverImage,
        bannerImage,
        genres: genres || [],
        status: status || "ONGOING",
        releaseYear: releaseYear ? Number(releaseYear) : null,
      },
    });

    return NextResponse.json(anime, { status: 201 });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "ไม่สามารถเพิ่มอนิเมะได้" },
      { status: 500 }
    );
  }
}
