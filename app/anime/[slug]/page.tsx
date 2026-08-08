import prisma from "@/lib/prisma";
import Navbar from "@/components/Navbar";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { auth } from "@/auth";
import ReviewSection from "@/components/ReviewSection";
import SeasonSelector from "@/components/SeasonSelector";
import Player from "@/components/player";
import AnimeWatch from "@/components/AnimeWatch";

export const dynamic = "force-dynamic";

// Direct video files (e.g. .mp4 demo/sample clips) need a <video> tag.
// Embed pages (YouTube /embed/, Vimeo player, etc.) need an <iframe>.
function isPlayableVideo(url: string): boolean {
  return /\.(mp4|m3u8|webm|ogg|mov)(\?.*)?$/i.test(url);
}

type Props = {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{
    ep?: string;
    season?: string;
  }>;
};

import type { Metadata } from "next";

export async function generateMetadata(
  { params }: Props
): Promise<Metadata> {
  const { slug } = await params;

  const anime = await prisma.anime.findUnique({
    where: {
      slug,
    },
    include: {
      _count: {
        select: {
          episodes: true,
        },
      },
    },
  });

  if (!anime) {
    return {
      title: "ไม่พบอนิเมะ",
      description: "ไม่พบอนิเมะที่คุณกำลังค้นหา",
    };
  }

  const episodeCount = anime._count.episodes;

  const title =
    episodeCount > 0
      ? `${anime.title} ตอนที่ 1-${episodeCount}`
      : anime.title;

  const description =
    anime.description ||
    `ดู ${anime.title} ออนไลน์ พร้อมข้อมูลอนิเมะและตอนต่าง ๆ บน Aniverse${
      episodeCount > 0 ? ` รวม ${episodeCount} ตอน` : ""
    }`;

  return {
    title,

    description,

    keywords: [
      anime.title,
      anime.titleEn ?? "",
      "ดูอนิเมะ",
      "อนิเมะออนไลน์",
      "anime online",
      "ซับไทย",
      "พากย์ไทย",
      "Aniverse",
    ].filter(Boolean),

    alternates: {
      canonical: `https://aniverse-wheat.vercel.app/anime/${anime.slug}`,
    },

    openGraph: {
      title: `${title} | Aniverse`,
      description,
      url: `https://aniverse-wheat.vercel.app/anime/${anime.slug}`,
      siteName: "Aniverse",
      locale: "th_TH",
      type: "website",

      images: anime.coverImage
        ? [
            {
              url: anime.coverImage,
              width: 1200,
              height: 630,
              alt: anime.title,
            },
          ]
        : [],
    },

    twitter: {
      card: "summary_large_image",
      title: `${title} | Aniverse`,
      description,
      images: anime.coverImage ? [anime.coverImage] : [],
    },
  };
}

export default async function AnimeDetailPage({ params, searchParams }: Props) {
const { slug } = await params;
const { ep, season } = await searchParams;

const session = await auth();
const anime = await prisma.anime.findUnique({
where: {
  slug,
},
  include: {
    episodes: {
      include: {
        season: true,
      },
      orderBy: [
        {
          seasonId: "asc",
        },
        {
          episodeNumber: "asc",
        },
      ],
    },
  },
});

if (!anime) notFound();
const seasons = await prisma.season.findMany({
  where: {
    animeId: anime.id,
  },
});

const activeSeason =
  seasons.find((s) => s.id === season) ??
  seasons[0];

const seasonEpisodes = anime.episodes.filter(
  (episode) => episode.seasonId === activeSeason?.id
);

const currentEpisode = ep
  ? seasonEpisodes.find(
      (episode) => episode.episodeNumber === Number(ep)
    ) ?? seasonEpisodes[0]
  : seasonEpisodes[0];
  const currentIndex = seasonEpisodes.findIndex(
  (episode) => episode.id === currentEpisode?.id
);

const nextEpisode =
  currentIndex >= 0 &&
  currentIndex < seasonEpisodes.length - 1
    ? seasonEpisodes[currentIndex + 1]
    : null;
  if (!ep && activeSeason && currentEpisode) {
  redirect(
    `/anime/${anime.slug}?season=${activeSeason.id}&ep=${currentEpisode.episodeNumber}`
  );
}

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "TVSeries",

  name: anime.title,
  alternateName: anime.titleEn || undefined,

  description: anime.description || "",

  image: anime.coverImage || undefined,

  url: `https://aniverse-wheat.vercel.app/anime/${anime.slug}`,

  genre: anime.genres,

  datePublished: anime.releaseYear
    ? `${anime.releaseYear}-01-01`
    : undefined,

  aggregateRating: anime.rating
    ? {
        "@type": "AggregateRating",
        ratingValue: anime.rating,
        bestRating: 10,
        worstRating: 0,
      }
    : undefined,
};

return (
  <>
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{
        __html: JSON.stringify(jsonLd),
      }}
    />

    <div className="min-h-screen bg-[#0b0b12] text-[#e8e6f0]">
      <Navbar />

    <main className="pt-16">

  {/* HERO */}
  <section className="relative h-[75vh] min-h-[650px] overflow-hidden">

    {(anime.bannerImage || anime.coverImage) && (
      <>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={anime.bannerImage || anime.coverImage || ""}
          alt={anime.title}
          className="absolute inset-0 h-full w-full object-cover"
        />

        <div className="absolute inset-0 bg-black/30" />

        <div className="absolute inset-0 bg-gradient-to-r from-[#09090f] via-[#09090f]/55 to-transparent" />

        <div className="absolute inset-0 bg-gradient-to-t from-[#09090f] via-[#09090f]/20 to-transparent" />
      </>
    )}

    <div className="relative z-20 mx-auto flex h-full max-w-7xl items-center px-6">

      <div className="max-w-[700px]">
        {/* Silently records that the logged-in user watched this episode */}

{/* Title + Meta */}
<div className="mb-8">
  {anime.heroLogo ? (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={anime.heroLogo}
      alt={anime.title}
      className="mb-8 max-h-48 object-contain"
    />
  ) : (
    <h1 className="mb-6 text-6xl font-black text-white">
      {anime.title}
    </h1>
  )}

  {currentEpisode && (
    <p className="mb-5 text-base font-semibold text-[#ff5d73]">
      กำลังดู EP {currentEpisode.episodeNumber}
      {currentEpisode.title && ` • ${currentEpisode.title}`}
    </p>
  )}

  <div className="mb-6 flex flex-wrap items-center gap-4">
    {anime.rating && (
      <div className="flex items-center gap-2">
        <span className="text-xl text-yellow-400">★</span>
        <span className="font-bold text-yellow-400">
          {anime.rating.toFixed(1)}
        </span>
      </div>
    )}

    {anime.releaseYear && (
      <span className="rounded-full bg-white/10 px-3 py-1 text-sm text-white/80">
        {anime.releaseYear}
      </span>
    )}

    <span
      className={`rounded-full px-3 py-1 text-sm font-medium ${
        anime.status === "ONGOING"
          ? "bg-green-500/20 text-green-300"
          : "bg-zinc-700 text-zinc-300"
      }`}
    >
      {anime.status === "ONGOING" ? "กำลังฉาย" : "จบแล้ว"}
    </span>
  </div>

  <div className="mb-8 flex flex-wrap gap-3">
    {anime.genres.map((genre) => (
      <span
        key={genre}
        className="rounded-full border border-white/15 bg-white/10 px-4 py-1.5 text-sm text-white backdrop-blur"
      >
        {genre}
      </span>
    ))}
  </div>

  {anime.description && (
    <p className="mb-8 max-w-[650px] text-lg leading-9 text-white/80">
      {anime.description}
    </p>
  )}

  <div className="flex flex-wrap gap-4">
    <Link
  href={`/anime/${anime.slug}?season=${activeSeason?.id}&ep=${
    seasonEpisodes[0]?.episodeNumber ?? 1
  }`}
      className="rounded-xl bg-white px-8 py-4 font-bold text-black transition hover:bg-neutral-200"
    >
      ▶ ดูตอนแรก
    </Link>

    <button
      className="rounded-xl border border-white/15 bg-white/10 px-8 py-4 font-semibold text-white backdrop-blur transition hover:bg-white/20"
    >
      + เพิ่มรายการ
    </button>
  </div>
</div>

</div>

</div>

</section>

  <div className="max-w-7xl mx-auto px-6 py-12">
    <div className="mb-6 flex items-center justify-between">
  <div>
    <h2 className="text-2xl font-bold text-white">
      {activeSeason?.title ??
        `Season ${activeSeason?.seasonNumber}`}
    </h2>

    <p className="mt-1 text-sm text-white/50">
      {seasonEpisodes.length} ตอน
    </p>
  </div>

<SeasonSelector
  animeId={anime.id}
  seasons={seasons}
  selected={activeSeason?.id}
/>
</div>
    <section className="mb-14">
  <h2 className="mb-5 text-2xl font-bold text-white">
    กำลังรับชม
  </h2>

<AnimeWatch
  anime={{
    slug: anime.slug!,
    title: anime.title,
    bannerImage: anime.bannerImage,
    coverImage: anime.coverImage,
  }}
  seasons={seasons}
  activeSeason={activeSeason!}
  episodes={seasonEpisodes}
  initialEpisode={currentEpisode!}
/>

  {currentEpisode && (
    <div className="mt-5">
      <h3 className="text-xl font-bold text-white">
        EP {currentEpisode.episodeNumber}
        {currentEpisode.title && ` • ${currentEpisode.title}`}
      </h3>
    </div>
  )}
</section>


<ReviewSection
  animeSlug={anime.slug!}
  isLoggedIn={!!session?.user}
  currentUserId={session?.user?.id}
/>

        </div> {/* ปิด max-w-7xl */}

      </main>
    </div>
  </>
);
}