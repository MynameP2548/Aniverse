              Discover your next obsession
            </div>
            {(anime.rating || anime.releaseYear) && (
              <div className="mb-5 flex items-center gap-3 text-base">
                {anime.rating && anime.rating > 0 && (
                  <>
                    <span className="text-yellow-400">
                      ★
                    </span>

                    <span className="font-bold text-yellow-400">
                      {anime.rating.toFixed(1)}
                    </span>

                    <span className="text-white/40">
                      •
                    </span>
                  </>
                )}

                {anime.releaseYear && (
                  <span className="text-white/70">
                    {anime.releaseYear}
                  </span>
                )}
              </div>
            )}

            {anime.heroLogo ? (
              <img
                src={anime.heroLogo}
                alt={anime.title}
                className="mb-6 max-h-36 max-w-full object-contain object-left drop-shadow-[0_20px_40px_rgba(0,0,0,.9)] sm:max-h-44 lg:max-h-56"
              />
            ) : (
              <h1 className="max-w-[680px] text-4xl font-black leading-[1.04] tracking-[-0.045em] text-white drop-shadow-[0_8px_32px_rgba(0,0,0,.65)] sm:text-5xl md:text-6xl lg:text-7xl xl:text-[84px]">
                {anime.title}
              </h1>
            )}

            {anime.genres.length > 0 && (
              <div className="mt-6 flex flex-wrap gap-3">
                {anime.genres
                  .slice(0, 3)
                  .map((genre) => (
                    <span
                      key={genre}
                      className="rounded-full border border-white/20 bg-white/10 px-4 py-1.5 text-sm text-white backdrop-blur"
                    >
                      {genre}
                    </span>
                  ))}
              </div>
            )}

            {anime.description && (
              <p className="mt-5 line-clamp-3 max-w-[620px] text-sm leading-7 text-white/80 sm:mt-7 sm:text-lg sm:leading-8">
                {anime.description}
              </p>
            )}

            <div className="mt-7 flex flex-wrap gap-3 sm:mt-10 sm:gap-4">
              <Link
                href={`/anime/${anime.slug}`}
                className="group inline-flex items-center gap-2.5 rounded-full bg-gradient-to-r from-violet-500 via-indigo-500 to-blue-500 px-6 py-3.5 font-bold text-white shadow-[0_12px_36px_rgba(79,70,229,.28)] transition hover:-translate-y-0.5 hover:shadow-[0_16px_44px_rgba(99,102,241,.38)] sm:px-8 sm:py-4"
              >
                <span className="flex h-7 w-7 items-center justify-center rounded-full bg-white/15 text-xs" aria-hidden="true">▶</span> ดูเลย
              </Link>

              <Link
                href={`/anime/${anime.slug}`}
                className="rounded-full border border-white/15 bg-white/[0.06] px-6 py-3.5 font-semibold text-white/90 backdrop-blur-xl transition hover:border-violet-200/40 hover:bg-white/[0.11] sm:px-8 sm:py-4"
              >
                รายละเอียด
              </Link>
            </div>

          </div>
        </div>
                {list.length > 1 && (
          <div className="absolute bottom-8 left-1/2 z-50 flex -translate-x-1/2 gap-3">
            {list.map((_, i) => (
              <button
                key={i}
                onClick={() => {
                  setFade(true);

                  setTimeout(() => {
                    setIndex(i);
                    setFade(false);
                  }, 300);
                }}
                className={`h-2.5 rounded-full transition-all duration-300 ${
                  i === index
                    ? "w-10 bg-gradient-to-r from-violet-400 to-sky-400"
                    : "w-2.5 bg-white/40 hover:bg-white/70"
                }`}
              />
            ))}
          </div>
        )}
      </section>
    </>
  );
}