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
    <section className="mb-14">

      {/* Header */}
      <div className="mx-auto flex w-full max-w-[1500px] items-center justify-between px-6 md:px-8 xl:px-12 2xl:px-16 mb-5">

        <h2 className="text-2xl md:text-3xl font-bold tracking-tight text-white">
          {title}
        </h2>

        <div className="flex items-center gap-2">

          <button
            onClick={() => scroll(-1)}
            className="
              flex
              h-10
              w-10
              items-center
              justify-center
              rounded-full
              bg-white/10
              text-white
              backdrop-blur-md
              transition-all
              duration-200
              hover:bg-[#ff5d73]
            "
          >
            ‹
          </button>

          <button
            onClick={() => scroll(1)}
            className="
              flex
              h-10
              w-10
              items-center
              justify-center
              rounded-full
              bg-white/10
              text-white
              backdrop-blur-md
              transition-all
              duration-200
              hover:bg-[#ff5d73]
            "
          >
            ›
          </button>

        </div>

      </div>

      {/* Row */}
      <div className="relative">

        {/* Left Fade */}
        <div className="pointer-events-none absolute left-0 top-0 z-10 h-full w-20 bg-gradient-to-r from-[#09090f] to-transparent" />

        {/* Right Fade */}
        <div className="pointer-events-none absolute right-0 top-0 z-10 h-full w-20 bg-gradient-to-l from-[#09090f] to-transparent" />

        <div
          ref={rowRef}
          className="
            flex
            items-start
            gap-5
            overflow-x-auto
            overflow-y-hidden
            scroll-smooth
            scrollbar-hide
            px-6
            md:px-8
            xl:px-12
            2xl:px-16
            pb-4
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
