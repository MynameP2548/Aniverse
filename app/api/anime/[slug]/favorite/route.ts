import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import prisma from "@/lib/prisma";

export const dynamic = "force-dynamic";

// GET /api/anime/[slug]/favorite
export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  const session = await auth();

  if (!session?.user) {
    return NextResponse.json({ isFavorite: false });
  }

  const { slug } = await params;

  const anime = await prisma.anime.findUnique({
    where: {
      slug,
    },
  });

  if (!anime) {
    return NextResponse.json(
      { error: "ไม่พบอนิเมะ" },
      { status: 404 }
    );
  }

  const existing = await prisma.favorite.findUnique({
    where: {
      userId_animeId: {
        userId: session.user.id,
        animeId: anime.id,
      },
    },
  });

  return NextResponse.json({
    isFavorite: !!existing,
  });
}

// POST /api/anime/[slug]/favorite
export async function POST(
  _req: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  const session = await auth();

  if (!session?.user) {
    return NextResponse.json(
      { error: "กรุณาเข้าสู่ระบบก่อน" },
      { status: 401 }
    );
  }

  const { slug } = await params;

  const anime = await prisma.anime.findUnique({
    where: {
      slug,
    },
  });

  if (!anime) {
    return NextResponse.json(
      { error: "ไม่พบอนิเมะ" },
      { status: 404 }
    );
  }

  const userId = session.user.id;

  const existing = await prisma.favorite.findUnique({
    where: {
      userId_animeId: {
        userId,
        animeId: anime.id,
      },
    },
  });

  if (existing) {
    await prisma.favorite.delete({
      where: {
        id: existing.id,
      },
    });

    return NextResponse.json({
      isFavorite: false,
    });
  }

  await prisma.favorite.create({
    data: {
      userId,
      animeId: anime.id,
    },
  });

  return NextResponse.json({
    isFavorite: true,
  });
}