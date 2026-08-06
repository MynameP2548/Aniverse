import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export const dynamic = "force-dynamic";

// GET /api/anime/[id]/seasons
export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const seasons = await prisma.season.findMany({
      where: {
        animeId: id,
      },
      orderBy: {
        seasonNumber: "asc",
      },
    });

    return NextResponse.json(seasons);
  } catch (error) {
    console.error(error);

    return NextResponse.json(
      { error: "โหลด Season ไม่สำเร็จ" },
      { status: 500 }
    );
  }
}

// POST /api/anime/[id]/seasons
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const body = await req.json();

    const {
      seasonNumber,
      title,
    } = body;

    if (!seasonNumber) {
      return NextResponse.json(
        { error: "กรุณาระบุ Season" },
        { status: 400 }
      );
    }

    const season = await prisma.season.create({
      data: {
        animeId: id,
        seasonNumber: Number(seasonNumber),
        title,
      },
    });

    return NextResponse.json(season, {
      status: 201,
    });
  } catch (error: unknown) {
    console.error(error);

    const message =
      typeof error === "object" &&
      error &&
      "code" in error &&
      (error as { code?: string }).code === "P2002"
        ? "Season นี้มีอยู่แล้ว"
        : "เพิ่ม Season ไม่สำเร็จ";

    return NextResponse.json(
      { error: message },
      { status: 500 }
    );
  }
}