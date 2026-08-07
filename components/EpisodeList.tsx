"use client";

export type EpisodeItem = {
  id: string;
  title: string | null;
  episodeNumber: number;
  videoUrl: string;
  thumbnail: string | null;
  duration: number | null;
  seasonId: string | null;
};

type Props = {
  episodes: EpisodeItem[];
  currentEpisodeId: string;
  onSelectEpisode: (episode: EpisodeItem) => void;
};

export default function EpisodeList({
  episodes,
  currentEpisodeId,
  onSelectEpisode,
}: Props) {
  return (
    <div className="space-y-4">
      {episodes.length === 0 ? (
        <div className="rounded-xl border border-[#232335] bg-[#131320] p-8 text-center text-white/60">
          Season นี้ยังไม่มีตอน
        </div>
      ) : (
        episodes.map((episode) => {
          const active =
            currentEpisodeId === episode.id;

          return (
            <button
              key={episode.id}
              type="button"
              onClick={() =>
                onSelectEpisode(episode)
              }
              className={`
                group
                flex
                w-full
                overflow-hidden
                rounded-2xl
                border
                transition-all
                duration-300
                ${
                  active
                    ? "border-[#ff5d73] bg-[#ff5d73]/10 shadow-[0_0_30px_rgba(255,93,115,.15)]"
                    : "border-[#232335] bg-[#131320] hover:border-[#ff5d73]/50 hover:bg-[#181827]"
                }
              `}
            >
              <div className="relative h-32 w-56 shrink-0 overflow-hidden">
                {episode.thumbnail ? (
                  <img
                    src={episode.thumbnail}
                    alt={episode.title ?? ""}
                    className="h-full w-full object-cover transition duration-500 group-hover:scale-110"
                  />
                ) : (
                  <div className="flex h-full w-full items-center justify-center bg-[#1a1a28] text-white/30">
                    ไม่มีรูป
                  </div>
                )}
              </div>

              <div className="flex flex-1 items-center justify-between p-6">
                <div>
                  <div className="mb-2 flex items-center gap-3">
                    <span className="text-xl font-black text-[#ff5d73]">
                      {episode.episodeNumber
                        .toString()
                        .padStart(2, "0")}
                    </span>

                    <h3 className="text-lg font-bold text-white">
                      {episode.title ??
                        `Episode ${episode.episodeNumber}`}
                    </h3>
                  </div>

                  <p className="text-sm text-white/50">
                    {episode.title ??
                      "ไม่มีรายละเอียด"}
                  </p>
                </div>

                {episode.duration && (
                  <span className="text-sm text-white/40">
                    {Math.floor(
                      episode.duration / 60
                    )}{" "}
                    นาที
                  </span>
                )}
              </div>
            </button>
          );
        })
      )}
    </div>
  );
}