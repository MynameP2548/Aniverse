"use client";

import { useMemo, useState } from "react";

type Props = {
  muted: boolean;
  volume: number;

  onMute: () => void;
  onChange: (volume: number) => void;
};

export default function Volume({
  muted,
  volume,
  onMute,
  onChange,
}: Props) {
  const [hover, setHover] =
    useState(false);

  const percent = useMemo(() => {
    return (muted ? 0 : volume) * 100;
  }, [muted, volume]);

  return (
    <div
      className="flex items-center gap-3"
      onMouseEnter={() =>
        setHover(true)
      }
      onMouseLeave={() =>
        setHover(false)
      }
    >
      {/* Icon */}

      <button
        type="button"
        onClick={onMute}
        className="
          flex
          h-10
          w-10
          items-center
          justify-center
          rounded-full
          border
          border-white/10
          bg-white/10
          text-lg
          text-white
          backdrop-blur-xl
          transition-all
          duration-300
          hover:scale-110
          hover:bg-white/15
        "
      >
        {muted || volume === 0
          ? "🔇"
          : volume < 0.5
          ? "🔉"
          : "🔊"}
      </button>

      {/* Slider */}

      <div
        className={`
          overflow-hidden
          transition-all
          duration-300
          ${
            hover
              ? "w-28 opacity-100"
              : "w-0 opacity-0"
          }
        `}
      >
        <input
          type="range"
          min={0}
          max={1}
          step={0.01}
          value={muted ? 0 : volume}
          onChange={(e) =>
            onChange(
              Number(
                e.target.value
              )
            )
          }
          style={{
            background: `linear-gradient(
              to right,
              #7c3aed 0%,
              #7c3aed ${percent}%,
              rgba(255,255,255,.15) ${percent}%,
              rgba(255,255,255,.15) 100%
            )`,
          }}
          className="
            h-2
            w-full
            cursor-pointer
            appearance-none
            rounded-full
            transition-all
          "
        />
      </div>
    </div>
  );
}