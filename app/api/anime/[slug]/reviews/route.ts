import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import prisma from "@/lib/prisma";

export const dynamic = "force-dynamic";

// GET /api/anime/[slug]/reviews
export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;

  const anime = await prisma.anime.findUnique({
    where: { slug },
  });

  if (!anime) {
    return NextResponse.json(
      { error: "ไม่พบอนิเมะ" },
      { status: 404 }
    );
  }

  const reviews = await prisma.review.findMany({
    where: {
      animeId: anime.id,
    },
    include: {
      user: {
        select: {
          name: true,
        },
      },
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  const average =
    reviews.length > 0
      ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length
      : null;

  return NextResponse.json({
    reviews,
    average,
    count: reviews.length,
  });
}

// POST /api/anime/[slug]/reviews
export async function POST(
  req: NextRequest,
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
    where: { slug },
  });

  if (!anime) {
    return NextResponse.json(
      { error: "ไม่พบอนิเมะ" },
      { status: 404 }
    );
  }

  const { rating, comment } = await req.json();

  if (!rating || rating < 1 || rating > 5) {
    return NextResponse.json(
      { error: "กรุณาให้คะแนน 1-5 ดาว" },
      { status: 400 }
    );
  }

  const review = await prisma.review.upsert({
    where: {
      userId_animeId: {
        userId: session.user.id,
        animeId: anime.id,
      },
    },
    update: {
      rating: Number(rating),
      comment,
    },
    create: {
      userId: session.user.id,
      animeId: anime.id,
      rating: Number(rating),
      comment,
    },
  });

  return NextResponse.json(review);
}

// DELETE /api/anime/[slug]/reviews
export async function DELETE(
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
    where: { slug },
  });

  if (!anime) {
    return NextResponse.json(
      { error: "ไม่พบอนิเมะ" },
      { status: 404 }
    );
  }

  await prisma.review.deleteMany({
    where: {
      userId: session.user.id,
      animeId: anime.id,
    },
  });

  return NextResponse.json({
    success: true,
  });
}