"use client";

export default function Loading() {
  return (
    <div
      className="
        pointer-events-none
        absolute
        inset-0
        z-50
        flex
        items-center
        justify-center
        bg-black/25
        backdrop-blur-[2px]
      "
    >
      <div className="relative flex items-center justify-center">

        {/* Outer Ring */}

        <div
          className="
            absolute
            h-24
            w-24
            animate-ping
            rounded-full
            bg-[#7c3aed]/20
          "
        />

        {/* Glow */}

        <div
          className="
            absolute
            h-16
            w-16
            rounded-full
            bg-[#7c3aed]/20
            blur-2xl
          "
        />

        {/* Spinner */}

        <div
          className="
            h-16
            w-16
            animate-spin
            rounded-full
            border-[3px]
            border-white/20
            border-t-[#7c3aed]
          "
        />

      </div>
    </div>
  );
}