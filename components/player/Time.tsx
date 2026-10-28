"use client";

type Props = {
  currentTime: number;
  duration: number;
};

function format(seconds: number) {
  if (!Number.isFinite(seconds) || seconds < 0) {
    return "00:00";
  }

  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = Math.floor(seconds % 60);

  if (h > 0) {
    return `${h}:${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
  }

  return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
}

export default function Time({
  currentTime,
  duration,
}: Props) {
  return (
    <div className="flex items-center gap-3">

      {/* Live Dot */}
      <div className="relative flex items-center justify-center">

        <div className="h-2.5 w-2.5 rounded-full bg-[#7c3aed]" />

        <div
          className="
            absolute
            h-2.5
            w-2.5
            animate-ping
            rounded-full
            bg-[#7c3aed]
            opacity-60
          "
        />

      </div>

      {/* Time */}
      <div
        className="
          flex
          items-center
          gap-2
          rounded-full
          border
          border-white/10
          bg-black/35
          px-3
          py-1.5
          text-sm
          font-medium
          text-white
          backdrop-blur-xl
        "
      >
        <span className="tabular-nums">
          {format(currentTime)}
        </span>

        <span className="text-white/40">
          /
        </span>

        <span className="tabular-nums text-white/65">
          {format(duration)}
        </span>
      </div>

    </div>
  );
}