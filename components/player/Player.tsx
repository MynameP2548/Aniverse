"use client";

import { useRouter } from "next/navigation";

import {
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";

import Controls from "./Controls";
import Loading from "./Loading";
import PlayButton from "./PlayButton";
import Video from "./Video";

import usePlayer from "./usePlayer";

import type { PlayerProps } from "./types";

export default function Player({
  episodeId,
  src,
  poster,
  title,
  episode,
  autoPlay = true,
  onEnded,
  onTimeUpdate,
  onNextEpisode,
  nextEpisode,
  introStart,
  introEnd,
  nextEpisodeTime,
}: PlayerProps & {
  /** Intro start time in seconds. Example: 92 = 01:32 */
  introStart?: number | null;
  /** Intro end time in seconds. Example: 182 = 03:02 */
  introEnd?: number | null;
  /** Time in seconds when the Next Episode overlay should appear. */
  nextEpisodeTime?: number | null;
}) {
  const {
    playerRef,
    videoRef,
    hls,
  } = usePlayer();

  const router = useRouter();

  const hideTimer =
    useRef<NodeJS.Timeout | null>(null);

  const lastSavedTime = useRef(0);

  const restoredProgress = useRef(false);

  // Mobile double-tap detection
  const lastLeftTap = useRef(0);
  const lastRightTap = useRef(0);

  const [playing, setPlaying] =
    useState(false);

  const [loading, setLoading] =
    useState(true);

  const [resolvedSrc, setResolvedSrc] =
    useState<string | null>(null);

  const [videoError, setVideoError] =
    useState<string | null>(null);

  const [showControls, setShowControls] =
    useState(true);

  const [duration, setDuration] =
    useState(0);

  const [currentTime, setCurrentTime] =
    useState(0);

  const [volume, setVolume] =
    useState(1);

  const [muted, setMuted] =
    useState(false);

  const [theaterMode, setTheaterMode] =
    useState(false);

  const [showNextEpisode, setShowNextEpisode] =
    useState(false);

  const [countdown, setCountdown] =
    useState(5);

  const [showSkipIntro, setShowSkipIntro] =
    useState(false);

  const introSkipped = useRef(false);

  // ===========================
  // R2 Signed URL
  // ===========================

  useEffect(() => {
    let cancelled = false;

    async function loadSignedUrl() {
      setLoading(true);
      setVideoError(null);
      setResolvedSrc(null);
      restoredProgress.current = false;
      lastSavedTime.current = 0;

      try {
        const res = await fetch(
          `/api/video/${encodeURIComponent(episodeId)}`,
          {
            cache: "no-store",
          }
        );

        const data = await res.json();

        if (!res.ok || !data?.url) {
          throw new Error(
            data?.error || "ไม่สามารถสร้าง URL วิดีโอได้"
          );
        }

        if (!cancelled) {
          setResolvedSrc(data.url);
        }
      } catch (error) {
        console.error("R2 VIDEO URL ERROR:", error);

        if (!cancelled) {
          setVideoError(
            error instanceof Error
              ? error.message
              : "ไม่สามารถโหลดวิดีโอได้"
          );
          setLoading(false);
        }
      }
    }

    loadSignedUrl();

    return () => {
      cancelled = true;
    };
  }, [episodeId]);

  // ===========================
  // Video Events
  // ===========================

  useEffect(() => {
    if (!resolvedSrc) return;

    const video = videoRef.current;

    if (!video) return;

    const loaded = async () => {
      setDuration(video.duration || 0);

      if (!restoredProgress.current) {
        restoredProgress.current = true;

        try {
          const res = await fetch(
            `/api/watch-history?episodeId=${episodeId}`
          );

          const data = await res.json();

          if (
            typeof data.progress === "number" &&
            data.progress > 0 &&
            data.progress < video.duration - 5
          ) {
            video.currentTime = data.progress;
          }
        } catch {
          // ignore
        }
      }

      setLoading(false);
    };

    const time = () => {
      setCurrentTime(video.currentTime);
      onTimeUpdate?.(video.currentTime);
    };

    const play = () => setPlaying(true);

    const pause = () => setPlaying(false);

    const waiting = () => setLoading(true);

    const playingEvent = () =>
      setLoading(false);

    const ended = () => {
      setPlaying(false);
      onEnded?.();
    };

    const volumeChange = () => {
      setVolume(video.volume);
      setMuted(video.muted);
    };

    video.addEventListener(
      "loadedmetadata",
      loaded
    );

    video.addEventListener(
      "timeupdate",
      time
    );

    video.addEventListener(
      "play",
      play
    );

    video.addEventListener(
      "pause",
      pause
    );

    video.addEventListener(
      "waiting",
      waiting
    );

    video.addEventListener(
      "playing",
      playingEvent
    );

    video.addEventListener(
      "ended",
      ended
    );

    video.addEventListener(
      "volumechange",
      volumeChange
    );

    return () => {
      video.removeEventListener(
        "loadedmetadata",
        loaded
      );

      video.removeEventListener(
        "timeupdate",
        time
      );

      video.removeEventListener(
        "play",
        play
      );

      video.removeEventListener(
        "pause",
        pause
      );

      video.removeEventListener(
        "waiting",
        waiting
      );

      video.removeEventListener(
        "playing",
        playingEvent
      );

      video.removeEventListener(
        "ended",
        ended
      );

      video.removeEventListener(
        "volumechange",
        volumeChange
      );
    };
  }, [
    episodeId,
    resolvedSrc,
    videoRef,
    onEnded,
    onTimeUpdate,
  ]);

  // ===========================
  // Controls
  // ===========================
    // ===========================
  // Controls
  // ===========================

  const togglePlay = useCallback(() => {
    const video = videoRef.current;

    if (!video) return;

    if (video.paused) {
      video.play();
    } else {
      video.pause();
    }
  }, [videoRef]);

  const seek = useCallback(
    (time: number) => {
      const video = videoRef.current;

      if (!video) return;

      video.currentTime = time;
    },
    [videoRef]
  );

  const seekBy = useCallback(
    (seconds: number) => {
      const video = videoRef.current;

      if (!video) return;

      video.currentTime = Math.max(
        0,
        Math.min(
          video.duration,
          video.currentTime + seconds
        )
      );
    },
    [videoRef]
  );

  const toggleMute = useCallback(() => {
    const video = videoRef.current;

    if (!video) return;

    video.muted = !video.muted;
  }, [videoRef]);

  const changeVolume = useCallback(
    (value: number) => {
      const video = videoRef.current;

      if (!video) return;

      video.volume = value;
      video.muted = value === 0;
    },
    [videoRef]
  );

  const toggleFullscreen =
    useCallback(async () => {
      const player = playerRef.current;
      const video = videoRef.current;

      if (!player || !video) return;

      try {
        // iPhone/iPad Safari:
        // uses the <video> fullscreen API instead of
        // element.requestFullscreen().
        const mobileVideo = video as HTMLVideoElement & {
          webkitEnterFullscreen?: () => void;
        };

        if (
          !document.fullscreenElement &&
          typeof mobileVideo.webkitEnterFullscreen ===
            "function"
        ) {
          mobileVideo.webkitEnterFullscreen();
          return;
        }

        if (!document.fullscreenElement) {
          const element = player as HTMLElement & {
            webkitRequestFullscreen?: () => Promise<void> | void;
          };

          if (typeof element.requestFullscreen === "function") {
            await element.requestFullscreen();
          } else if (
            typeof element.webkitRequestFullscreen ===
            "function"
          ) {
            await element.webkitRequestFullscreen();
          }
        } else {
          await document.exitFullscreen();
        }
      } catch (error) {
        console.error(
          "FULLSCREEN ERROR:",
          error
        );
      }
    }, [playerRef, videoRef]);

  // Keep browser fullscreen state in sync.
  useEffect(() => {
    const handleFullscreenChange = () => {
      // No separate fullscreen state is needed here,
      // but this keeps the handler available for mobile
      // browsers that enter/exit fullscreen outside the
      // normal document fullscreen API.
    };

    document.addEventListener(
      "fullscreenchange",
      handleFullscreenChange
    );

    return () => {
      document.removeEventListener(
        "fullscreenchange",
        handleFullscreenChange
      );
    };
  }, []);

  // ===========================
  // Keyboard
  // ===========================

  useEffect(() => {
    const onKeyDown = (
      e: KeyboardEvent
    ) => {
      const tag = (
        e.target as HTMLElement
      )?.tagName;

      if (
        tag === "INPUT" ||
        tag === "TEXTAREA"
      ) {
        return;
      }

      switch (e.code) {
        case "Space":
          e.preventDefault();
          togglePlay();
          break;

        case "ArrowLeft":
          seekBy(-10);
          break;

        case "ArrowRight":
          seekBy(10);
          break;

        case "KeyM":
          toggleMute();
          break;

        case "KeyF":
          toggleFullscreen();
          break;
      }
    };

    window.addEventListener(
      "keydown",
      onKeyDown
    );

    return () =>
      window.removeEventListener(
        "keydown",
        onKeyDown
      );
  }, [
    togglePlay,
    seekBy,
    toggleMute,
    toggleFullscreen,
  ]);

  // ===========================
  // Auto Hide Controls
  // ===========================

  const showUI = useCallback(() => {
    setShowControls(true);

    if (hideTimer.current) {
      clearTimeout(
        hideTimer.current
      );
    }

    hideTimer.current =
      setTimeout(() => {
        if (playing) {
          setShowControls(false);
        }
      }, 2500);
  }, [playing]);

  useEffect(() => {
    showUI();
  }, [showUI]);

  useEffect(() => {
    setPlaying(false);
    setCurrentTime(0);
    setDuration(0);
    setShowNextEpisode(false);
    setCountdown(5);
    setShowSkipIntro(false);
    introSkipped.current = false;
  }, [episodeId]);

  // ===========================
  // Watch History
  // ===========================

  useEffect(() => {
    if (!playing) return;

    const timer = setInterval(
      async () => {
        const video =
          videoRef.current;

        if (!video) return;

        const current = Math.floor(
          video.currentTime
        );

        if (
          current ===
          lastSavedTime.current
        ) {
          return;
        }

        lastSavedTime.current =
          current;

        try {
          await fetch(
            "/api/watch-history",
            {
              method: "POST",
              headers: {
                "Content-Type":
                  "application/json",
              },
              body: JSON.stringify({
                episodeId,
                progress: current,
              }),
            }
          );
        } catch {
          // ignore
        }
      },
      5000
    );

    return () =>
      clearInterval(timer);
  }, [
    episodeId,
    playing,
    videoRef,
  ]);

  // ===========================
  // Skip Intro
  // ===========================

  useEffect(() => {
    const hasIntro =
      typeof introStart === "number" &&
      typeof introEnd === "number" &&
      introStart >= 0 &&
      introEnd > introStart;

    if (!hasIntro || introSkipped.current) {
      setShowSkipIntro(false);
      return;
    }

    const inIntro =
      currentTime >= introStart &&
      currentTime < introEnd;

    setShowSkipIntro(inIntro);
  }, [currentTime, introStart, introEnd]);

  const skipIntro = useCallback(() => {
    const video = videoRef.current;

    if (!video || typeof introEnd !== "number") {
      return;
    }

    video.currentTime = introEnd;
    introSkipped.current = true;
    setShowSkipIntro(false);
  }, [videoRef, introEnd]);

  // ===========================
  // Auto Next Episode
  // ===========================

  useEffect(() => {
    if (!nextEpisode) return;

    if (duration <= 0) return;

    // ถ้ากำหนด nextEpisodeTime มา จะขึ้นตรงเวลานั้น
    // ถ้าไม่ได้กำหนด จะใช้พฤติกรรมเดิม: ขึ้นก่อนจบ 20 วินาที
    const triggerTime =
      typeof nextEpisodeTime === "number" &&
      nextEpisodeTime >= 0
        ? nextEpisodeTime
        : Math.max(0, duration - 20);

    if (
      currentTime >= triggerTime &&
      currentTime < duration
    ) {
      setShowNextEpisode(true);
    } else if (currentTime < triggerTime) {
      setShowNextEpisode(false);
      setCountdown(5);
    }
  }, [
    currentTime,
    duration,
    nextEpisode,
  ]);

  useEffect(() => {
    if (
      !showNextEpisode ||
      !nextEpisode ||
      !playing
    ) {
      return;
    }

    if (countdown <= 0) {
      onNextEpisode?.();
      return;
    }

    const timer = setTimeout(() => {
      setCountdown((v) => v - 1);
    }, 1000);

    return () => clearTimeout(timer);
  }, [
    countdown,
    showNextEpisode,
    nextEpisode,
    playing,
    onNextEpisode,
  ]);

    return (
    <div
      ref={playerRef}
      className={`
        relative
        overflow-hidden
        rounded-2xl
        bg-black
        transition-all
        duration-300
        ${
          theaterMode
            ? "w-screen max-w-none aspect-video"
            : "aspect-video w-full"
        }
      `}
      onMouseMove={showUI}
      onMouseEnter={showUI}
      onClick={togglePlay}
    >
      {/* Video */}

      {resolvedSrc && (
        <Video
          src={resolvedSrc}
          poster={poster}
          autoPlay={autoPlay}
          videoRef={videoRef}
          hlsRef={hls}
        />
      )}

      {/* Loading */}

      {loading && <Loading />}

      {videoError && (
        <div className="absolute inset-0 z-40 flex items-center justify-center bg-black/80 p-6 text-center">
          <div>
            <p className="text-lg font-semibold text-white">
              ไม่สามารถโหลดวิดีโอได้
            </p>
            <p className="mt-2 max-w-md text-sm text-white/60">
              {videoError}
            </p>
          </div>
        </div>
      )}

      {/* Center Play */}

      <PlayButton
        playing={playing}
        onClick={togglePlay}
      />

      {/* Controls */}

      {showControls && (
        <div
          className="relative z-40"
          onClick={(e) => e.stopPropagation()}
          onDoubleClick={(e) => e.stopPropagation()}
          onMouseDown={(e) => e.stopPropagation()}
        >
          <Controls
            video={videoRef.current}
            poster={poster}
            currentTime={currentTime}
            duration={duration}
            volume={volume}
            muted={muted}
            onSeek={seek}
            onMute={toggleMute}
            onVolume={changeVolume}
            onFullscreen={toggleFullscreen}
            onTheaterMode={() =>
              setTheaterMode((v) => !v)
            }
          />
        </div>
      )}

      {/* Anime Info */}

      {(title ||
        episode !== undefined) && (
        <div
          className="
            pointer-events-none
            absolute
            left-6
            top-6
            z-30
            text-white
          "
        >
          {title && (
            <h2
              className="
                text-2xl
                font-bold
                drop-shadow-lg
              "
            >
              {title}
            </h2>
          )}

          {episode !== undefined && (
            <p
              className="
                mt-1
                text-sm
                text-white/70
              "
            >
              Episode {episode}
            </p>
          )}
        </div>
      )}

      {/* ===========================
          Skip Intro
      =========================== */}

      {showSkipIntro && (
        <button
          type="button"
          className="
            absolute
            bottom-24
            right-8
            z-50
            rounded-xl
            bg-white
            px-5
            py-3
            font-semibold
            text-black
            shadow-2xl
            transition
            hover:bg-neutral-200
          "
          onClick={(e) => {
            e.stopPropagation();
            skipIntro();
          }}
        >
          ⏭ ข้าม Intro
        </button>
      )}

      {/* ===========================
          Auto Next Episode Overlay
      =========================== */}

      {showNextEpisode &&
        nextEpisode && (
          <div
            className="
              absolute
              bottom-20
              right-6
              z-50
              w-[310px]
              overflow-hidden
              rounded-xl
              border
              border-white/10
              bg-black/85
              shadow-2xl
              backdrop-blur-xl
            "
            onClick={(e) =>
              e.stopPropagation()
            }
          >
            <div className="px-5 py-4">

              <div className="flex items-center justify-between">
                <p className="text-xs font-medium text-white/50">
                  ตอนต่อไป
                </p>

                <button
                  type="button"
                  onClick={() =>
                    setShowNextEpisode(false)
                  }
                  className="
                    flex
                    h-7
                    w-7
                    items-center
                    justify-center
                    rounded-full
                    text-sm
                    text-white/60
                    transition
                    hover:bg-white/10
                    hover:text-white
                  "
                  aria-label="ปิด"
                >
                  ×
                </button>
              </div>

              <h3 className="mt-1 text-lg font-bold leading-tight text-white">
                {nextEpisode.title}
              </h3>

              <p className="mt-1 text-xs text-white/45">
                Episode {nextEpisode.episodeNumber}
              </p>

              {typeof nextEpisodeTime === "number" && (
                <p className="mt-2 text-[11px] text-white/35">
                  เริ่มตอนถัดไปที่{" "}
                  {Math.floor(nextEpisodeTime / 60)}:
                  {String(
                    Math.floor(nextEpisodeTime % 60)
                  ).padStart(2, "0")}
                </p>
              )}

              <div className="mt-4 flex items-center justify-between gap-3">

                <div className="flex items-baseline gap-1">
                  <span className="text-3xl font-bold leading-none text-white">
                    {countdown}
                  </span>
                  <span className="text-xs text-white/40">
                    วิ
                  </span>
                </div>

                <button
                  type="button"
                  onClick={() =>
                    onNextEpisode?.()
                  }
                  className="
                    rounded-lg
                    bg-white
                    px-4
                    py-2
                    text-sm
                    font-semibold
                    text-black
                    transition
                    hover:bg-neutral-200
                  "
                >
                  ▶ เล่นตอนถัดไป
                </button>

              </div>
            </div>
          </div>
      )}

      {/* Double Tap Left / Double Click Left */}

      <button
        type="button"
        aria-label="ย้อนกลับ 10 วินาที"
        className="
          absolute
          left-0
          top-0
          z-20
          h-full
          w-1/3
          bg-transparent
          touch-manipulation
        "
        onDoubleClick={(e) => {
          e.stopPropagation();
          seekBy(-10);
          showUI();
        }}
        onTouchEnd={(e) => {
          e.preventDefault();
          e.stopPropagation();

          const now = Date.now();

          if (
            now - lastLeftTap.current <
            350
          ) {
            lastLeftTap.current = 0;
            seekBy(-10);
            showUI();
            return;
          }

          lastLeftTap.current = now;
          showUI();
        }}
      />

      {/* Double Tap Right / Double Click Right */}

      <button
        type="button"
        aria-label="ข้ามไป 10 วินาที"
        className="
          absolute
          right-0
          top-0
          z-20
          h-full
          w-1/3
          bg-transparent
          touch-manipulation
        "
        onDoubleClick={(e) => {
          e.stopPropagation();
          seekBy(10);
          showUI();
        }}
        onTouchEnd={(e) => {
          e.preventDefault();
          e.stopPropagation();

          const now = Date.now();

          if (
            now - lastRightTap.current <
            350
          ) {
            lastRightTap.current = 0;
            seekBy(10);
            showUI();
            return;
          }

          lastRightTap.current = now;
          showUI();
        }}
      />
    </div>
  );
}