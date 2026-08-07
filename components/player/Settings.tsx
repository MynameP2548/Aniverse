"use client";

import {
  useEffect,
  useRef,
  useState,
} from "react";

type Props = {
  video: HTMLVideoElement | null;

  onTheaterMode?: () => void;
};

const SPEEDS = [
  0.5,
  0.75,
  1,
  1.25,
  1.5,
  2,
];

export default function Settings({
  video,
  onTheaterMode,
}: Props) {
  const [open, setOpen] =
    useState(false);

  const menuRef =
    useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClick(
      e: MouseEvent
    ) {
      if (
        menuRef.current &&
        !menuRef.current.contains(
          e.target as Node
        )
      ) {
        setOpen(false);
      }
    }

    document.addEventListener(
      "mousedown",
      handleClick
    );

    return () =>
      document.removeEventListener(
        "mousedown",
        handleClick
      );
  }, []);

  return (
    <div
      ref={menuRef}
      className="relative"
    >
      <button
        type="button"
        onClick={() =>
          setOpen((v) => !v)
        }
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
          hover:rotate-45
          hover:scale-110
        "
      >
        ⚙️
      </button>

      {open && (
        <div
          className="
            absolute
            bottom-14
            right-0
            w-60
            overflow-hidden
            rounded-2xl
            border
            border-white/10
            bg-[#121218]/95
            shadow-2xl
            backdrop-blur-2xl
          "
        >
          <div
            className="
              border-b
              border-white/10
              px-4
              py-3
              text-xs
              uppercase
              tracking-[0.25em]
              text-white/40
            "
          >
            Settings
          </div>

          <div className="p-2">

            <div className="mb-2 px-2 text-xs text-white/40">
              Playback Speed
            </div>

            {SPEEDS.map((speed) => (
              <button
                key={speed}
                type="button"
                onClick={() => {
                  if (video) {
                    video.playbackRate =
                      speed;
                  }

                  setOpen(false);
                }}
                className="
                  flex
                  w-full
                  items-center
                  justify-between
                  rounded-xl
                  px-3
                  py-2
                  text-sm
                  text-white
                  transition
                  hover:bg-white/10
                "
              >
                <span>
                  {speed}x
                </span>

                {video?.playbackRate ===
                  speed && (
                  <span>✓</span>
                )}
              </button>
            ))}

            <div className="my-2 h-px bg-white/10" />

            <button
              type="button"
              onClick={async () => {
                if (!video) return;

                try {
                  if (
                    document.pictureInPictureElement
                  ) {
                    await document.exitPictureInPicture();
                  } else {
                    await video.requestPictureInPicture();
                  }
                } catch {
                  // browser ไม่รองรับหรือผู้ใช้ยกเลิก
                }

                setOpen(false);
              }}
              className="
                flex
                w-full
                rounded-xl
                px-3
                py-2
                text-sm
                text-white
                transition
                hover:bg-white/10
              "
            >
              📺 Picture in Picture
            </button>

            <button
              type="button"
              onClick={() => {
                onTheaterMode?.();

                setOpen(false);
              }}
              className="
                flex
                w-full
                rounded-xl
                px-3
                py-2
                text-sm
                text-white
                transition
                hover:bg-white/10
              "
            >
              🎭 Theater Mode
            </button>

          </div>
        </div>
      )}
    </div>
  );
}