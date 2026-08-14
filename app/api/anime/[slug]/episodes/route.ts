import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export const dynamic = "force-dynamic";

type AudioInput = {
  language: "THAI" | "JAPANESE";
  url: string;
  label?: string;
};

type SubtitleInput = {
  language: "THAI" | "ENGLISH" | "JAPANESE";
  url: string;
  label?: string;
};

// GET /api/anime/[slug]/episodes
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;

    const anime = await prisma.anime.findUnique({ where: { slug } });

    if (!anime) {
      return NextResponse.json({ error: "ไม่พบอนิเมะ" }, { status: 404 });
    }

    const seasonId = req.nextUrl.searchParams.get("seasonId");

    const episodes = await prisma.episode.findMany({
      where: {
        animeId: anime.id,
        ...(seasonId ? { seasonId } : {}),
      },
      include: {
        audioTracks: { orderBy: { language: "asc" } },
        subtitles: { orderBy: { language: "asc" } },
      },
      orderBy: { episodeNumber: "asc" },
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

    const anime = await prisma.anime.findUnique({ where: { slug } });

    if (!anime) {
      return NextResponse.json({ error: "ไม่พบอนิเมะ" }, { status: 404 });
    }

    const body = await req.json();

    const {
      seasonId,
      episodeNumber,
      title,
      videoUrl,
      thumbnail,
      duration,
      introStart,
      introEnd,
      nextEpisodeTime,
      audioTracks,
      subtitles,
    } = body as {
      seasonId?: string;
      episodeNumber?: number | string;
      title?: string | null;
      videoUrl?: string;
      thumbnail?: string | null;
      duration?: number | string | null;
      introStart?: number | string | null;
      introEnd?: number | string | null;
      nextEpisodeTime?: number | string | null;
      audioTracks?: AudioInput[];
      subtitles?: SubtitleInput[];
    };

    if (!seasonId || !episodeNumber || !videoUrl) {
      return NextResponse.json(
        { error: "กรุณาเลือก Season พร้อมกรอกลำดับตอนและลิงก์วิดีโอ" },
        { status: 400 }
      );
    }

    const validAudioTracks = (audioTracks ?? []).filter(
      (track) =>
        (track.language === "THAI" || track.language === "JAPANESE") &&
        typeof track.url === "string" &&
        track.url.trim().length > 0
    );

    const validSubtitles = (subtitles ?? []).filter(
      (track) =>
        ["THAI", "ENGLISH", "JAPANESE"].includes(track.language) &&
        typeof track.url === "string" &&
        track.url.trim().length > 0
    );

    const episode = await prisma.episode.create({
      data: {
        animeId: anime.id,
        seasonId,
        episodeNumber: Number(episodeNumber),
        title,
        videoUrl,
        thumbnail,
        duration:
          duration === null || duration === "" || duration === undefined
            ? null
            : Number(duration),
        introStart:
          introStart === null || introStart === "" || introStart === undefined
            ? null
            : Number(introStart),
        introEnd:
          introEnd === null || introEnd === "" || introEnd === undefined
            ? null
            : Number(introEnd),
        nextEpisodeTime:
          nextEpisodeTime === null ||
          nextEpisodeTime === "" ||
          nextEpisodeTime === undefined
            ? null
            : Number(nextEpisodeTime),
        audioTracks: {
          create: validAudioTracks.map((track) => ({
            language: track.language,
            url: track.url.trim(),
            label:
              track.label?.trim() ||
              (track.language === "THAI" ? "พากย์ไทย" : "พากย์ญี่ปุ่น"),
          })),
        },
        subtitles: {
          create: validSubtitles.map((track) => ({
            language: track.language,
            url: track.url.trim(),
            label:
              track.label?.trim() ||
              ({ THAI: "ไทย", ENGLISH: "English", JAPANESE: "日本語" } as const)[
                track.language
              ],
          })),
        },
      },
      include: {
        audioTracks: true,
        subtitles: true,
      },
    });

    return NextResponse.json(episode, { status: 201 });
  } catch (error: unknown) {
    console.error(error);

    const message =
      typeof error === "object" &&
      error &&
      "code" in error &&
      (error as { code?: string }).code === "P2002"
        ? "ตอนนี้มีลำดับตอนซ้ำกับตอนที่มีอยู่แล้ว"
        : "เพิ่มตอนไม่สำเร็จ";

    return NextResponse.json({ error: message }, { status: 500 });
  }
}
