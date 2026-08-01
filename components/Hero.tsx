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
    <section className="relative w-full h-[90vh] min-h-[640px] overflow-hidden">
      {backdrop && (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={backdrop}
          alt={anime.title}
          className="absolute inset-0 w-full h-full object-cover scale-105"
        />
      )}

      {/* Netflix Style Gradient */}
      <div className="absolute inset-0 bg-gradient-to-t from-[#09090f] via-[#09090f]/30 to-transparent" />
      <div className="absolute inset-0 bg-gradient-to-r from-[#09090f] via-[#09090f]/55 to-transparent" />
      <div className="absolute inset-0 bg-black/20" />

      {/* Bottom Blur */}
      <div className="absolute bottom-0 left-0 right-0 h-48 bg-gradient-to-t from-[#09090f] to-transparent" />

      <div className="relative h-full max-w-7xl mx-auto flex items-center px-8 md:px-16 pt-24 md:pt-32">
        <div className="max-w-[560px]">

          {/* Badge */}
          <div className="inline-flex items-center rounded-md bg-[#ff5d73] px-3 py-1 text-[11px] font-bold tracking-[0.2em] uppercase text-white mb-6 shadow-lg">
            ANIVERSE
          </div>

          {/* Rating */}
          <div className="flex items-center gap-3 mb-5 text-white/90">
            {anime.rating && (
              <>
                <span className="text-[#ffc857] text-lg">★</span>
                <span className="font-bold text-lg">
                  {anime.rating.toFixed(1)}
                </span>
              </>
            )}

            {anime.releaseYear && (
              <>
                <span className="text-white/40">•</span>
                <span className="text-white/70">
                  {anime.releaseYear}
                </span>
              </>
            )}
          </div>

          {/* Title */}
          <h1 className="text-5xl md:text-7xl font-black leading-[0.95] tracking-tight text-white drop-shadow-[0_4px_24px_rgba(0,0,0,.65)] mb-6">
            {anime.title}
          </h1>

          {/* Genres */}
          {anime.genres.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-6">
              {anime.genres.slice(0, 3).map((g) => (
                <span
                  key={g}
                  className="rounded-full border border-white/20 bg-white/10 backdrop-blur-md px-3 py-1 text-xs text-white"
                >
                  {g}
                </span>
              ))}
            </div>
          )}

          {/* Description */}
          {anime.description && (
            <p className="text-base md:text-lg leading-8 text-white/80 line-clamp-4 mb-10">
              {anime.description}
            </p>
          )}

          {/* Buttons */}
          <div className="flex flex-wrap gap-4">

            <Link
              href={`/anime/${anime.id}`}
              className="inline-flex items-center gap-3 rounded-xl bg-white px-8 py-4 text-black font-bold transition-all duration-300 hover:scale-105 hover:bg-gray-100 shadow-xl"
            >
              <svg
                className="w-5 h-5"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path d="M6 4l10 6-10 6V4z" />
              </svg>

              ดูเลย
            </Link>

            <Link
              href={`/anime/${anime.id}`}
              className="inline-flex items-center rounded-xl border border-white/20 bg-white/10 backdrop-blur-md px-8 py-4 text-white font-semibold transition-all duration-300 hover:bg-white/20 hover:scale-105"
            >
              รายละเอียด
            </Link>

          </div>
        </div>
      </div>
    </section>
  );
}
