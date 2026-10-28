import Link from "next/link";
import { ArrowUpRight, Play, Star } from "lucide-react";

type Props = {
  anime: {
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
  priority?: boolean;
};

export default function AnimeCard({ anime, priority = false }: Props) {
  return (
    <article className="anime-card w-[142px] shrink-0 sm:w-[164px] md:w-[184px] xl:w-[202px] 2xl:w-[218px]">
      <Link href={`/anime/${anime.slug}`} className="group/card block rounded-2xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-300 focus-visible:ring-offset-4 focus-visible:ring-offset-[#090a17]">
        <div className="anime-poster relative aspect-[2/3] overflow-hidden rounded-2xl border border-white/[0.09] bg-[#111225] shadow-[0_10px_28px_rgba(0,0,0,0.18)] transition duration-500 ease-out group-hover/card:-translate-y-1.5 group-hover/card:border-violet-300/40 group-hover/card:shadow-[0_20px_46px_rgba(65,42,145,0.24)]">
          {anime.coverImage ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={anime.coverImage} alt={anime.title} loading={priority ? "eager" : "lazy"} fetchPriority={priority ? "high" : "auto"} className="h-full w-full object-cover transition-transform duration-700 ease-out group-hover/card:scale-[1.055]" />
          ) : (
            <div className="flex h-full flex-col items-center justify-center gap-3 bg-[radial-gradient(ellipse_at_top,rgba(124,58,237,.18),transparent_60%),linear-gradient(145deg,#17182f,#0c0d19)] px-3 text-center text-xs text-white/35"><span className="text-3xl text-violet-200/40">✦</span>ไม่มีรูปปก</div>
          )}
          <div aria-hidden="true" className="absolute inset-0 bg-gradient-to-t from-[#050610] via-black/5 to-black/10 opacity-90 transition-opacity duration-300 group-hover/card:opacity-100" />
          <div aria-hidden="true" className="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-violet-950/30 to-transparent opacity-0 transition-opacity duration-300 group-hover/card:opacity-100" />

          {anime.status === "ONGOING" && (
            <span className="absolute left-2.5 top-2.5 inline-flex items-center gap-1.5 rounded-full border border-emerald-200/20 bg-[#071b19]/75 px-2.5 py-1 text-[9px] font-bold tracking-wide text-emerald-200 shadow-lg backdrop-blur-md sm:left-3 sm:top-3 sm:text-[10px]">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-300 shadow-[0_0_8px_rgba(110,231,183,.7)]" /> กำลังฉาย
            </span>
          )}
          {anime.rating != null && anime.rating > 0 && (
            <span className="absolute bottom-3 left-2.5 inline-flex items-center gap-1 rounded-full border border-white/10 bg-black/55 px-2.5 py-1 text-[10px] font-bold text-amber-200 backdrop-blur-md sm:left-3 sm:text-xs">
              <Star size={11} fill="currentColor" aria-hidden="true" /> {anime.rating.toFixed(1)}
            </span>
          )}
          <span aria-hidden="true" className="absolute right-3 top-3 flex h-9 w-9 translate-y-1 items-center justify-center rounded-full border border-white/20 bg-black/40 text-white opacity-0 shadow-xl backdrop-blur-md transition-all duration-300 group-hover/card:translate-y-0 group-hover/card:opacity-100">
            <Play size={15} fill="currentColor" className="ml-0.5" />
          </span>
          <span aria-hidden="true" className="absolute bottom-3 right-3 flex h-7 w-7 translate-y-1 items-center justify-center rounded-full bg-gradient-to-br from-violet-400 to-blue-500 text-white opacity-0 shadow-lg transition-all duration-300 group-hover/card:translate-y-0 group-hover/card:opacity-100">
            <ArrowUpRight size={14} />
          </span>
        </div>
        <div className="px-0.5 pt-3 sm:pt-3.5">
          <h3 className="line-clamp-2 min-h-[2.75rem] text-[13px] font-bold leading-[1.4] text-white/90 transition-colors duration-300 group-hover/card:text-violet-200 sm:text-[15px]">{anime.title}</h3>
          <div className="mt-1.5 flex min-w-0 items-center gap-2 text-[10px] text-white/40 sm:text-xs">
            {anime.releaseYear && <span className="shrink-0">{anime.releaseYear}</span>}
            {anime.releaseYear && anime.genres && anime.genres.length > 0 && <span className="h-1 w-1 shrink-0 rounded-full bg-violet-300/60" />}
            {anime.genres && anime.genres.length > 0 && <span className="truncate">{anime.genres.slice(0, 2).join(" · ")}</span>}
          </div>
        </div>
      </Link>
    </article>
  );
}
