"use client";

type Props = {
  playing: boolean;
  onClick: () => void;
};

export default function PlayButton({
  playing,
  onClick,
}: Props) {
  if (playing) return null;

  return (
    <button
      type="button"
      onClick={(e) => {
        e.stopPropagation();
        onClick();
      }}
      className="
        absolute
        left-1/2
        top-1/2
        z-40
        -translate-x-1/2
        -translate-y-1/2
        transition-all
        duration-300
        hover:scale-110
        active:scale-95
      "
    >
      {/* Glow */}
      <div
        className="
          absolute
          inset-0
          rounded-full
          bg-[#ff3355]/25
          blur-2xl
          scale-125
        "
      />

      {/* Ripple */}
      <div
        className="
          absolute
          inset-0
          rounded-full
          border
          border-white/15
          animate-ping
        "
      />

      {/* Main Button */}
      <div
        className="
          relative
          flex
          h-24
          w-24
          items-center
          justify-center
          rounded-full
          border
          border-white/10
          bg-white/10
          backdrop-blur-xl
          shadow-[0_10px_40px_rgba(0,0,0,.45)]
        "
      >
        <svg
          viewBox="0 0 24 24"
          fill="currentColor"
          className="
            ml-1
            h-11
            w-11
            text-white
            drop-shadow-lg
          "
        >
          <path d="M8 5v14l11-7z" />
        </svg>
      </div>
    </button>
  );
}