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
  };
};

export default function Hero({ anime }: Props) {
  const backdrop = anime.bannerImage || anime.coverImage;

  return (
    <section className="relative h-[82vh] min-h-[650px] overflow-hidden">

      {/* Background */}
      {backdrop && (
        <img
          src={backdrop}
          alt={anime.title}
          className="absolute inset-0 h-full w-full object-cover scale-105"
        />
      )}

      {/* Overlay */}
      <div className="absolute inset-0 bg-black/45" />

      <div className="absolute inset-0 bg-gradient-to-r from-[#09090f] via-[#09090f]/45 to-transparent" />

      <div className="absolute inset-0 bg-gradient-to-t from-[#09090f] via-transparent to-transparent" />

      <div className="relative mx-auto flex h-full max-w-7xl items-center px-10">

        <div className="max-w-[760px]">

          {/* Rating */}

          <div className="mb-5 flex items-center gap-3 text-white/80">

            {anime.rating &&
              anime.rating > 0 && (
                <>
                  <span className="text-yellow-400">★</span>

                  <span className="font-semibold">
                    {anime.rating.toFixed(1)}
                  </span>

                  <span>•</span>
                </>
              )}

            {anime.releaseYear && (
              <>
                <span>{anime.releaseYear}</span>
                <span>•</span>
              </>
            )}

            {anime.genres.slice(0, 1).map((g) => (
              <span key={g}>{g}</span>
            ))}

          </div>

          {/* Title */}

          <h1 className="mb-7 max-w-[760px] text-5xl font-black leading-[1.05] tracking-tight text-white drop-shadow-2xl md:text-7xl">
            {anime.title}
          </h1>

          {/* Description */}

          {anime.description && (
            <p className="mb-8 max-w-[620px] text-lg leading-8 text-white/80 line-clamp-3">
              {anime.description}
            </p>
          )}

          {/* Info */}

          <div className="mb-10 flex flex-wrap gap-3">

            <div className="rounded-full bg-[#ff5d73] px-4 py-2 text-sm font-semibold text-white">
              กำลังฉาย
            </div>

            <div className="rounded-full border border-white/20 bg-white/10 px-4 py-2 text-sm text-white">
              Full HD
            </div>

            <div className="rounded-full border border-white/20 bg-white/10 px-4 py-2 text-sm text-white">
              ซับไทย
            </div>

          </div>

          {/* Buttons */}

          <div className="flex gap-4">

            <Link
              href={`/anime/${anime.id}`}
              className="flex items-center gap-3 rounded-xl bg-white px-8 py-4 font-bold text-black transition hover:scale-105"
            >
              ▶ ดูเลย
            </Link>

            <Link
              href={`/anime/${anime.id}`}
              className="rounded-xl border border-white/20 bg-white/10 px-8 py-4 font-semibold text-white backdrop-blur transition hover:bg-white/20"
            >
              รายละเอียด
            </Link>

          </div>

        </div>

      </div>

    </section>
  );
}
