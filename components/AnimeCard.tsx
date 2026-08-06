import Link from "next/link";

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
};

export default function AnimeCard({ anime }: Props) {
  return (
    <div
      className="
        flex-shrink-0
        w-[170px]
        md:w-[190px]
        xl:w-[210px]
        2xl:w-[230px]
      "
    >
<Link
  href={`/anime/${anime.slug}`}
  className="group block"
>
        <div
          className="
            relative
            aspect-[2/3]
            overflow-hidden
            rounded-2xl
            border
            border-white/10
            bg-[#131320]
            transition-all
            duration-300
            group-hover:-translate-y-2
            group-hover:border-[#ff5d73]/60
            group-hover:shadow-[0_18px_45px_rgba(0,0,0,.45)]
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
            <div className="flex h-full items-center justify-center text-xs text-white/40">
              ไม่มีรูปปก
            </div>
          )}

          {/* Overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-black via-black/20 to-transparent opacity-90" />

          {/* Status */}
          {anime.status === "ONGOING" && (
            <div
              className="
                absolute
                left-3
                top-3
                rounded-full
                border
                border-[#5ee6a0]/40
                bg-black/60
                px-3
                py-1
                text-[10px]
                font-semibold
                text-[#5ee6a0]
                backdrop-blur-md
              "
            >
              ● กำลังฉาย
            </div>
          )}

          {/* Rating */}
          {anime.rating && anime.rating > 0 && (
            <div
              className="
                absolute
                bottom-3
                left-3
                rounded-full
                bg-black/60
                px-3
                py-1
                text-xs
                font-bold
                text-[#ffc857]
                backdrop-blur-md
              "
            >
              ★ {anime.rating.toFixed(1)}
            </div>
          )}

          {/* Play */}
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
              group-hover:bg-black/30
              group-hover:opacity-100
            "
          >
            <div
              className="
                flex
                h-16
                w-16
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
                className="ml-1 h-7 w-7"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path d="M6 4l10 6-10 6V4z" />
              </svg>
            </div>
          </div>
        </div>

        {/* Info */}
        <div className="pt-4">

          <h3
            className="
              line-clamp-2
              text-[15px]
              md:text-base
              font-bold
              leading-6
              text-white
              transition-colors
              duration-300
              group-hover:text-[#ff5d73]
            "
          >
            {anime.title}
          </h3>

          <div
            className="
              mt-2
              flex
              flex-wrap
              items-center
              gap-2
              text-xs
              text-white/60
            "
          >
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
