"use client";

import Link from "next/link";
import Hls from "hls.js";

import {
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

import WelcomeScreen from "./WelcomeScreen";

export type HeroAnime = {
  id: string;
  slug: string;
  title: string;
  description?: string | null;
  bannerImage?: string | null;
  coverImage?: string | null;
  genres: string[];
  releaseYear?: number | null;
  rating?: number | null;
  heroTrailer?: string | null;
  heroLogo?: string | null;
};

type Props = {
  heroes: HeroAnime[];
};

export default function Hero({ heroes }: Props) {
  const list = useMemo(
    () => heroes.filter(Boolean),
    [heroes]
  );

  const [index, setIndex] = useState(0);
  const [fade, setFade] = useState(false);

  // Show the welcome screen only once per browser.
  // Start hidden to avoid flashing the overlay on returning visits.
  const [showWelcome, setShowWelcome] = useState(false);

  useEffect(() => {
    try {
      if (window.localStorage.getItem("aniverse-welcome-seen") !== "1") {
        setShowWelcome(true);
      }
    } catch {
      // If storage is unavailable, keep the welcome screen hidden.
    }
  }, []);

  const [playTrailer, setPlayTrailer] =
    useState(false);

  const videoRef =
    useRef<HTMLVideoElement>(null);

  const heroRef =
    useRef<HTMLElement>(null);

  const anime =
    list[index] ?? list[0];

  if (!anime) return null;

  const backdrop =
    anime.bannerImage ||
    anime.coverImage ||
    "";

  const trailer =
    anime.heroTrailer || "";

  const prevHero = () => {
    setFade(true);

    setTimeout(() => {
      setIndex((prev) =>
        prev === 0
          ? list.length - 1
          : prev - 1
      );

      setFade(false);
    }, 300);
  };

  const nextHero = () => {
    setFade(true);

    setTimeout(() => {
      setIndex(
        (prev) =>
          (prev + 1) %
          list.length
      );

      setFade(false);
    }, 300);
  };

  useEffect(() => {
    setPlayTrailer(false);

    const timer =
      setTimeout(() => {
        setPlayTrailer(true);
      }, 5000);

    return () =>
      clearTimeout(timer);
  }, [anime.id]);
    useEffect(() => {
    const video = videoRef.current;

    if (!video) return;

    // ยังไม่เล่น Trailer
    if (!playTrailer) {
      video.pause();
      return;
    }

    let hls: Hls | null = null;

    if (trailer.endsWith(".m3u8")) {
      if (Hls.isSupported()) {
        hls = new Hls({
          enableWorker: true,
        });

        hls.loadSource(trailer);
        hls.attachMedia(video);

        hls.on(
          Hls.Events.MANIFEST_PARSED,
          () => {
            video.play().catch(() => {});
          }
        );
      } else if (
        video.canPlayType(
          "application/vnd.apple.mpegurl"
        )
      ) {
        video.src = trailer;

        video.play().catch(() => {});
      }
    } else {
      video.src = trailer;

      video.play().catch(() => {});
    }

    return () => {
      if (hls) {
        hls.destroy();
      }
    };
  }, [trailer, playTrailer]);

  useEffect(() => {
    const hero = heroRef.current;
    const video = videoRef.current;

    if (!hero || !video) return;

    const observer =
      new IntersectionObserver(
        ([entry]) => {
          if (
            entry.isIntersecting &&
            playTrailer
          ) {
            video.play().catch(() => {});
          } else {
            video.pause();
          }
        },
        {
          threshold: 0.3,
        }
      );

    observer.observe(hero);

    return () =>
      observer.disconnect();
  }, [playTrailer]);

  return (
    <>
      <WelcomeScreen
        open={showWelcome}
        onEnter={() => {
          setShowWelcome(false);

          try {
            window.localStorage.setItem("aniverse-welcome-seen", "1");
          } catch {
            // The page still works if storage is unavailable.
          }

          const video =
            videoRef.current;

          if (video) {
            video.muted = false;

            video
              .play()
              .catch((err) => {
                console.warn(err);
              });
          }
        }}
      />

      <section
        ref={heroRef}
        className="hero-cinematic relative h-[76svh] min-h-[570px] w-full overflow-hidden sm:h-[80svh] sm:min-h-[620px] lg:h-[88svh] lg:min-h-[690px]"
      >
        {trailer && playTrailer ? (
          <video
            key={anime.id}
            ref={videoRef}
            className={`
              absolute
              inset-0
              h-full
              w-full
              object-cover
              scale-[1.03]
              transition-opacity
              duration-1000
              ${
                fade
                  ? "opacity-0"
                  : "opacity-100"
              }
            `}
            autoPlay
            muted={showWelcome}
            playsInline
            loop
            preload="auto"
            poster={backdrop}
            controls={false}
          />
        ) : (
          <img
            src={backdrop}
            alt={anime.title}
            className={`
              absolute
              inset-0
              h-full
              w-full
              object-cover
              scale-[1.03]
              transition-opacity
              duration-1000
              ${
                fade
                  ? "opacity-0"
                  : "opacity-100"
              }
            `}
          />
        )}

        <div className="absolute inset-0 bg-[#070816]/25" />
        <div className="absolute inset-0 bg-gradient-to-r from-[#060711]/95 via-[#080918]/72 to-[#080918]/5" />
        <div className="absolute inset-0 bg-gradient-to-t from-[#090a17] via-[#090a17]/10 to-[#090a17]/10" />

        {list.length > 1 && (
          <button
            onClick={prevHero}
            className="absolute left-3 top-1/2 z-40 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full border border-white/20 bg-black/45 text-xl text-white shadow-lg backdrop-blur-xl transition hover:border-violet-300/50 hover:bg-indigo-950/80 sm:left-6 sm:h-12 sm:w-12"
          >
            ❮
          </button>
        )}

        {list.length > 1 && (
          <button
            onClick={nextHero}
            className="absolute right-3 top-1/2 z-40 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full border border-white/20 bg-black/45 text-xl text-white shadow-lg backdrop-blur-xl transition hover:border-violet-300/50 hover:bg-indigo-950/80 sm:right-6 sm:h-12 sm:w-12"
          >
            ❯
          </button>
        )}

        <div
          className={`
            relative
            z-20
            mx-auto
            flex
            h-full
            max-w-[1500px]
            items-center
            px-6
            transition-all
            duration-500
            ${
              fade
                ? "opacity-0"
                : "opacity-100"
            }
          `}
        >
          <div className="max-w-[720px] pb-10 pt-20 sm:pb-14">
            <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-violet-200/20 bg-violet-300/[0.08] px-3.5 py-2 text-[9px] font-bold uppercase tracking-[0.24em] text-violet-100/90 shadow-lg shadow-violet-950/10 backdrop-blur-xl sm:text-[10px]">
              <span className="h-1.5 w-1.5 rounded-full bg-sky-300 shadow-[0_0_10px_rgba(125,211,252,.8)]" />
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