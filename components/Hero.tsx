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

  const [showWelcome, setShowWelcome] =
    useState(true);

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
        className="relative h-[82vh] min-h-[620px] w-full overflow-hidden"
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

        <div className="absolute inset-0 bg-black/35" />
        <div className="absolute inset-0 bg-gradient-to-r from-black via-black/55 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-t from-[#0b0b12] via-transparent to-transparent" />

        {list.length > 1 && (
          <button
            onClick={prevHero}
            className="absolute left-6 top-1/2 z-40 -translate-y-1/2 flex h-14 w-14 items-center justify-center rounded-full border border-white/20 bg-black/40 text-2xl text-white backdrop-blur hover:bg-black/70 transition"
          >
            ❮
          </button>
        )}

        {list.length > 1 && (
          <button
            onClick={nextHero}
            className="absolute right-6 top-1/2 z-40 -translate-y-1/2 flex h-14 w-14 items-center justify-center rounded-full border border-white/20 bg-black/40 text-2xl text-white backdrop-blur hover:bg-black/70 transition"
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
          <div className="max-w-[680px]">
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
                className="mb-6 max-h-56 w-auto object-contain drop-shadow-[0_20px_40px_rgba(0,0,0,.9)]"
              />
            ) : (
              <h1 className="text-5xl lg:text-7xl font-black leading-tight text-white">
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
              <p className="mt-7 max-w-[620px] text-lg leading-8 text-white/80 line-clamp-3">
                {anime.description}
              </p>
            )}

            <div className="mt-10 flex flex-wrap gap-4">
              <Link
                href={`/anime/${anime.id}`}
                className="rounded-xl bg-white px-8 py-4 font-bold text-black transition hover:bg-neutral-200"
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
                    ? "w-10 bg-[#ff5d73]"
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