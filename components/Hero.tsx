"use client";

import Link from "next/link";
import {
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

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

export default function Hero({
  heroes,
}: Props) {
  const list = useMemo(
    () => heroes.filter(Boolean),
    [heroes]
  );

  const [index, setIndex] = useState(0);

  const [muted, setMuted] =
    useState(true);

  const [paused, setPaused] =
    useState(false);
  const [fade, setFade] =
    useState(false);

  const videoRef =
    useRef<HTMLVideoElement>(null);
  const heroRef =
    useRef<HTMLElement>(null);

  useEffect(() => {
  if (list.length <= 1) return;
  if (paused) return;

  let timeoutId: ReturnType<typeof setTimeout>;

  const intervalId = setInterval(() => {
    setFade(true);

    timeoutId = setTimeout(() => {
      setIndex((prev) => (prev + 1) % list.length);
      setFade(false);
    }, 450);
  }, 15000);

  return () => {
    clearInterval(intervalId);
    clearTimeout(timeoutId);
  };
}, [list.length, paused]);

  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.muted = muted;
    }
  }, [muted]);
useEffect(() => {
  const video = videoRef.current;

  if (!video) return;

  video.load();
}, [index]);
  useEffect(() => {
  if (!heroRef.current || !videoRef.current) return;

  const observer = new IntersectionObserver(
    ([entry]) => {
      if (!videoRef.current) return;

      if (entry.isIntersecting) {
        videoRef.current.play().catch(() => {});
      } else {
        videoRef.current.pause();
      }
    },
    {
      threshold: 0.35,
    }
  );

  observer.observe(heroRef.current);

  return () => observer.disconnect();
}, []);

  const anime =
    list[index] ?? list[0];

  if (!anime) return null;

  const backdrop =
    anime.bannerImage ||
    anime.coverImage;

  const trailer =
    anime.heroTrailer;
const prevHero = () => {
  setFade(true);
  setIndex((prev) =>
    prev === 0 ? list.length - 1 : prev - 1
  );
};

const nextHero = () => {
  setFade(true);
  setIndex((prev) =>
    (prev + 1) % list.length
  );
};
    
      return (
    <section
      ref={heroRef}
      className="relative h-[82vh] min-h-[620px] w-full overflow-hidden"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      {trailer ? (
<video
  key={anime.id}
  ref={videoRef}
  className="absolute inset-0 h-full w-full object-cover scale-[1.03] transition-opacity duration-500"
  style={{
    opacity: fade ? 0 : 1,
  }}
  autoPlay
  playsInline
  loop
  preload="auto"
  poster={backdrop ?? undefined}
  muted={false}
  onCanPlay={(e) => {
    const video = e.currentTarget;

    video.muted = false;
    video.volume = 1;

    video
      .play()
      .then(() => {
        console.log("Video playing with sound");
      })
      .catch((err) => {
        console.log("Autoplay with sound blocked:", err);
      });
  }}
>
  <source src={trailer} type="video/mp4" />
</video>
      ) : (
        backdrop && (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={backdrop}
            alt={anime.title}
            className="absolute inset-0 h-full w-full object-cover scale-[1.03]"
          />
        )
      )}

{list.length > 1 && (
)}

      {/* Overlay */}
      <div className="absolute inset-0 bg-black/18" />

      {/* Bottom */}
      <div className="absolute inset-0 bg-gradient-to-t from-[#09090f] via-[#09090f]/10 to-transparent" />

      {/* Left */}
      <div className="absolute inset-0 bg-gradient-to-r from-black/85 via-black/45 to-transparent" />

      {/* Right */}
      <div className="absolute inset-0 bg-gradient-to-l from-black/25 via-transparent to-transparent" />

{list.length > 1 && (
  <button
    onClick={nextHero}
    className="
      absolute
      right-6
      top-1/2
      z-40
      -translate-y-1/2
      flex
      h-14
      w-14
      items-center
      justify-center
      rounded-full
      border
      border-white/20
      bg-black/30
      text-2xl
      text-white
      backdrop-blur-md
      transition-all
      duration-300
      hover:bg-black/70
      hover:scale-110
    "
  >
    ❯
  </button>
)}

      <button
        onClick={() => setMuted(!muted)}
        className="
          absolute
          bottom-8
          right-8
          z-30
          flex
          h-12
          w-12
          items-center
          justify-center
          rounded-full
          border
          border-white/20
          bg-black/40
          text-white
          backdrop-blur-md
          transition
          hover:bg-black/70
        "
      >
        {muted ? "🔇" : "🔊"}
      </button>

<div
  className={`
    relative
    mx-auto
    flex
    h-full
    w-full
    max-w-[1500px]
    items-center
    px-6
    md:px-8
    lg:px-12
    xl:px-16
    2xl:px-20
    transition-all
    duration-500
    ${
      fade
        ? "opacity-0 scale-[0.98]"
        : "opacity-100 scale-100"
    }
  `}
>
        <div className="max-w-[680px]">
          {(anime.rating || anime.releaseYear) && (
            <div className="mb-5 flex items-center gap-3 text-base">
              {anime.rating && anime.rating > 0 && (
                <>
                  <span className="text-yellow-400">★</span>

                  <span className="font-bold text-yellow-400">
                    {anime.rating.toFixed(1)}
                  </span>

                  <span className="text-white/40">•</span>
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
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={anime.heroLogo}
              alt={anime.title}
              className="
                mb-6
                max-h-56
                lg:max-h-64
                w-auto
                object-contain
                drop-shadow-[0_20px_40px_rgba(0,0,0,.9)]
              "
            />
          ) : (
            <h1
              className="
                max-w-[720px]
                text-4xl
                sm:text-5xl
                lg:text-6xl
                xl:text-7xl
                font-black
                leading-[1.08]
                tracking-tight
                text-white
              "
            >
              {anime.title}
            </h1>
          )}
                    {anime.genres.length > 0 && (
            <div className="mt-6 flex flex-wrap gap-3">
              {anime.genres.slice(0, 3).map((g) => (
                <span
                  key={g}
                  className="
                    rounded-full
                    border
                    border-white/15
                    bg-white/10
                    px-4
                    py-1.5
                    text-sm
                    text-white
                    backdrop-blur-md
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
                mt-7
                max-w-[620px]
                text-[16px]
                leading-8
                text-white/80
                line-clamp-3
                xl:text-lg
              "
            >
              {anime.description}
            </p>
          )}

          <div className="mt-10 flex flex-wrap gap-4">
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
                text-base
                font-bold
                text-black
                transition-all
                duration-300
                hover:scale-105
                hover:bg-neutral-200
              "
            >
              <svg
                className="h-5 w-5"
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
                border-white/15
                bg-white/10
                px-8
                py-4
                text-base
                font-semibold
                text-white
                backdrop-blur-md
                transition-all
                duration-300
                hover:bg-white/20
                hover:scale-105
              "
            >
              รายละเอียด
            </Link>
          </div>
        </div>
      </div>

{list.length > 1 && (
  <div
    className="
      absolute
      bottom-6
      left-1/2
      z-50
      flex
      -translate-x-1/2
      items-center
      gap-3
    "
  >
    {list.map((_, i) => (
      <button
        key={i}
        onClick={() => {
          setFade(true);

          setTimeout(() => {
            setIndex(i);
            setFade(false);
          }, 250);
        }}
        className={`
          h-2.5
          rounded-full
          transition-all
          duration-300
          ${
            i === index
              ? "w-10 bg-[#ff5d73]"
              : "w-2.5 bg-white/40 hover:bg-white/70"
          }
        `}
      />
    ))}
  </div>
)}
    </section>
  );
}