import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import slugify from "slugify";

// PUT /api/anime/[slug]
export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;
    const body = await req.json();

    const currentAnime = await prisma.anime.findUnique({
      where: {
        slug,
      },
    });

    if (!currentAnime) {
      return NextResponse.json(
        {
          error: "ไม่พบอนิเมะ",
        },
        {
          status: 404,
        }
      );
    }

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

    let newSlug = baseSlug;
    let count = 1;

    while (true) {
      const exists = await prisma.anime.findFirst({
        where: {
          slug: newSlug,
          NOT: {
            id: currentAnime.id,
          },
        },
      });

      if (!exists) break;

      newSlug = `${baseSlug}-${count}`;
      count++;
    }

    const anime = await prisma.anime.update({
      where: {
        id: currentAnime.id,
      },
      data: {
        title,
        slug: newSlug,
        titleEn,
        description,
        coverImage,
        bannerImage,
        genres,
        status,
        releaseYear: releaseYear ? Number(releaseYear) : null,
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
      {
        error: "ไม่สามารถแก้ไขอนิเมะได้",
      },
      {
        status: 500,
      }
    );
  }
}

// DELETE /api/anime/[slug]
export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;

    const currentAnime = await prisma.anime.findUnique({
      where: {
        slug,
      },
    });

    if (!currentAnime) {
      return NextResponse.json(
        {
          error: "ไม่พบอนิเมะ",
        },
        {
          status: 404,
        }
      );
    }

    await prisma.anime.delete({
      where: {
        id: currentAnime.id,
      },
    });

    return NextResponse.json({
      success: true,
    });
  } catch (error) {
    console.error(error);

    return NextResponse.json(
      {
        error: "ลบอนิเมะไม่สำเร็จ",
      },
      {
        status: 500,
      }
    );
  }
}