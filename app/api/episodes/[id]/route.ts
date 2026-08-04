import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

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
} = body;

    const episode = await prisma.episode.update({
      where: { id },
      data: {
  seasonId,

  episodeNumber: episodeNumber
    ? Number(episodeNumber)
    : undefined,

  title,
  videoUrl,
  thumbnail,

  duration: duration
    ? Number(duration)
    : null,
},
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
