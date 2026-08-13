import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export const dynamic = "force-dynamic";

// GET /api/anime/[slug]/episodes
export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
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

    const episodes = await prisma.episode.findMany({
      where: {
        animeId: anime.id,
      },
      orderBy: {
        episodeNumber: "asc",
      },
    });

    return NextResponse.json(episodes);
  } catch (error) {
    console.error(error);

    return NextResponse.json(
      { error: "โหลดรายการตอนไม่สำเร็จ" },
      { status: 500 }
    );
  }
}

// POST /api/anime/[slug]/episodes
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;

    const body = await req.json();

    const {
      episodeNumber,
      title,
      videoUrl,
      thumbnail,
      duration,
      introStart,
      introEnd,
      nextEpisodeTime,
    } = body;

    if (!episodeNumber || !videoUrl) {
      return NextResponse.json(
        {
          error: "กรุณากรอกลำดับตอนและลิงก์วิดีโอ",
        },
        {
          status: 400,
        }
      );
    }

    const anime = await prisma.anime.findUnique({
      where: {
        slug,
      },
    });

    if (!anime) {
      return NextResponse.json(
        {
          error: "ไม่พบอนิเมะ",
        },
        {
          status: 404,
        }
      );
    }

    const episode = await prisma.episode.create({
      data: {
        animeId: anime.id,
        episodeNumber: Number(episodeNumber),
        title,
        videoUrl,
        thumbnail,
        duration: duration ? Number(duration) : null,
        introStart:
          introStart === null || introStart === "" || introStart === undefined
            ? null
            : Number(introStart),
        introEnd:
          introEnd === null || introEnd === "" || introEnd === undefined
            ? null
            : Number(introEnd),
        nextEpisodeTime:
          nextEpisodeTime === null || nextEpisodeTime === "" || nextEpisodeTime === undefined
            ? null
            : Number(nextEpisodeTime),
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
      { error: message },
      { status: 500 }
    );
  }
}