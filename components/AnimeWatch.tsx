"use client";

import {
  useEffect,
  useMemo,
  useState,
} from "react";

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
  const [episodeList, setEpisodeList] =
    useState<Episode[]>(episodes);

  const [currentEpisode, setCurrentEpisode] =
    useState<Episode>(initialEpisode);

  const currentIndex = useMemo(
    () =>
      episodeList.findIndex(
        (e) =>
          e.id === currentEpisode.id
      ),
    [episodeList, currentEpisode]
  );

  const nextEpisode =
    currentIndex >= 0 &&
    currentIndex <
      episodeList.length - 1
      ? episodeList[
          currentIndex + 1
        ]
      : undefined;

  useEffect(() => {
    let cancelled = false;

    async function addView() {
      try {
        const res = await fetch(
          `/api/episodes/${currentEpisode.id}/view`,
          {
            method: "POST",
          }
        );

        const data =
          await res.json();

        if (
          !res.ok ||
          cancelled
        ) {
          return;
        }

        if (
          typeof data.views !==
          "number"
        ) {
          return;
        }

        setEpisodeList((prev) =>
          prev.map((episode) =>
            episode.id ===
            currentEpisode.id
              ? {
                  ...episode,
                  views: data.views,
                }
              : episode
          )
        );

        setCurrentEpisode((prev) =>
          prev.id ===
          currentEpisode.id
            ? {
                ...prev,
                views: data.views,
              }
            : prev
        );
      } catch (error) {
        console.error(
          "ADD VIEW ERROR:",
          error
        );
      }
    }

    addView();

    return () => {
      cancelled = true;
    };
  }, [currentEpisode.id]);

  function selectEpisode(
    episode: Episode
  ) {
    setCurrentEpisode(
      episode
    );

    const url =
      new URL(
        window.location.href
      );

    url.searchParams.set(
      "season",
      activeSeason.id
    );

    url.searchParams.set(
      "ep",
      String(
        episode.episodeNumber
      )
    );

    window.history.replaceState(
      {},
      "",
      url
    );
  }

  function goToNextEpisode() {
    if (!nextEpisode) {
      return;
    }

    selectEpisode(
      nextEpisode
    );
  }

  return (
    <div className="player-cinematic space-y-8">

<Player
  episodeId={currentEpisode.id}
        src={
          currentEpisode.videoUrl
        }
        poster={
          anime.bannerImage ??
          anime.coverImage ??
          ""
        }
        title={
          anime.title
        }
        episode={
          currentEpisode.episodeNumber
        }
        autoPlay
        introStart={
          currentEpisode.introStart
        }
        introEnd={
          currentEpisode.introEnd
        }
        nextEpisodeTime={
          currentEpisode.nextEpisodeTime
        }
        onNextEpisode={
          goToNextEpisode
        }
        nextEpisode={
          nextEpisode
            ? {
                slug: anime.slug,
                seasonId:
                  activeSeason.id,
                episodeNumber:
                  nextEpisode.episodeNumber,
                title:
                  nextEpisode.title ??
                  `Episode ${nextEpisode.episodeNumber}`,
              }
            : undefined
        }
      />

      <div>
        <h2 className="mb-6 text-2xl font-bold text-white">
          รายการตอน (
          {episodeList.length}
          )
        </h2>

        <EpisodeList
          episodes={
            episodeList
          }
          currentEpisodeId={
            currentEpisode.id
          }
          onSelectEpisode={
            selectEpisode
          }
        />
      </div>

    </div>
  );
}