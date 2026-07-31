import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import prisma from "@/lib/prisma";

export const dynamic = "force-dynamic";

// GET /api/anime/[id]/favorite - check if the current user has favorited this anime
export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ isFavorite: false });
  }

  const { id } = await params;
  const existing = await prisma.favorite.findUnique({
    where: { userId_animeId: { userId: session.user.id, animeId: id } },
  });

  return NextResponse.json({ isFavorite: !!existing });
}

// POST /api/anime/[id]/favorite - toggle favorite for the current user
export async function POST(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "กรุณาเข้าสู่ระบบก่อน" }, { status: 401 });
  }

  const { id } = await params;
  const userId = session.user.id;

  const existing = await prisma.favorite.findUnique({
    where: { userId_animeId: { userId, animeId: id } },
  });

  if (existing) {
    await prisma.favorite.delete({ where: { id: existing.id } });
    return NextResponse.json({ isFavorite: false });
  }

  await prisma.favorite.create({ data: { userId, animeId: id } });
  return NextResponse.json({ isFavorite: true });
}
