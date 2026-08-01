import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import prisma from "@/lib/prisma";

export const dynamic = "force-dynamic";

// GET /api/anime/[id]/reviews - list all reviews for an anime, newest first
export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  const reviews = await prisma.review.findMany({
    where: { animeId: id },
    include: { user: { select: { name: true } } },
    orderBy: { createdAt: "desc" },
  });

  const average =
    reviews.length > 0
      ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length
      : null;

  return NextResponse.json({ reviews, average, count: reviews.length });
}

// POST /api/anime/[id]/reviews - create or update the current user's review (upsert)
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "กรุณาเข้าสู่ระบบก่อน" }, { status: 401 });
  }

  const { id } = await params;
  const { rating, comment } = await req.json();

  if (!rating || rating < 1 || rating > 5) {
    return NextResponse.json({ error: "กรุณาให้คะแนน 1-5 ดาว" }, { status: 400 });
  }

  const review = await prisma.review.upsert({
    where: { userId_animeId: { userId: session.user.id, animeId: id } },
    update: { rating: Number(rating), comment },
    create: {
      userId: session.user.id,
      animeId: id,
      rating: Number(rating),
      comment,
    },
  });

  return NextResponse.json(review);
}

// DELETE /api/anime/[id]/reviews - remove the current user's own review
export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "กรุณาเข้าสู่ระบบก่อน" }, { status: 401 });
  }

  const { id } = await params;

  await prisma.review.deleteMany({
    where: { userId: session.user.id, animeId: id },
  });

  return NextResponse.json({ success: true });
}
