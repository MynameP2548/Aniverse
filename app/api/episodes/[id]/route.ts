import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

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

// PUT /api/episodes/[id] - update an episode (admin only)
export async function PUT(
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

    const audioWasSent = Array.isArray(audioTracks);
    const subtitlesWereSent = Array.isArray(subtitles);

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

    const episode = await prisma.$transaction(async (tx) => {
      const updated = await tx.episode.update({
        where: { id },
        data: {
          seasonId,
          episodeNumber:
            episodeNumber === undefined || episodeNumber === ""
              ? undefined
              : Number(episodeNumber),
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
        },
      });

      if (audioWasSent) {
        await tx.episodeAudio.deleteMany({ where: { episodeId: id } });
        if (validAudioTracks.length > 0) {
          await tx.episodeAudio.createMany({
            data: validAudioTracks.map((track) => ({
              episodeId: id,
              language: track.language,
              url: track.url.trim(),
              label:
                track.label?.trim() ||
                (track.language === "THAI" ? "พากย์ไทย" : "พากย์ญี่ปุ่น"),
            })),
          });
        }
      }

      if (subtitlesWereSent) {
        await tx.episodeSubtitle.deleteMany({ where: { episodeId: id } });
        if (validSubtitles.length > 0) {
          await tx.episodeSubtitle.createMany({
            data: validSubtitles.map((track) => ({
              episodeId: id,
              language: track.language,
              url: track.url.trim(),
              label:
                track.label?.trim() ||
                ({ THAI: "ไทย", ENGLISH: "English", JAPANESE: "日本語" } as const)[
                  track.language
                ],
            })),
          });
        }
      }

      return tx.episode.findUnique({
        where: { id },
        include: {
          audioTracks: true,
          subtitles: true,
        },
      });
    });

    return NextResponse.json(episode);
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "แก้ไขตอนไม่สำเร็จ" }, { status: 500 });
  }
}

// DELETE /api/episodes/[id] - delete an episode (admin only)
export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    await prisma.episode.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "ลบตอนไม่สำเร็จ" }, { status: 500 });
  }
}
