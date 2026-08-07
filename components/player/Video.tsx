"use client";

import { RefObject, useEffect } from "react";
import Hls from "hls.js";

type Props = {
  src: string;
  poster?: string;
  autoPlay?: boolean;

  videoRef: RefObject<HTMLVideoElement | null>;
  hlsRef: React.MutableRefObject<Hls | null>;
};

export default function Video({
  src,
  poster,
  autoPlay = true,
  videoRef,
  hlsRef,
}: Props) {
  useEffect(() => {
    const video = videoRef.current;

    if (!video) return;

    // ล้าง HLS เดิม
    hlsRef.current?.destroy();
    hlsRef.current = null;

    if (src.endsWith(".m3u8")) {
      if (Hls.isSupported()) {
        const hls = new Hls({
          enableWorker: true,
          lowLatencyMode: true,
        });

        hls.loadSource(src);
        hls.attachMedia(video);

        hlsRef.current = hls;
      } else if (
        video.canPlayType(
          "application/vnd.apple.mpegurl"
        )
      ) {
        video.src = src;
      }
    } else {
      video.src = src;
    }

    if (autoPlay) {
      video
        .play()
        .catch(() => {
          // Browser อาจบล็อก AutoPlay ถ้ายังไม่ได้โต้ตอบกับผู้ใช้
        });
    }

    return () => {
      hlsRef.current?.destroy();
      hlsRef.current = null;
    };
  }, [src, autoPlay, videoRef, hlsRef]);

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