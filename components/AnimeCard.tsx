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
    <div className="flex-shrink-0 w-[180px] md:w-[220px] self-start">
      <Link href={`/anime/${anime.id}`} className="group block">

        <div
          className="
            relative
            aspect-[2/3]
            overflow-hidden
            rounded-2xl
            border
            border-[#232335]
            bg-[#131320]
            transition-all
            duration-300
            group-hover:-translate-y-2
            group-hover:border-[#ff5d73]/60
            group-hover:shadow-2xl
          "
        >
          {anime.coverImage ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={anime.coverImage}
              alt={anime.title}
              className="
                h-full
                w-full
                object-cover
                transition-transform
                duration-500
                group-hover:scale-110
              "
            />
          ) : (
            <div className="flex h-full items-center justify-center text-xs text-[#3a3a52]">
              ไม่มีรูปปก
            </div>
          )}

          {/* Gradient */}
          <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent opacity-80" />

          {/* Status */}
          {anime.status === "ONGOING" && (
            <div className="absolute top-3 left-3 rounded-full bg-[#0b0b12]/70 backdrop-blur-md border border-[#5ee6a0]/30 px-3 py-1 text-[10px] font-semibold text-[#5ee6a0]">
              ● กำลังฉาย
            </div>
          )}

          {/* Rating */}
          {anime.rating && anime.rating > 0 && (
            <div className="absolute bottom-3 left-3 rounded-full bg-black/60 backdrop-blur-md px-2.5 py-1 text-xs font-bold text-[#ffc857]">
              ★ {anime.rating.toFixed(1)}
            </div>
          )}

          {/* Play Overlay */}
          <div
            className="
              absolute
              inset-0
              flex
              items-center
              justify-center
              bg-black/0
              opacity-0
              transition-all
              duration-300
              group-hover:bg-black/35
              group-hover:opacity-100
            "
          >
            <div
              className="
                flex
                h-14
                w-14
                items-center
                justify-center
                rounded-full
                bg-white
                text-black
                shadow-2xl
                transition-transform
                duration-300
                group-hover:scale-110
              "
            >
              <svg
                className="h-6 w-6 ml-1"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path d="M6 4l10 6-10 6V4z" />
              </svg>
            </div>
          </div>
        </div>

        {/* Info */}
        <div className="pt-3">

          <h3
            className="
              line-clamp-2
              text-[15px]
              font-semibold
              leading-5
              text-white
              transition-colors
              group-hover:text-[#ff5d73]
            "
          >
            {anime.title}
          </h3>

          <div className="mt-2 flex items-center gap-2 text-xs text-white/60">
            {anime.releaseYear && (
              <span>{anime.releaseYear}</span>
            )}

            {anime.releaseYear &&
              anime.genres &&
              anime.genres.length > 0 && (
                <span>•</span>
              )}

            {anime.genres && anime.genres.length > 0 && (
              <span className="truncate">
                {anime.genres.slice(0, 2).join(" • ")}
              </span>
            )}
          </div>

        </div>

      </Link>
    </div>
  );
}
