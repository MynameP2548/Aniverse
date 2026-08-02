import prisma from "@/lib/prisma";
import Navbar from "@/components/Navbar";
import Hero from "@/components/Hero";
import AnimeRow from "@/components/AnimeRow";
import { auth } from "@/auth";

export const dynamic = "force-dynamic"; // always show latest admin-added anime

export default async function HomePage() {
  const session = await auth();

  const animeList = await prisma.anime.findMany({
    orderBy: { createdAt: "desc" },
  });

  if (animeList.length === 0) {
    return (
      <div className="min-h-screen bg-[#0b0b12] text-[#e8e6f0] flex flex-col">
        <Navbar />
        <div className="flex-1 flex flex-col items-center justify-center px-6 text-center">
          <h1 className="text-2xl font-bold mb-2">ยังไม่มีอนิเมะในระบบ</h1>
          <p className="text-[#8a87a3] text-sm">
            ไปที่หน้า{" "}
            <a href="/admin" className="text-[#ff5d73] underline">
              /admin
            </a>{" "}
            เพื่อเพิ่มอนิเมะเรื่องแรก
          </p>
        </div>
      </div>
    );
  }

  // Featured = whichever anime has a banner image, otherwise the newest one
// สุ่มเฉพาะอนิเมะที่มีรูป Banner
// -----------------------------
// Netflix Hero
// -----------------------------

const featuredList = await prisma.anime.findMany({
  where: {
    featured: true,
  },

  orderBy: {
    heroOrder: "asc",
  },
});

const heroPool =
  featuredList.length > 0
    ? featuredList
    : animeList.filter(
        (a) => a.bannerImage || a.coverImage
      );

const featured =
  heroPool[
    Math.floor(
      Math.random() * heroPool.length
    )
  ] ?? animeList[0];
  // Group the rest by genre for the horizontal rows
  const genreMap = new Map<string, typeof animeList>();
  for (const anime of animeList) {
    for (const genre of anime.genres.length ? anime.genres : ["ยังไม่ระบุแนว"]) {
      if (!genreMap.has(genre)) genreMap.set(genre, []);
      genreMap.get(genre)!.push(anime);
    }
  }

  const ongoing = animeList.filter((a) => a.status === "ONGOING");

  // Continue watching: most recently watched episodes for this user, one per anime
  let continueWatching: typeof animeList = [];
  if (session?.user) {
    const history = await prisma.watchHistory.findMany({
      where: { userId: session.user.id },
      orderBy: { updatedAt: "desc" },
      include: { episode: { include: { anime: true } } },
      take: 20,
    });
    const seen = new Set<string>();
    for (const h of history) {
      if (!seen.has(h.episode.animeId)) {
        seen.add(h.episode.animeId);
        continueWatching.push(h.episode.anime);
      }
    }
    continueWatching = continueWatching.slice(0, 10);
  }

  return (
    <div className="min-h-screen bg-[#0b0b12] text-[#e8e6f0]">
      <Navbar />
      <Hero heroes={heroPool} />

      <div className="pt-4 pb-16">
        {continueWatching.length > 0 && (
          <AnimeRow title="ดูต่อ" items={continueWatching} />
        )}
        <AnimeRow title="มาใหม่ล่าสุด" items={animeList} />
        {ongoing.length > 0 && <AnimeRow title="กำลังฉาย" items={ongoing} />}
        {Array.from(genreMap.entries()).map(([genre, items]) => (
          <AnimeRow key={genre} title={genre} items={items} />
        ))}
      </div>
    </div>
  );
}
