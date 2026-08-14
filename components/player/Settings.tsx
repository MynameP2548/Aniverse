
"use client";

import {
  useEffect,
  useRef,
  useState,
} from "react";

type AudioTrack = {
  id: string;
  label: string;
};

type SubtitleTrack = {
  id: string;
  label: string;
};

type Props = {
  video: HTMLVideoElement | null;

  onTheaterMode?: () => void;

  audioTracks?: AudioTrack[];
  selectedAudio?: string;
  onAudioChange?: (
    id: string
  ) => void;

  subtitleTracks?: SubtitleTrack[];
  selectedSubtitle?: string;
  onSubtitleChange?: (
    id: string
  ) => void;
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

  audioTracks = [],
  selectedAudio = "",
  onAudioChange,

  subtitleTracks = [],
  selectedSubtitle = "off",
  onSubtitleChange,
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
          flex h-10 w-10
          items-center
          justify-center
          rounded-full
          border border-white/10
          bg-white/10
          text-lg text-white
          backdrop-blur-xl
          transition-all
          duration-300
          hover:rotate-45
          hover:scale-110
        "
        aria-label="Settings"
      >
        ⚙️
      </button>

      {open && (
        <div
          className="
            absolute
            bottom-14
            right-0
            w-64
            overflow-hidden
            rounded-2xl
            border border-white/10
            bg-[#121218]/95
            shadow-2xl
            backdrop-blur-2xl
          "
        >
          <div
            className="
              border-b border-white/10
              px-4 py-3
              text-xs
              uppercase
              tracking-[0.25em]
              text-white/40
            "
          >
            Settings
          </div>

          <div className="p-2">
            {/* Speed */}
            <div className="mb-2 px-2 text-xs text-white/40">
              Playback Speed
            </div>

            {SPEEDS.map(
              (speed) => (
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
                    px-3 py-2
                    text-sm text-white
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
              )
            )}

            {/* Audio */}
            {audioTracks.length > 0 && (
              <>
                <div className="my-2 h-px bg-white/10" />

                <div className="mb-2 px-2 text-xs text-white/40">
                  🔊 Audio
                </div>

                {audioTracks.map(
                  (track) => (
                    <button
                      key={track.id}
                      type="button"
                      onClick={() => {
                        onAudioChange?.(
                          track.id
                        );
                      }}
                      className="
                        flex
                        w-full
                        items-center
                        justify-between
                        rounded-xl
                        px-3 py-2
                        text-sm text-white
                        transition
                        hover:bg-white/10
                      "
                    >
                      <span>
                        {track.label}
                      </span>

                      {selectedAudio ===
                        track.id && (
                        <span>✓</span>
                      )}
                    </button>
                  )
                )}
              </>
            )}

            {/* Subtitle */}
            {subtitleTracks.length > 0 && (
              <>
                <div className="my-2 h-px bg-white/10" />

                <div className="mb-2 px-2 text-xs text-white/40">
                  💬 Subtitles
                </div>

                <button
                  type="button"
                  onClick={() =>
                    onSubtitleChange?.(
                      "off"
                    )
                  }
                  className="
                    flex
                    w-full
                    items-center
                    justify-between
                    rounded-xl
                    px-3 py-2
                    text-sm text-white
                    transition
                    hover:bg-white/10
                  "
                >
                  <span>ปิด</span>

                  {selectedSubtitle ===
                    "off" && (
                    <span>✓</span>
                  )}
                </button>

                {subtitleTracks.map(
                  (track) => (
                    <button
                      key={track.id}
                      type="button"
                      onClick={() =>
                        onSubtitleChange?.(
                          track.id
                        )
                      }
                      className="
                        flex
                        w-full
                        items-center
                        justify-between
                        rounded-xl
                        px-3 py-2
                        text-sm text-white
                        transition
                        hover:bg-white/10
                      "
                    >
                      <span>
                        {track.label}
                      </span>

                      {selectedSubtitle ===
                        track.id && (
                        <span>✓</span>
                      )}
                    </button>
                  )
                )}
              </>
            )}

            <div className="my-2 h-px bg-white/10" />

            {/* PiP */}
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
                } catch {}

                setOpen(false);
              }}
              className="
                flex w-full
                rounded-xl
                px-3 py-2
                text-sm text-white
                transition
                hover:bg-white/10
              "
            >
              📺 Picture in Picture
            </button>

            {/* Theater */}
            <button
              type="button"
              onClick={() => {
                onTheaterMode?.();
                setOpen(false);
              }}
              className="
                flex w-full
                rounded-xl
                px-3 py-2
                text-sm text-white
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
