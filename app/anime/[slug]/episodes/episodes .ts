import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

// GET /api/anime/[id]/episodes - list all episodes of an anime, ordered by episode number
export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const episodes = await prisma.episode.findMany({
      where: { animeId: id },
      orderBy: { episodeNumber: "asc" },
    });
    return NextResponse.json(episodes);
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "โหลดรายการตอนไม่สำเร็จ" }, { status: 500 });
  }
}

// POST /api/anime/[id]/episodes - add a new episode to an anime (admin only)
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await req.json();
    const { episodeNumber, title, videoUrl, thumbnail, duration } = body;

    if (!episodeNumber || !videoUrl) {
      return NextResponse.json(
        { error: "กรุณากรอกลำดับตอนและลิงก์วิดีโอ" },
        { status: 400 }
      );
    }

    const episode = await prisma.episode.create({
      data: {
        animeId: id,
        episodeNumber: Number(episodeNumber),
        title,
        videoUrl,
        thumbnail,
        duration: duration ? Number(duration) : null,
      },
    });

    return NextResponse.json(episode, { status: 201 });
  } catch (error: unknown) {
    console.error(error);
    const message =
      typeof error === "object" && error && "code" in error && (error as { code?: string }).code === "P2002"
        ? "ตอนนี้มีลำดับตอนซ้ำกับตอนที่มีอยู่แล้ว"
        : "เพิ่มตอนไม่สำเร็จ";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
