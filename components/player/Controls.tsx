"use client";

import Progress from "./Progress";
import Settings from "./Settings";
import Time from "./Time";
import Volume from "./Volume";

type Props = {
  video: HTMLVideoElement | null;

  poster?: string;

  currentTime: number;
  duration: number;

  volume: number;
  muted: boolean;

  onSeek: (time: number) => void;

  onMute: () => void;
  onVolume: (value: number) => void;

  onFullscreen: () => void;

  onTheaterMode?: () => void;

  audioTracks?: {
    id?: string;
    language: "THAI" | "JAPANESE";
    url: string;
    label?: string;
  }[];

  selectedAudioLanguage?: "THAI" | "JAPANESE" | null;

  onAudioChange?: (
    language: "THAI" | "JAPANESE"
  ) => void;
};

export default function Controls({
  video,

  poster,

  currentTime,
  duration,

  volume,
  muted,

  onSeek,

  onMute,
  onVolume,

  onFullscreen,

  onTheaterMode,

  audioTracks = [],
  selectedAudioLanguage,
  onAudioChange,
}: Props) {
      return (
    <div
      className="
        absolute
        inset-x-0
        bottom-0
        z-40
        bg-gradient-to-t
        from-black/95
        via-black/60
        to-transparent
        px-6
        pb-5
        pt-12
      "
    >
      {/* Progress */}

      <Progress
        currentTime={currentTime}
        duration={duration}
        poster={poster}
        onSeek={onSeek}
      />

      {/* Bottom Controls */}

      <div className="mt-5 flex items-center justify-between">

        {/* Left */}

        <div className="flex items-center gap-5">

          <Time
            currentTime={currentTime}
            duration={duration}
          />

        </div>

        {/* Right */}

        <div className="flex items-center gap-3">

          <Volume
            muted={muted}
            volume={volume}
            onMute={onMute}
            onChange={onVolume}
          />

          {audioTracks.length > 0 && (
            <div className="relative">
              <label
                className="
                  flex h-10 items-center gap-2 rounded-full
                  border border-white/10 bg-white/10 px-3
                  text-sm text-white backdrop-blur-xl
                "
                title="เลือกเสียง"
              >
                <span aria-hidden="true">🔊</span>

                <select
                  value={selectedAudioLanguage ?? ""}
                  onChange={(e) => {
                    const value = e.target.value;

                    if (
                      value === "THAI" ||
                      value === "JAPANESE"
                    ) {
                      onAudioChange?.(value);
                    }
                  }}
                  onClick={(e) => e.stopPropagation()}
                  onMouseDown={(e) => e.stopPropagation()}
                  className="
                    cursor-pointer appearance-none bg-transparent
                    pr-1 text-sm font-medium text-white
                    outline-none
                  "
                  aria-label="เลือกเสียง"
                >
                  {audioTracks.map((track) => (
                    <option
                      key={track.id ?? track.language}
                      value={track.language}
                      className="bg-[#131320] text-white"
                    >
                      {track.label ??
                        (track.language === "THAI"
                          ? "พากย์ไทย"
                          : "พากย์ญี่ปุ่น")}
                    </option>
                  ))}
                </select>
              </label>
            </div>
          )}

          <Settings
            video={video}
            onTheaterMode={
              onTheaterMode
            }
            audioTracks={audioTracks.map((track) => ({
              id: track.id ?? track.language,
              label:
                track.label ??
                (track.language === "THAI"
                  ? "🇹🇭 พากย์ไทย"
                  : "🇯🇵 พากย์ญี่ปุ่น"),
            }))}
            selectedAudio={
              selectedAudioLanguage ?? ""
            }
            onAudioChange={(id) => {
              if (
                id === "THAI" ||
                id === "JAPANESE"
              ) {
                onAudioChange?.(id);
              }
            }}
          />

          <button
            type="button"
            onClick={onFullscreen}
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
              hover:bg-white/20
              active:scale-95
            "
          >
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              className="h-5 w-5"
            >
              <path d="M8 3H3v5" />
              <path d="M16 3h5v5" />
              <path d="M21 16v5h-5" />
              <path d="M3 16v5h5" />
            </svg>
          </button>

        </div>

      </div>
          </div>
  );
}