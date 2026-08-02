"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

type Props = {
  anime: {
    id: string;
    title: string;
    description?: string | null;
    bannerImage?: string | null;
    coverImage?: string | null;
    genres: string[];
    releaseYear?: number | null;
    rating?: number | null;
    rating?: number | null;
    featured?: boolean;
    heroTrailer?: string | null;
    heroLogo?: string | null;
    heroOrder?: number | null;
  };
};

export default function Hero({ anime }: Props) {
  const backdrop = anime.bannerImage || anime.coverImage;
  const trailer = anime.heroTrailer;

  return (
    <section className="relative h-[82vh] min-h-[620px] w-full overflow-hidden">
{trailer ? (
<video
  className="absolute inset-0 h-full w-full object-cover scale-[1.03]"
  src={trailer}
  autoPlay
  muted
  loop
  playsInline
  preload="auto"
/>
) : (
  backdrop && (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={backdrop}
      alt={anime.title}
      className="absolute inset-0 h-full w-full object-cover scale-[1.03]"
    />
  )
)}

      {/* Overlay */}
      <div className="absolute inset-0 bg-black/18" />

      {/* Bottom */}
      <div className="absolute inset-0 bg-gradient-to-t from-[#09090f] via-[#09090f]/10 to-transparent" />

      {/* Left */}
      <div className="absolute inset-0 bg-gradient-to-r from-black/85 via-black/45 to-transparent" />

      {/* Right */}
      <div className="absolute inset-0 bg-gradient-to-l from-black/25 via-transparent to-transparent" />

      <div
        className="
          relative
          mx-auto
          flex
          h-full
          w-full
          max-w-[1500px]
          items-center
          px-6
          md:px-8
          lg:px-12
          xl:px-16
          2xl:px-20
        "
      >
        <div className="max-w-[680px]">

          {/* Rating */}

          {(anime.rating || anime.releaseYear) && (
            <div className="mb-5 flex items-center gap-3 text-base">

              {anime.rating && anime.rating > 0 && (
                <>
                  <span className="text-yellow-400">★</span>

                  <span className="font-bold text-yellow-400">
                    {anime.rating.toFixed(1)}
                  </span>

                  <span className="text-white/40">•</span>
                </>
              )}

              {anime.releaseYear && (
                <span className="text-white/70">
                  {anime.releaseYear}
                </span>
              )}

            </div>
          )}

          {/* Title */}

{anime.heroLogo ? (
  // eslint-disable-next-line @next/next/no-img-element
  <img
    src={anime.heroLogo}
    alt={anime.title}
className="
  mb-6
  max-h-56
  lg:max-h-64
  w-auto
  object-contain
  drop-shadow-[0_20px_40px_rgba(0,0,0,.9)]
"
  />
) : (
  <h1
    className="
      max-w-[720px]
      text-4xl
      sm:text-5xl
      lg:text-6xl
      xl:text-7xl
      font-black
      leading-[1.08]
      tracking-tight
      text-white
      drop-shadow-[0_8px_30px_rgba(0,0,0,.75)]
    "
  >
    {anime.title}
  </h1>
)}

          {/* Genres */}

          {anime.genres.length > 0 && (
            <div className="mt-6 flex flex-wrap gap-3">
              {anime.genres.slice(0, 3).map((g) => (
                <span
                  key={g}
                  className="
                    rounded-full
                    border
                    border-white/15
                    bg-white/10
                    px-4
                    py-1.5
                    text-sm
                    text-white
                    backdrop-blur-md
                  "
                >
                  {g}
                </span>
              ))}
            </div>
          )}

          {/* Description */}

          {anime.description && (
            <p
              className="
                mt-7
                max-w-[620px]
                text-[16px]
                leading-8
                text-white/80
                line-clamp-3
                xl:text-lg
              "
            >
              {anime.description}
            </p>
          )}

          {/* Buttons */}

          <div className="mt-10 flex flex-wrap gap-4">

            <Link
              href={`/anime/${anime.id}`}
              className="
                inline-flex
                items-center
                gap-3
                rounded-xl
                bg-white
                px-8
                py-4
                text-base
                font-bold
                text-black
                transition-all
                duration-300
                hover:scale-105
                hover:bg-neutral-200
              "
            >
              <svg
                className="h-5 w-5"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path d="M6 4l10 6-10 6V4z" />
              </svg>

              ดูเลย
            </Link>

            <Link
              href={`/anime/${anime.id}`}
              className="
                inline-flex
                items-center
                rounded-xl
                border
                border-white/15
                bg-white/10
                px-8
                py-4
                text-base
                font-semibold
                text-white
                backdrop-blur-md
                transition-all
                duration-300
                hover:bg-white/20
                hover:scale-105
              "
            >
              รายละเอียด
            </Link>

          </div>

        </div>
      </div>
    </section>
  );
}
