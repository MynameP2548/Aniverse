"use client";

import { useRouter } from "next/navigation";

type Season = {
  id: string;
  seasonNumber: number;
  title: string | null;
};

type Props = {
  animeId: string;
  seasons: Season[];
  selected?: string;
};

export default function SeasonSelector({
  animeId,
  seasons,
  selected,
}: Props) {
  const router = useRouter();

  return (
    <select
      value={selected}
      onChange={(e) => {
        router.push(
          `/anime/${animeId}?season=${e.target.value}`
        );
      }}
      className="rounded-lg border border-[#2a2a3d] bg-[#131320] px-4 py-2 text-white"
    >
      {seasons.map((season) => (
        <option
          key={season.id}
          value={season.id}
        >
          {season.title ??
            `Season ${season.seasonNumber}`}
        </option>
      ))}
    </select>
  );
}