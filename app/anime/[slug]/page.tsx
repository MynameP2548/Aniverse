import prisma from "@/lib/prisma";
import Navbar from "@/components/Navbar";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { auth } from "@/auth";
import ReviewSection from "@/components/ReviewSection";
import SeasonSelector from "@/components/SeasonSelector";
import Player from "@/components/player";
import AnimeWatch from "@/components/AnimeWatch";
import FavoriteButton from "@/components/FavoriteButton";

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

    <div className="anime-detail-page min-h-screen text-[#e8e6f0]">
      <Navbar />

    <main className="pt-16">

  {/* HERO */}
  <section className="anime-detail-hero relative min-h-[620px] overflow-hidden sm:min-h-[680px] lg:min-h-[720px]">

    {(anime.bannerImage || anime.coverImage) && (
      <>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={anime.bannerImage || anime.coverImage || ""}
          alt={anime.title}
          className="absolute inset-0 h-full w-full object-cover"
        />

        <div className="absolute inset-0 bg-[#070815]/20" />

        <div className="absolute inset-0 bg-gradient-to-r from-[#080914] via-[#080914]/75 to-[#080914]/10" />

        <div className="absolute inset-0 bg-gradient-to-t from-[#080914] via-[#080914]/35 to-transparent" />
        <div className="anime-detail-aurora absolute inset-0" />
      </>
    )}

    <div className="relative z-20 mx-auto flex min-h-[620px] max-w-7xl items-end px-5 pb-16 pt-28 sm:min-h-[680px] sm:px-8 sm:pb-20 lg:min-h-[720px] lg:items-center lg:px-10 lg:py-24">

      <div className="anime-detail-copy max-w-[720px]">
        <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-violet-300/20 bg-[#101126]/70 px-3 py-1.5 text-xs font-bold uppercase tracking-[.18em] text-violet-200 shadow-lg shadow-violet-950/20 backdrop-blur-xl">
          <span className="h-1.5 w-1.5 rounded-full bg-sky-300 shadow-[0_0_12px_rgba(125,211,252,.9)]" /> ANIVERSE ORIGINAL EXPERIENCE
        </div>
        {/* Silently records that the logged-in user watched this episode */}

{/* Title + Meta */}
<div className="mb-8">
  {anime.heroLogo ? (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={anime.heroLogo}
      alt={anime.title}
      className="mb-7 max-h-32 max-w-full object-contain object-left sm:max-h-40 lg:max-h-48"
    />
  ) : (
    <h1 className="anime-detail-title mb-5 text-4xl font-black leading-[1.08] tracking-tight text-white sm:text-5xl lg:text-7xl">
      {anime.title}
    </h1>
  )}

  {currentEpisode && (
    <p className="mb-5 text-base font-semibold text-[#8b5cf6]">
      กำลังดู EP {currentEpisode.episodeNumber}
      {currentEpisode.title && ` • ${currentEpisode.title}`}
    </p>
  )}

  <div className="mb-6 flex flex-wrap items-center gap-3">
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

  <div className="mb-7 flex flex-wrap gap-2">
    {anime.genres.map((genre) => (
      <span
        key={genre}
        className="rounded-full border border-violet-200/15 bg-[#15162b]/75 px-3.5 py-1.5 text-xs font-semibold text-violet-100 shadow-sm backdrop-blur-xl sm:text-sm"
      >
        {genre}
      </span>
    ))}
  </div>

  {anime.description && (
    <p className="mb-8 max-w-[620px] text-base leading-8 text-slate-200/85 sm:text-lg sm:leading-9">
      {anime.description}
    </p>
  )}

  <div className="flex flex-wrap gap-3">
    <Link
  href={`/anime/${anime.slug}?season=${activeSeason?.id}&ep=${
    seasonEpisodes[0]?.episodeNumber ?? 1
  }`}
      className="inline-flex items-center justify-center gap-3 rounded-2xl bg-gradient-to-r from-violet-500 via-violet-500 to-blue-500 px-6 py-3.5 font-bold text-white shadow-xl shadow-violet-950/40 transition duration-300 hover:-translate-y-0.5 hover:brightness-110 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-300 sm:px-8 sm:py-4"
    >
      ▶ ดูตอนแรก
    </Link>

    <FavoriteButton animeId={anime.slug} isLoggedIn={!!session?.user} />
  </div>
</div>

</div>

</div>

</section>

  <div className="anime-detail-content mx-auto max-w-7xl px-4 pb-14 pt-8 sm:px-6 sm:pb-20 sm:pt-10 lg:px-8">
    <div className="anime-season-heading mb-6 flex flex-col gap-4 rounded-2xl border border-white/[0.07] bg-gradient-to-r from-white/[0.035] to-violet-500/[0.035] p-5 sm:flex-row sm:items-center sm:justify-between sm:p-6">
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
    <section className="anime-watch-panel mb-10 rounded-3xl border border-violet-300/[0.12] bg-gradient-to-br from-[#111226]/95 via-[#0d0e1c]/95 to-[#10152a]/90 p-3 shadow-2xl shadow-black/20 sm:mb-14 sm:p-5 lg:p-6">
  <h2 className="anime-section-title mb-5 text-xl font-bold text-white sm:text-2xl">
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