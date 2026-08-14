"use client";

import {
  RefObject,
  useEffect,
} from "react";

import Hls from "hls.js";

type Props = {
  src: string;
  poster?: string;
  autoPlay?: boolean;

  videoRef: RefObject<HTMLVideoElement | null>;

  hlsRef: React.MutableRefObject<Hls | null>;

  selectedAudioLanguage?:
    | "THAI"
    | "JAPANESE"
    | null;
};

function isHlsSource(src: string) {
  try {
    const url = new URL(src);
    const pathname = url.pathname.toLowerCase();

    return (
      pathname.endsWith(".m3u8") ||
      pathname.includes("/api/video/") &&
        pathname.endsWith("/hls")
    );
  } catch {
    const lower = src.toLowerCase();

    return (
      lower.endsWith(".m3u8") ||
      lower.includes("/api/video/") &&
        lower.includes("/hls")
    );
  }
}

function findAudioTrack(
  hls: Hls,
  language: "THAI" | "JAPANESE"
) {
  return hls.audioTracks.findIndex((track) => {
    const lang = String(
      track.lang ?? ""
    ).toLowerCase();

    const name = String(
      track.name ?? ""
    ).toLowerCase();

    if (language === "THAI") {
      return (
        lang === "th" ||
        lang === "tha" ||
        lang.startsWith("th-") ||
        name.includes("thai") ||
        name.includes("ไทย")
      );
    }

    return (
      lang === "ja" ||
      lang === "jpn" ||
      lang.startsWith("ja-") ||
      name.includes("japanese") ||
      name.includes("日本語") ||
      name.includes("ญี่ปุ่น")
    );
  });
}

export default function Video({
  src,
  poster,
  autoPlay = true,
  videoRef,
  hlsRef,
  selectedAudioLanguage,
}: Props) {
  // ==================================================
  // Create / destroy player when source changes
  // ==================================================
  useEffect(() => {
    const video = videoRef.current;

    if (!video) return;

    if (hlsRef.current) {
      hlsRef.current.destroy();
      hlsRef.current = null;
    }

    video.removeAttribute("src");
    video.load();

    const hlsSource = isHlsSource(src);

    // ==========================
    // HLS.js
    // ==========================
    if (hlsSource && Hls.isSupported()) {
      const hls = new Hls({
        enableWorker: true,
        lowLatencyMode: false,
        backBufferLength: 90,
        maxBufferLength: 30,
        maxMaxBufferLength: 60,
      });

      hlsRef.current = hls;

      hls.on(
        Hls.Events.MANIFEST_PARSED,
        () => {
          if (autoPlay) {
            video.play().catch(() => {});
          }
        }
      );

      hls.on(
        Hls.Events.ERROR,
        (_event, data) => {
          if (data?.fatal) {
            console.error("HLS ERROR:", {
              type: data.type,
              details: data.details,
              fatal: data.fatal,
              response: data.response,
              reason: data.reason,
              url: data.url,
            });
          }
        }
      );

      hls.loadSource(src);
      hls.attachMedia(video);

      return () => {
        hls.destroy();

        if (hlsRef.current === hls) {
          hlsRef.current = null;
        }
      };
    }

    // ==========================
    // Safari native HLS
    // ==========================
    if (
      hlsSource &&
      video.canPlayType(
        "application/vnd.apple.mpegurl"
      )
    ) {
      video.src = src;

      if (autoPlay) {
        video.play().catch(() => {});
      }

      return () => {
        video.removeAttribute("src");
        video.load();
      };
    }

    // ==========================
    // MP4
    // ==========================
    video.src = src;

    if (autoPlay) {
      video.play().catch(() => {});
    }

    return () => {
      video.removeAttribute("src");
      video.load();
    };
  }, [
    src,
    autoPlay,
    videoRef,
    hlsRef,
  ]);

  // ==================================================
  // Change audio track WITHOUT recreating HLS
  // ==================================================
  useEffect(() => {
    const hls = hlsRef.current;

    if (!hls || !selectedAudioLanguage) {
      return;
    }

    const applyAudio = () => {
      const index = findAudioTrack(
        hls,
        selectedAudioLanguage
      );

      if (index >= 0 && hls.audioTrack !== index) {
        hls.audioTrack = index;
      }
    };

    applyAudio();

    hls.on(
      Hls.Events.AUDIO_TRACKS_UPDATED,
      applyAudio
    );

    hls.on(
      Hls.Events.MANIFEST_PARSED,
      applyAudio
    );

    return () => {
      hls.off(
        Hls.Events.AUDIO_TRACKS_UPDATED,
        applyAudio
      );
      hls.off(
        Hls.Events.MANIFEST_PARSED,
        applyAudio
      );
    };
  }, [
    selectedAudioLanguage,
    hlsRef,
  ]);

  return (
    <video
      ref={videoRef}
      poster={poster}
      playsInline
      preload="metadata"
      controls={false}
      className="
        h-full
        w-full
        select-none
        object-contain
        bg-black
      "
    />
  );
}
