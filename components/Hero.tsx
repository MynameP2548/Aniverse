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
    <section className="relative w-full h-[82vh] min-h-[560px] overflow-hidden">
      {backdrop && (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={backdrop}
          alt={anime.title}
          className="absolute inset-0 w-full h-full object-cover scale-[1.03] transition-transform duration-700"
        />
      )}

      {/* Overlay */}
      <div className="absolute inset-0 bg-black/25" />

      <div className="absolute inset-0 bg-gradient-to-t from-[#09090f] via-[#09090f]/30 to-transparent" />

      <div className="absolute inset-0 bg-gradient-to-r from-[#09090f] via-[#09090f]/55 to-transparent" />

      <div className="relative max-w-7xl mx-auto h-full flex flex-col justify-end px-8 md:px-16 pb-24">
        <div className="max-w-[720px]">

          {anime.rating && anime.rating > 0 ? (
            <div className="flex items-center gap-2 mb-5">

              <span className="text-yellow-400 text-base">
                ★
              </span>

              <span className="text-yellow-400 font-bold text-base">
                {anime.rating.toFixed(1)}
              </span>

              {anime.releaseYear && (
                <>
                  <span className="text-white/40">•</span>

                  <span className="text-white/70 text-base">
                    {anime.releaseYear}
                  </span>
                </>
              )}

            </div>
          ) : anime.releaseYear ? (
            <div className="flex items-center gap-2 mb-5">

              <span className="text-white/70 text-base">
                {anime.releaseYear}
              </span>

            </div>
          ) : null}

          <h1
            className="
              text-5xl
              md:text-7xl
              font-black
              tracking-tight
              leading-[1]
              text-white
              mb-6
              drop-shadow-[0_6px_30px_rgba(0,0,0,.7)]
            "
          >
            {anime.title}
          </h1>

          {anime.genres.length > 0 && (
            <div className="flex flex-wrap gap-3 mb-6">
              {anime.genres.slice(0, 3).map((g) => (
                <span
                  key={g}
                  className="
                    rounded-full
                    border
                    border-white/20
                    bg-white/10
                    backdrop-blur-sm
                    px-3
                    py-1
                    text-xs
                    font-medium
                    text-white
                  "
                >
                  {g}
                </span>
              ))}
            </div>
          )}

          {anime.description && (
            <p
              className="
                max-w-[620px]
                text-base
                md:text-lg
                leading-8
                text-white/80
                line-clamp-3
                mb-10
              "
            >
              {anime.description}
            </p>
          )}

          <div className="flex flex-wrap gap-4">

            <Link
              href={`/anime/${anime.id}`}
              className="
                inline-flex
                items-center
                gap-3
                rounded-xl
                bg-white
                px-8
                py-4
                text-black
                font-bold
                shadow-xl
                transition-all
                duration-300
                hover:scale-105
                hover:bg-gray-100
              "
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
              className="
                inline-flex
                items-center
                rounded-xl
                border
                border-white/20
                bg-white/10
                backdrop-blur-md
                px-8
                py-4
                text-white
                font-semibold
                transition-all
                duration-300
                hover:scale-105
                hover:bg-white/20
              "
            >
              รายละเอียด
            </Link>

          </div>

        </div>
      </div>
    </section>
  );
}
