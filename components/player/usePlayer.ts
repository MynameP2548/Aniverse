"use client";

import { useEffect, useRef } from "react";
import Hls from "hls.js";

export default function usePlayer() {
  const playerRef = useRef<HTMLDivElement>(null);

  const videoRef = useRef<HTMLVideoElement>(null);

  const hls = useRef<Hls | null>(null);

  useEffect(() => {
    return () => {
      hls.current?.destroy();
      hls.current = null;
    };
  }, []);

  return {
    playerRef,
    videoRef,
    hls,
  };
}