"use client";

import { useRef } from "react";
import AnimeCard from "./AnimeCard";

type AnimeItem = {
  id: string;
  title: string;
  coverImage?: string | null;
  releaseYear?: number | null;
  status: "ONGOING" | "COMPLETED";
  genres?: string[];
  rating?: number | null;
  description?: string | null;
};

type Props = {
  title: string;
  items: AnimeItem[];
};

export default function AnimeRow({ title, items }: Props) {
  const rowRef = useRef<HTMLDivElement>(null);

  if (items.length === 0) return null;

  const scroll = (dir: number) => {
    rowRef.current?.scrollBy({
      left: dir * 850,
      behavior: "smooth",
    });
  };

  return (
    <section className="relative mb-16">

      {/* Header */}
      <div className="flex items-center justify-between px-8 md:px-12 lg:px-16 mb-5">

        <div className="flex items-center gap-4">

          <h2 className="text-3xl font-extrabold tracking-tight text-white">
            {title}
          </h2>

          <button
            className="
              hidden
              md:block
              text-sm
              font-medium
              text-zinc-400
              transition
              hover:text-[#ff5d73]
            "
          >
            ดูทั้งหมด →
          </button>

        </div>

        <div className="flex items-center gap-2">

          <button
            onClick={() => scroll(-1)}
            className="
              flex
              h-9
              w-9
              items-center
              justify-center
              rounded-full
              bg-white/10
              text-white
              backdrop-blur-md
              transition-all
              duration-200
              hover:bg-[#ff5d73]
              hover:scale-110
            "
          >
            ‹
          </button>

          <button
            onClick={() => scroll(1)}
            className="
              flex
              h-9
              w-9
              items-center
              justify-center
              rounded-full
              bg-white/10
              text-white
              backdrop-blur-md
              transition-all
              duration-200
              hover:bg-[#ff5d73]
              hover:scale-110
            "
          >
            ›

          </button>

        </div>

      </div>

      {/* Row */}
      <div className="relative">

        {/* Left Fade */}
        <div className="pointer-events-none absolute left-0 top-0 z-10 h-full w-24 bg-gradient-to-r from-[#09090f] via-[#09090f]/80 to-transparent" />

        {/* Right Fade */}
        <div className="pointer-events-none absolute right-0 top-0 z-10 h-full w-24 bg-gradient-to-l from-[#09090f] via-[#09090f]/80 to-transparent" />

        <div
          ref={rowRef}
          className="
            flex
            gap-6
            overflow-x-auto
            overflow-y-hidden
            scroll-smooth
            scrollbar-hide
            px-8
            md:px-12
            lg:px-16
            pb-5
          "
        >
          {items.map((anime) => (
            <AnimeCard
              key={anime.id}
              anime={anime}
            />
          ))}
        </div>

      </div>

    </section>
  );
}
