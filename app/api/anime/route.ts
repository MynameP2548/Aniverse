import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import slugify from "slugify";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const anime = await prisma.anime.findMany({
      orderBy: { createdAt: "desc" },
      include: { episodes: true },
    });
    return NextResponse.json(anime);
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "ไม่สามารถโหลดรายการอนิเมะได้" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
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

    if (!title) {
      return NextResponse.json({ error: "กรุณากรอกชื่อเรื่อง" }, { status: 400 });
    }

    const baseSlug = slugify(titleEn || title, {
  lower: true,
  strict: true,
  trim: true,
});

let slug = baseSlug;

let count = 1;

while (await prisma.anime.findUnique({ where: { slug } })) {
  slug = `${baseSlug}-${count}`;
  count++;
}

    const anime = await prisma.anime.create({
data: {
  title,
  slug,

  titleEn,

  description,

  coverImage,

  bannerImage,

  genres: genres || [],

  status: status || "ONGOING",

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

    return NextResponse.json(anime, { status: 201 });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "ไม่สามารถเพิ่มอนิเมะได้" }, { status: 500 });
  }
}