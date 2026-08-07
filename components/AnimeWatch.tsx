"use client";

import { useMemo, useState } from "react";

import Player from "@/components/player";
import EpisodeList, {
  EpisodeItem,
} from "./EpisodeList";

type Episode = EpisodeItem;

type Season = {
  id: string;
  title: string | null;
  seasonNumber: number;
};

type Anime = {
  slug: string;
  title: string;
  bannerImage: string | null;
  coverImage: string | null;
};

type Props = {
  anime: Anime;
  seasons: Season[];
  activeSeason: Season;
  episodes: Episode[];
  initialEpisode: Episode;
};

export default function AnimeWatch({
  anime,
  activeSeason,
  episodes,
  initialEpisode,
}: Props) {

    const [currentEpisode, setCurrentEpisode] =
  useState<Episode>(initialEpisode);

  const currentIndex = useMemo(
    () =>
      episodes.findIndex(
        (e) =>
          e.id === currentEpisode.id
      ),
    [episodes, currentEpisode]
  );

  const nextEpisode =
    currentIndex >= 0 &&
    currentIndex <
      episodes.length - 1
      ? episodes[currentIndex + 1]
      : undefined;

return (
  <div className="space-y-8">
    <Player
      episodeId={currentEpisode.id}
      src={currentEpisode.videoUrl}
      poster={anime.bannerImage ?? anime.coverImage ?? ""}
      title={anime.title}
      episode={currentEpisode.episodeNumber}
      autoPlay

onNextEpisode={() => {
  if (!nextEpisode) return;

  setCurrentEpisode(nextEpisode);

  const url = new URL(window.location.href);
  url.searchParams.set("season", activeSeason.id);
  url.searchParams.set("ep", String(nextEpisode.episodeNumber));

  window.history.replaceState({}, "", url);
}}

      nextEpisode={
        nextEpisode
          ? {
              slug: anime.slug,
              seasonId: activeSeason.id,
              episodeNumber: nextEpisode.episodeNumber,
              title:
                nextEpisode.title ??
                `Episode ${nextEpisode.episodeNumber}`,
            }
          : undefined
      }
    />

    <div>
      <h2 className="mb-6 text-2xl font-bold text-white">
        รายการตอน ({episodes.length})
      </h2>

      <EpisodeList
        episodes={episodes}
        currentEpisodeId={currentEpisode.id}
onSelectEpisode={(episode) => {
  setCurrentEpisode(episode);

  const url = new URL(window.location.href);
  url.searchParams.set("season", activeSeason.id);
  url.searchParams.set("ep", String(episode.episodeNumber));

  window.history.replaceState({}, "", url);
}}
      />
    </div>
  </div>
);
}