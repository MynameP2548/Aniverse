import Link from "next/link";

type Props = {
  anime: {
    id: string;
    title: string;
    coverImage?: string | null;
    releaseYear?: number | null;
    status: "ONGOING" | "COMPLETED";
    genres?: string[];
    rating?: number | null;
    description?: string | null;
  };
};

export default function AnimeCard({ anime }: Props) {
  return (
    <div className="flex-shrink-0 w-[160px] md:w-[190px] self-start">
      <Link href={`/anime/${anime.id}`} className="group block">
        <div className="relative w-full aspect-[2/3] rounded-lg overflow-hidden bg-[#131320] border border-[#232335] group-hover:border-[#ff5d73]/50 transition-colors">
          {anime.coverImage ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={anime.coverImage}
              alt={anime.title}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-[#3a3a52] text-xs">
              ไม่มีรูปปก
            </div>
          )}

          {anime.status === "ONGOING" && (
            <span className="absolute top-2 left-2 text-[10px] font-semibold bg-[#0b0b12]/80 text-[#5ee6a0] px-2 py-0.5 rounded-full border border-[#5ee6a0]/30">
              กำลังฉาย
            </span>
          )}

          {/* Play icon fades in on hover, sits inside the image (no overflow) */}
          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-colors flex items-center justify-center opacity-0 group-hover:opacity-100">
            <span className="w-10 h-10 flex items-center justify-center rounded-full bg-[#ff5d73]">
              <svg className="w-4 h-4 text-[#0b0b12]" fill="currentColor" viewBox="0 0 20 20">
                <path d="M6 4l10 6-10 6V4z" />
              </svg>
            </span>
          </div>
        </div>

        <p className="mt-2 text-sm text-[#e8e6f0] font-medium truncate group-hover:text-[#ff5d73] transition-colors">
          {anime.title}
        </p>

        {/* Collapsed by default (max-h-0), expands downward in real layout on hover.
            No absolute positioning / no transform-scale, so it never triggers the
            browser's auto-scrollbar behavior inside a horizontally scrolling row. */}
        <div className="max-h-0 group-hover:max-h-16 overflow-hidden transition-all duration-300 ease-out">
          <div className="flex items-center gap-2 text-[11px] pt-1">
            {anime.rating ? (
              <span className="text-[#ffc857] font-semibold">★ {anime.rating.toFixed(1)}</span>
            ) : null}
            {anime.releaseYear && <span className="text-[#8a87a3]">{anime.releaseYear}</span>}
          </div>
          {anime.genres && anime.genres.length > 0 && (
            <p className="text-[11px] text-[#5a5770] truncate">
              {anime.genres.slice(0, 2).join(" · ")}
            </p>
          )}
        </div>
      </Link>
    </div>
  );
}
