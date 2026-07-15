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
    <section className="relative w-full h-[78vh] min-h-[480px] overflow-hidden">
      {backdrop && (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={backdrop}
          alt={anime.title}
          className="absolute inset-0 w-full h-full object-cover"
        />
      )}

      {/* gradient stack: gives the poster a "cut from the frame" feel */}
      <div className="absolute inset-0 bg-gradient-to-t from-[#0b0b12] via-[#0b0b12]/40 to-transparent" />
      <div className="absolute inset-0 bg-gradient-to-r from-[#0b0b12] via-[#0b0b12]/10 to-transparent" />

      <div className="relative max-w-7xl mx-auto px-6 h-full flex flex-col justify-end pb-16">
        <div className="max-w-xl">
          {anime.rating ? (
            <div className="flex items-center gap-1.5 mb-3">
              <span className="text-[#ffc857] text-sm">★</span>
              <span className="text-[#ffc857] text-sm font-semibold">{anime.rating.toFixed(1)}</span>
              <span className="text-[#5a5770] text-sm">· {anime.releaseYear}</span>
            </div>
          ) : null}

          <h1 className="text-4xl md:text-6xl font-black tracking-tight text-[#e8e6f0] leading-[1.05] mb-4">
            {anime.title}
          </h1>

          {anime.genres.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-4">
              {anime.genres.slice(0, 3).map((g) => (
                <span
                  key={g}
                  className="text-xs px-2.5 py-1 rounded-full border border-[#2a2a3d] text-[#8a87a3]"
                >
                  {g}
                </span>
              ))}
            </div>
          )}

          {anime.description && (
            <p className="text-[#a8a5bd] text-sm md:text-base leading-relaxed line-clamp-3 mb-6">
              {anime.description}
            </p>
          )}

          <div className="flex gap-3">
            <Link
              href={`/anime/${anime.id}`}
              className="bg-[#ff5d73] hover:bg-[#ff738a] transition text-[#0b0b12] font-bold px-6 py-3 rounded-lg text-sm flex items-center gap-2"
            >
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                <path d="M6 4l10 6-10 6V4z" />
              </svg>
              ดูเลย
            </Link>
            <Link
              href={`/anime/${anime.id}`}
              className="bg-[#131320]/80 border border-[#2a2a3d] hover:border-[#3a3a52] transition text-[#e8e6f0] font-semibold px-6 py-3 rounded-lg text-sm"
            >
              รายละเอียด
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
