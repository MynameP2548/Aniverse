"use client";

import { useEffect } from "react";

type Props = {
  episodeId: string;
  isLoggedIn: boolean;
};

export default function TrackWatch({ episodeId, isLoggedIn }: Props) {
  useEffect(() => {
    if (!isLoggedIn) return;
    fetch("/api/watch-history", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ episodeId }),
    }).catch(() => {});
  }, [episodeId, isLoggedIn]);

  return null;
}
