"use client";

import {
  useMemo,
  useRef,
  useState,
} from "react";

type Props = {
  currentTime: number;
  duration: number;
  onSeek: (time: number) => void;

  poster?: string;
};

function formatTime(seconds: number) {
  if (!Number.isFinite(seconds))
    return "00:00";

  const h = Math.floor(seconds / 3600);

  const m = Math.floor(
    (seconds % 3600) / 60
  );

  const s = Math.floor(seconds % 60);

  if (h > 0) {
    return `${h}:${String(m).padStart(
      2,
      "0"
    )}:${String(s).padStart(
      2,
      "0"
    )}`;
  }

  return `${String(m).padStart(
    2,
    "0"
  )}:${String(s).padStart(
    2,
    "0"
  )}`;
}

export default function Progress({
  currentTime,
  duration,
  onSeek,
  poster,
}: Props) {

  const barRef =
    useRef<HTMLDivElement>(null);

  const [hover, setHover] =
    useState(false);

  const [hoverX, setHoverX] =
    useState(0);

  const [hoverTime, setHoverTime] =
    useState(0);

  const progress = useMemo(() => {

    if (!duration) return 0;

    return (
      currentTime /
      duration
    ) * 100;

  }, [
    currentTime,
    duration,
  ]);
  return (
  <div
    className="relative w-full touch-manipulation select-none py-2 sm:py-3"
    ref={barRef}
    onMouseEnter={() => setHover(true)}
    onMouseLeave={() => setHover(false)}
    onMouseMove={(e) => {
      if (!barRef.current) return;

      const rect =
        barRef.current.getBoundingClientRect();

      const x = Math.min(
        Math.max(
          e.clientX - rect.left,
          0
        ),
        rect.width
      );

      const percent =
        x / rect.width;

      setHoverX(x);

      setHoverTime(
        percent * duration
      );
    }}
    onClick={(e) => {
      if (!barRef.current) return;

      const rect =
        barRef.current.getBoundingClientRect();

      const x =
        e.clientX - rect.left;

      onSeek(
        (x / rect.width) *
          duration
      );
    }}
  >

    {/* Hover Time */}

{hover && (
  <div
    className="
      pointer-events-none
      absolute
      -top-40
      z-40
      -translate-x-1/2
      transition-all
      duration-200
    "
    style={{
      left: hoverX,
    }}
  >
    <div
      className="
        overflow-hidden
        rounded-xl
        border
        border-white/10
        bg-[#111]
        shadow-2xl
        backdrop-blur-xl
      "
    >
      <div
        className="
          flex
          h-24
          w-44
          items-center
          justify-center
          bg-black
        "
      >
        {poster ? (
          <img
            src={poster}
            alt=""
            className="
              h-full
              w-full
              object-cover
            "
          />
        ) : (
          <div
            className="
              text-xs
              text-white/40
            "
          >
            Preview
          </div>
        )}
      </div>

      <div
        className="
          border-t
          border-white/10
          py-2
          text-center
          text-xs
          font-semibold
          text-white
        "
      >
        {formatTime(hoverTime)}
      </div>
    </div>
  </div>
)}

    {/* Track */}

    <div
      className={`
        relative
        w-full
        overflow-hidden
        rounded-full
        bg-white/15
        transition-all
        duration-200
        ${
          hover
            ? "h-2.5"
            : "h-1.5"
        }
      `}
    >

      {/* Progress */}

      <div
        className="
          absolute
          left-0
          top-0
          h-full
          rounded-full
          bg-gradient-to-r from-violet-500 via-violet-400 to-sky-400
          shadow-[0_0_15px_rgba(139,92,246,.55)]
        "
        style={{
          width: `${progress}%`,
        }}
      />

      {/* Thumb */}

      <div
        className={`
          absolute
          top-1/2
          rounded-full
          bg-white
          shadow-[0_0_20px_rgba(139,92,246,.75)]
          transition-all
          duration-200
          -translate-y-1/2
          ${
            hover
              ? "h-5 w-5"
              : "h-3 w-3"
          }
        `}
        style={{
          left: `calc(${progress}% - ${
            hover
              ? "10px"
              : "6px"
          })`,
        }}
      />

    </div>

  </div>
);
}