"use client";

import { useEffect, useState } from "react";

export type EpisodeItem = {
  id: string;
  title: string | null;
  episodeNumber: number;
  videoUrl: string;
  thumbnail: string | null;
  duration: number | null;
  seasonId: string | null;
  views: number;

  introStart: number | null;
  introEnd: number | null;
  nextEpisodeTime: number | null;
};

type LikeState = {
  liked: boolean;
  count: number;
};

type Props = {
  episodes: EpisodeItem[];
  currentEpisodeId: string;
  onSelectEpisode: (episode: EpisodeItem) => void;
};

function formatViews(views: number) {
  if (views >= 1_000_000) {
    return `${(views / 1_000_000)
      .toFixed(1)
      .replace(".0", "")}M`;
  }

  if (views >= 1_000) {
    return `${(views / 1_000)
      .toFixed(1)
      .replace(".0", "")}K`;
  }

  return views.toString();
}

function formatLikes(likes: number) {
  if (likes >= 1_000_000) {
    return `${(likes / 1_000_000)
      .toFixed(1)
      .replace(".0", "")}M`;
  }

  if (likes >= 1_000) {
    return `${(likes / 1_000)
      .toFixed(1)
      .replace(".0", "")}K`;
  }

  return likes.toString();
}

export default function EpisodeList({
  episodes,
  currentEpisodeId,
  onSelectEpisode,
}: Props) {
  const [likes, setLikes] = useState<
    Record<string, LikeState>
  >({});

  const [liking, setLiking] = useState<
    Record<string, boolean>
  >({});

  // โหลดจำนวน Like ของแต่ละ Episode
  useEffect(() => {
    let cancelled = false;

    async function loadLikes() {
      const results = await Promise.all(
        episodes.map(async (episode) => {
          try {
            const response = await fetch(
              `/api/episodes/${episode.id}/like`,
              {
                method: "GET",
                cache: "no-store",
              }
            );

            if (!response.ok) {
              return {
                id: episode.id,
                liked: false,
                count: 0,
              };
            }

            const data = await response.json();

            return {
              id: episode.id,
              liked: Boolean(data.liked),
              count:
                typeof data.count === "number"
                  ? data.count
                  : 0,
            };
          } catch (error) {
            console.error(
              "LOAD EPISODE LIKE ERROR:",
              error
            );

            return {
              id: episode.id,
              liked: false,
              count: 0,
            };
          }
        })
      );

      if (cancelled) {
        return;
      }

      const nextLikes: Record<
        string,
        LikeState
      > = {};

      for (const result of results) {
        nextLikes[result.id] = {
          liked: result.liked,
          count: result.count,
        };
      }

      setLikes(nextLikes);
    }

    if (episodes.length > 0) {
      loadLikes();
    }

    return () => {
      cancelled = true;
    };
  }, [episodes]);

  // กด Like / Unlike
  async function toggleLike(
    episodeId: string
  ) {
    if (liking[episodeId]) {
      return;
    }

    setLiking((prev) => ({
      ...prev,
      [episodeId]: true,
    }));

    try {
      const response = await fetch(
        `/api/episodes/${episodeId}/like`,
        {
          method: "POST",
        }
      );

      const data = await response.json();

      if (response.status === 401) {
        alert(
          "กรุณาเข้าสู่ระบบก่อนกดถูกใจ"
        );
        return;
      }

      if (!response.ok) {
        throw new Error(
          data?.error ??
            "ไม่สามารถกด Like ได้"
        );
      }

      setLikes((prev) => ({
        ...prev,
        [episodeId]: {
          liked: Boolean(data.liked),
          count:
            typeof data.count === "number"
              ? data.count
              : 0,
        },
      }));
    } catch (error) {
      console.error(
        "TOGGLE EPISODE LIKE ERROR:",
        error
      );

      alert(
        "ไม่สามารถกดถูกใจได้ กรุณาลองใหม่"
      );
    } finally {
      setLiking((prev) => ({
        ...prev,
        [episodeId]: false,
      }));
    }
  }

  return (
    <div className="grid grid-cols-2 gap-x-3 gap-y-7 md:grid-cols-3 lg:grid-cols-4">
      {episodes.length === 0 ? (
        <div className="col-span-full rounded-xl border border-[#232335] bg-[#131320] p-8 text-center text-white/60">
          Season นี้ยังไม่มีตอน
        </div>
      ) : (
        episodes.map((episode) => {
          const active =
            currentEpisodeId === episode.id;

          const likeState = likes[
            episode.id
          ] ?? {
            liked: false,
            count: 0,
          };

          const isLiking =
            liking[episode.id] ?? false;

          return (
            <div
              key={episode.id}
              className="group min-w-0 text-left"
            >
              {/* =========================
                  Thumbnail
              ========================= */}

              <div
                role="button"
                tabIndex={0}
                onClick={() =>
                  onSelectEpisode(episode)
                }
                onKeyDown={(event) => {
                  if (
                    event.key === "Enter" ||
                    event.key === " "
                  ) {
                    event.preventDefault();
                    onSelectEpisode(
                      episode
                    );
                  }
                }}
                className={`
                  relative
                  aspect-video
                  w-full
                  cursor-pointer
                  overflow-hidden
                  rounded-xl
                  border
                  bg-[#131320]
                  transition-all
                  duration-300
                  ${
                    active
                      ? "border-[#8b5cf6] shadow-[0_0_25px_rgba(255,93,115,.18)]"
                      : "border-transparent group-hover:border-[#8b5cf6]/60"
                  }
                `}
              >
                {episode.thumbnail ? (
                  <img
                    src={episode.thumbnail}
                    alt={
                      episode.title ??
                      `Episode ${episode.episodeNumber}`
                    }
                    className="
                      h-full
                      w-full
                      object-cover
                      transition-transform
                      duration-500
                      group-hover:scale-105
                    "
                  />
                ) : (
                  <div className="flex h-full w-full items-center justify-center bg-[#1a1a28] text-sm text-white/30">
                    ไม่มีรูป
                  </div>
                )}

                {/* Dark overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent" />

                {/* Episode number */}
                <div className="absolute left-3 top-3 rounded-md bg-black/75 px-2.5 py-1 text-sm font-black text-white backdrop-blur-sm">
                  EP.
                  {episode.episodeNumber}
                </div>

                {/* Active indicator */}
                {active && (
                  <div className="absolute bottom-3 left-3 rounded-md bg-[#8b5cf6] px-2.5 py-1 text-xs font-bold text-black">
                    กำลังดู
                  </div>
                )}

                {/* Duration */}
                {episode.duration !== null && (
                  <div className="absolute bottom-3 right-3 rounded-md bg-black/75 px-2 py-1 text-xs text-white backdrop-blur-sm">
                    {Math.floor(
                      episode.duration / 60
                    )}{" "}
                    นาที
                  </div>
                )}

                {/* Play icon */}
                <div
                  className="
                    absolute
                    left-1/2
                    top-1/2
                    flex
                    h-11
                    w-11
                    -translate-x-1/2
                    -translate-y-1/2
                    items-center
                    justify-center
                    rounded-full
                    bg-black/60
                    text-white
                    opacity-0
                    backdrop-blur-sm
                    transition-all
                    duration-300
                    group-hover:scale-110
                    group-hover:opacity-100
                  "
                >
                  <svg
                    viewBox="0 0 24 24"
                    fill="currentColor"
                    className="ml-0.5 h-5 w-5"
                  >
                    <path d="M8 5v14l11-7z" />
                  </svg>
                </div>
              </div>

              {/* =========================
                  Episode info
              ========================= */}

              <div className="mt-2.5 min-w-0">
                <h3
                  onClick={() =>
                    onSelectEpisode(episode)
                  }
                  className={`
                    cursor-pointer
                    truncate
                    text-sm
                    font-semibold
                    transition-colors
                    ${
                      active
                        ? "text-[#8b5cf6]"
                        : "text-white group-hover:text-[#8b5cf6]"
                    }
                  `}
                >
                  EP.
                  {episode.episodeNumber}{" "}
                  <span className="text-white/80">
                    |{" "}
                    {episode.title ??
                      "ไม่มีชื่อตอน"}
                  </span>
                </h3>

                {/* Views + Like + Duration */}
                <div className="mt-1 flex items-center gap-3 text-xs text-white/40">
                  {/* Views */}
                  <span>
                    ▶{" "}
                    {formatViews(
                      episode.views
                    )}
                  </span>

                  {/* Like */}
                  <button
                    type="button"
                    onClick={(event) => {
                      event.stopPropagation();
                      toggleLike(
                        episode.id
                      );
                    }}
                    disabled={isLiking}
                    aria-label={
                      likeState.liked
                        ? "ยกเลิกถูกใจ"
                        : "ถูกใจตอนนี้"
                    }
                    className={`
                      inline-flex
                      items-center
                      gap-1
                      rounded-md
                      px-1.5
                      py-0.5
                      transition-all
                      ${
                        likeState.liked
                          ? "text-[#8b5cf6]"
                          : "text-white/40 hover:bg-white/5 hover:text-[#8b5cf6]"
                      }
                      ${
                        isLiking
                          ? "cursor-wait opacity-50"
                          : ""
                      }
                    `}
                  >
                    <svg
                      viewBox="0 0 24 24"
                      fill={
                        likeState.liked
                          ? "currentColor"
                          : "none"
                      }
                      stroke="currentColor"
                      strokeWidth="2"
                      className="h-3.5 w-3.5"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78L12 21.23l8.84-8.84a5.5 5.5 0 0 0 0-7.78z"
                      />
                    </svg>

                    <span>
                      {formatLikes(
                        likeState.count
                      )}
                    </span>
                  </button>

                  {/* Duration */}
                  {episode.duration !== null && (
                    <span>
                      {Math.floor(
                        episode.duration / 60
                      )}{" "}
                      นาที
                    </span>
                  )}
                </div>
              </div>
            </div>
          );
        })
      )}
    </div>
  );
}