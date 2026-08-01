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
    if (!rowRef.current) return;

    rowRef.current.scrollBy({
      left: dir * rowRef.current.clientWidth * 0.8,
      behavior: "smooth",
    });
  };

  return (
    <section className="relative mb-20 group">

      {/* Header */}
      <div className="mx-auto flex w-full max-w-[1500px] items-center justify-between px-6 md:px-8 xl:px-12 2xl:px-16 mb-6">

        <div className="flex items-center gap-4">

          <h2 className="text-2xl md:text-3xl font-extrabold tracking-tight text-white">
            {title}
          </h2>

          <button
            className="
              hidden
              lg:block
              text-sm
              font-medium
              text-white/50
              transition
              hover:text-[#ff5d73]
            "
          >
            ดูทั้งหมด →
          </button>

        </div>

      </div>

      <div className="relative">

        {/* Left Fade */}
        <div className="pointer-events-none absolute left-0 top-0 z-20 h-full w-24 bg-gradient-to-r from-[#09090f] via-[#09090f]/85 to-transparent" />

        {/* Right Fade */}
        <div className="pointer-events-none absolute right-0 top-0 z-20 h-full w-24 bg-gradient-to-l from-[#09090f] via-[#09090f]/85 to-transparent" />

        {/* Left Button */}
        <button
          onClick={() => scroll(-1)}
          className="
            absolute
            left-3
            top-1/2
            z-30
            hidden
            -translate-y-1/2
            items-center
            justify-center
            rounded-full
            bg-black/60
            backdrop-blur-md
            text-white
            h-12
            w-12
            opacity-0
            transition-all
            duration-300
            group-hover:flex
            group-hover:opacity-100
            hover:bg-[#ff5d73]
          "
        >
          ‹
        </button>

        {/* Right Button */}
        <button
          onClick={() => scroll(1)}
          className="
            absolute
            right-3
            top-1/2
            z-30
            hidden
            -translate-y-1/2
            items-center
            justify-center
            rounded-full
            bg-black/60
            backdrop-blur-md
            text-white
            h-12
            w-12
            opacity-0
            transition-all
            duration-300
            group-hover:flex
            group-hover:opacity-100
            hover:bg-[#ff5d73]
          "
        >
          ›
        </button>

        {/* Row */}
        <div
          ref={rowRef}
          className="
            flex
            gap-5
            overflow-x-auto
            overflow-y-hidden
            scroll-smooth
            scrollbar-hide
            px-6
            md:px-8
            xl:px-12
            2xl:px-16
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
