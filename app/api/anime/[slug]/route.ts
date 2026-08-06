import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import slugify from "slugify";

// PUT /api/anime/[id] - update an existing anime (admin only)
export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await req.json();
const {
  title,
  titleEn,
  description,

  coverImage,
  bannerImage,

  genres,

  status,

  releaseYear,

  rating,

  featured,

  heroTrailer,

  heroLogo,

  heroOrder,
} = body;
const baseSlug = slugify(titleEn || title, {
  lower: true,
  strict: true,
  trim: true,
});

let slug = baseSlug;

let count = 1;

while (true) {
  const exists = await prisma.anime.findFirst({
    where: {
      slug,
      NOT: {
        id,
      },
    },
  });

  if (!exists) break;

  slug = `${baseSlug}-${count}`;
  count++;
}
    const anime = await prisma.anime.update({
      where: { id },
data: {
  title,
  slug,

  titleEn,

  description,

  coverImage,

  bannerImage,

  genres,

  status,

  releaseYear: releaseYear
    ? Number(releaseYear)
    : null,

  rating:
    rating !== null &&
    rating !== undefined &&
    rating !== ""
      ? Number(rating)
      : null,

  featured: featured ?? false,

  heroTrailer,

  heroLogo,

  heroOrder:
    heroOrder !== null &&
    heroOrder !== undefined &&
    heroOrder !== ""
      ? Number(heroOrder)
      : 0,
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
  req: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;

  await prisma.anime.delete({
    where: {
      slug,
    },
  });

  return NextResponse.json({ success: true });
}