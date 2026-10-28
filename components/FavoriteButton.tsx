"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

type Props = {
  animeId: string;
  isLoggedIn: boolean;
};

export default function FavoriteButton({ animeId, isLoggedIn }: Props) {
  const router = useRouter();
  const [isFavorite, setIsFavorite] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!isLoggedIn) return;
    fetch(`/api/anime/${animeId}/favorite`)
      .then((r) => r.json())
      .then((data) => setIsFavorite(!!data.isFavorite))
      .catch(() => {});
  }, [animeId, isLoggedIn]);

  async function handleClick() {
    if (!isLoggedIn) {
      router.push("/login");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch(`/api/anime/${animeId}/favorite`, { method: "POST" });
      if (res.status === 401) {
        router.push("/login");
        return;
      }
      const data = await res.json();
      setIsFavorite(!!data.isFavorite);
    } finally {
      setLoading(false);
    }
  }

  return (
    <button
      onClick={handleClick}
      disabled={loading}
      className={`flex items-center gap-2 px-6 py-3 rounded-lg text-sm font-semibold border transition disabled:opacity-50 ${
        isFavorite
          ? "bg-[#8b5cf6]/10 border-[#8b5cf6] text-[#8b5cf6]"
          : "bg-[#131320]/80 border-[#2a2a3d] text-[#e8e6f0] hover:border-[#3a3a52]"
      }`}
    >
      <svg
        className="w-4 h-4"
        fill={isFavorite ? "currentColor" : "none"}
        stroke="currentColor"
        strokeWidth={2}
        viewBox="0 0 24 24"
      >
        <path d="M12 21s-7.5-4.6-10-9.1C.5 8.4 2 4.5 6 4c2.2-.3 3.9 1 6 3.3C14.1 5 15.8 3.7 18 4c4 .5 5.5 4.4 4 7.9C19.5 16.4 12 21 12 21z" />
      </svg>
      {isFavorite ? "อยู่ในรายการโปรด" : "เพิ่มรายการโปรด"}
    </button>
  );
}
