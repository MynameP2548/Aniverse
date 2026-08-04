import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

// GET /api/anime/[id]/episodes
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const seasonId = req.nextUrl.searchParams.get("seasonId");

    const episodes = await prisma.episode.findMany({
      where: {
        animeId: id,
        ...(seasonId ? { seasonId } : {}),
      },
      orderBy: {
        episodeNumber: "asc",
      },
    });

    return NextResponse.json(episodes);
  } catch (error) {
    console.error(error);

    return NextResponse.json(
      {
        error: "โหลดรายการตอนไม่สำเร็จ",
      },
      {
        status: 500,
      }
    );
  }
}

// POST /api/anime/[id]/episodes
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await req.json();

    const {
      seasonId,
      episodeNumber,
      title,
      videoUrl,
      thumbnail,
      duration,
    } = body;

    if (!seasonId || !episodeNumber || !videoUrl) {
      return NextResponse.json(
        {
          error: "กรุณาเลือก Season พร้อมกรอกลำดับตอนและลิงก์วิดีโอ",
        },
        {
          status: 400,
        }
      );
    }

    const episode = await prisma.episode.create({
      data: {
        animeId: id,
        seasonId,
        episodeNumber: Number(episodeNumber),
        title,
        videoUrl,
        thumbnail,
        duration: duration ? Number(duration) : null,
      },
    });

    return NextResponse.json(episode, {
      status: 201,
    });
  } catch (error: unknown) {
    console.error(error);

    const message =
      typeof error === "object" &&
      error &&
      "code" in error &&
      (error as { code?: string }).code === "P2002"
        ? "ตอนนี้มีลำดับตอนซ้ำกับตอนที่มีอยู่แล้ว"
        : "เพิ่มตอนไม่สำเร็จ";

    return NextResponse.json(
      {
        error: message,
      },
      {
        status: 500,
      }
    );
  }
}