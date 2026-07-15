import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

// PUT /api/anime/[id] - update an existing anime (admin only)
export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await req.json();
    const { title, titleEn, description, coverImage, bannerImage, genres, status, releaseYear } = body;

    const anime = await prisma.anime.update({
      where: { id },
      data: {
        title,
        titleEn,
        description,
        coverImage,
        bannerImage,
        genres,
        status,
        releaseYear: releaseYear ? Number(releaseYear) : null,
      },
    });

    return NextResponse.json(anime);
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "ไม่สามารถแก้ไขอนิเมะได้" },
      { status: 500 }
    );
  }
}

// DELETE /api/anime/[id] - delete an anime (admin only)
export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    await prisma.anime.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "ไม่สามารถลบอนิเมะได้" },
      { status: 500 }
    );
  }
}