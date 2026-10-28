"use client";

import { useRef } from "react";
import { ChevronLeft, ChevronRight, Sparkles } from "lucide-react";
import AnimeCard from "./AnimeCard";

type AnimeItem = {
  id: string;
  slug: string;
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
    const row = rowRef.current;
    if (!row) return;
    row.scrollBy({ left: dir * Math.max(row.clientWidth * 0.82, 320), behavior: "smooth" });
  };

  return (
    <section className="anime-shelf group/shelf mb-1">
      <div className="mx-auto mb-4 flex w-full max-w-[1700px] items-end justify-between gap-4 px-4 sm:mb-5 sm:px-6 xl:px-10">
        <div className="min-w-0">
          <div className="mb-1.5 flex items-center gap-2 text-[9px] font-bold uppercase tracking-[0.25em] text-violet-200/55 sm:text-[10px]">
            <Sparkles size={12} strokeWidth={1.8} aria-hidden="true" />
            Curated for you
          </div>
          <h2 className="text-xl font-extrabold tracking-tight text-white sm:text-2xl lg:text-[27px]">{title}</h2>
          <div className="mt-2 h-[2px] w-12 rounded-full bg-gradient-to-r from-violet-400 via-indigo-400 to-sky-400 opacity-80 transition-all duration-300 group-hover/shelf:w-20" />
        </div>
        <div className="flex shrink-0 items-center gap-2">
          <span className="mr-1 hidden text-xs text-white/30 sm:inline">{items.length} เรื่อง</span>
          <button type="button" onClick={() => scroll(-1)} aria-label={`เลื่อน ${title} ไปทางซ้าย`} className="flex h-9 w-9 items-center justify-center rounded-full border border-white/10 bg-white/[0.035] text-white/55 transition hover:border-violet-300/35 hover:bg-violet-500/15 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-300 sm:h-10 sm:w-10">
            <ChevronLeft size={19} aria-hidden="true" />
          </button>
          <button type="button" onClick={() => scroll(1)} aria-label={`เลื่อน ${title} ไปทางขวา`} className="flex h-9 w-9 items-center justify-center rounded-full border border-white/10 bg-white/[0.035] text-white/55 transition hover:border-violet-300/35 hover:bg-violet-500/15 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-300 sm:h-10 sm:w-10">
            <ChevronRight size={19} aria-hidden="true" />
          </button>
        </div>
      </div>
      <div className="relative">
        <div aria-hidden="true" className="pointer-events-none absolute inset-y-0 left-0 z-10 w-5 bg-gradient-to-r from-[#090a17] to-transparent sm:w-8 lg:w-12" />
        <div aria-hidden="true" className="pointer-events-none absolute inset-y-0 right-0 z-10 w-5 bg-gradient-to-l from-[#090a17] to-transparent sm:w-8 lg:w-12" />
        <div ref={rowRef} className="scrollbar-hide flex items-start gap-3 overflow-x-auto overflow-y-hidden scroll-smooth px-4 pb-5 pt-1 sm:gap-4 sm:px-6 sm:pb-7 lg:gap-[18px] xl:px-10">
          {items.map((anime, index) => <AnimeCard key={anime.id} anime={anime} priority={index < 4} />)}
        </div>
      </div>
    </section>
  );
}
