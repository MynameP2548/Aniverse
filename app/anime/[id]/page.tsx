import prisma from "@/lib/prisma";
import Navbar from "@/components/Navbar";
import Link from "next/link";
import { notFound } from "next/navigation";
import { auth } from "@/auth";
import TrackWatch from "@/components/TrackWatch";
import ReviewSection from "@/components/ReviewSection";

export const dynamic = "force-dynamic";

// Direct video files (e.g. .mp4 demo/sample clips) need a <video> tag.
// Embed pages (YouTube /embed/, Vimeo player, etc.) need an <iframe>.
function isDirectVideoFile(url: string): boolean {
  return /\.(mp4|webm|ogg|mov)(\?.*)?$/i.test(url);
}

type Props = {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ ep?: string }>;
};

export default async function AnimeDetailPage({ params, searchParams }: Props) {
  const { id } = await params;
  const { ep } = await searchParams;
  const session = await auth();

  const anime = await prisma.anime.findUnique({
    where: { id },
    include: { episodes: { orderBy: { episodeNumber: "asc" } } },
  });

  if (!anime) notFound();

const currentEpisode = ep
  ? anime.episodes.find(
      (e: (typeof anime.episodes)[number]) =>
        e.episodeNumber === Number(ep)
    )
  : anime.episodes[0];

  return (
    <div className="min-h-screen bg-[#0b0b12] text-[#e8e6f0]">
      <Navbar />

      <main className="max-w-6xl mx-auto px-6 pt-24 pb-16">
        {/* Silently records that the logged-in user watched this episode */}
        {currentEpisode && (
          <TrackWatch episodeId={currentEpisode.id} isLoggedIn={!!session?.user} />
        )}

        {/* Video player */}
        <div className="w-full aspect-video bg-[#131320] border border-[#232335] rounded-xl overflow-hidden mb-6">
          {currentEpisode ? (
            isDirectVideoFile(currentEpisode.videoUrl) ? (
              <video
                key={currentEpisode.id}
                src={currentEpisode.videoUrl}
                controls
                autoPlay
                className="w-full h-full bg-black"
              >
                เบราว์เซอร์ของคุณไม่รองรับการเล่นวิดีโอ
              </video>
            ) : (
              <iframe
                key={currentEpisode.id}
                src={currentEpisode.videoUrl}
                title={`${anime.title} EP${currentEpisode.episodeNumber}`}
                className="w-full h-full"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            )
          ) : (
            <div className="w-full h-full flex items-center justify-center text-[#5a5770] text-sm">
              ยังไม่มีตอนให้ดูในเรื่องนี้
            </div>
          )}
        </div>

        {/* Title + meta */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <h1 className="text-2xl md:text-3xl font-black tracking-tight">{anime.title}</h1>
            <span
              className={`text-[10px] px-2 py-0.5 rounded-full flex-shrink-0 ${
                anime.status === "ONGOING"
                  ? "bg-[#1e3a2e] text-[#5ee6a0]"
                  : "bg-[#2a2a3d] text-[#8a87a3]"
              }`}
            >
              {anime.status === "ONGOING" ? "กำลังฉาย" : "จบแล้ว"}
            </span>
          </div>
          {currentEpisode && (
            <p className="text-sm text-[#ff5d73] font-semibold mb-3">
              กำลังดู: EP{currentEpisode.episodeNumber}
              {currentEpisode.title ? ` · ${currentEpisode.title}` : ""}
            </p>
          )}
          <div className="flex flex-wrap gap-2 mb-4">
            {anime.releaseYear && (
              <span className="text-xs px-2.5 py-1 rounded-full border border-[#2a2a3d] text-[#8a87a3]">
                {anime.releaseYear}
              </span>
            )}
            {anime.genres.map((g) => (
              <span
                key={g}
                className="text-xs px-2.5 py-1 rounded-full border border-[#2a2a3d] text-[#8a87a3]"
              >
                {g}
              </span>
            ))}
          </div>
          {anime.description && (
            <p className="text-[#a8a5bd] text-sm leading-relaxed max-w-3xl">
              {anime.description}
            </p>
          )}
        </div>

        {/* Episode list */}
        <section>
          <h2 className="text-lg font-bold mb-4">รายการตอน ({anime.episodes.length})</h2>
          {anime.episodes.length === 0 ? (
            <p className="text-[#8a87a3] text-sm">ยังไม่มีตอนในเรื่องนี้</p>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
              {anime.episodes.map((episode) => {
                const isActive = currentEpisode?.id === episode.id;
                return (
                  <Link
                    key={episode.id}
                    href={`/anime/${anime.id}?ep=${episode.episodeNumber}`}
                    className={`rounded-lg border p-3 transition ${
                      isActive
                        ? "border-[#ff5d73] bg-[#ff5d73]/10"
                        : "border-[#232335] bg-[#131320] hover:border-[#3a3a52]"
                    }`}
                  >
                    <p
                      className={`text-sm font-bold ${
                        isActive ? "text-[#ff5d73]" : "text-[#e8e6f0]"
                      }`}
                    >
                      EP {episode.episodeNumber}
                    </p>
                    {episode.title && (
                      <p className="text-xs text-[#8a87a3] truncate mt-1">{episode.title}</p>
                    )}
                  </Link>
                );
              })}
            </div>
          )}
        </section>

        <ReviewSection
          animeId={anime.id}
          isLoggedIn={!!session?.user}
          currentUserId={session?.user?.id}
        />
      </main>
    </div>
  );
}
