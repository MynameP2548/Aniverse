import prisma from "@/lib/prisma";
import Navbar from "@/components/Navbar";
import Hero from "@/components/Hero";
import AnimeRow from "@/components/AnimeRow";
import { auth } from "@/auth";
import Link from "next/link";

export const dynamic = "force-dynamic"; // always show latest admin-added anime

export default async function HomePage() {
  const session = await auth();

  const animeList = await prisma.anime.findMany({
    orderBy: { createdAt: "desc" },
  });

  if (animeList.length === 0) {
    return (
      <div className="aniverse-shell flex min-h-screen flex-col text-white">
        <Navbar />
        <main className="relative flex flex-1 items-center justify-center overflow-hidden px-6 pt-24 text-center">
          <div aria-hidden="true" className="pointer-events-none absolute left-1/2 top-1/2 h-80 w-80 -translate-x-1/2 -translate-y-1/2 rounded-full bg-violet-600/15 blur-[100px]" />
          <div className="relative mx-auto max-w-xl rounded-3xl border border-white/10 bg-white/[0.035] p-8 shadow-2xl shadow-black/30 backdrop-blur-xl sm:p-12">
            <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-2xl border border-violet-300/20 bg-gradient-to-br from-violet-500/20 to-blue-500/20 text-3xl">✦</div>
            <p className="mb-3 text-xs font-bold uppercase tracking-[0.28em] text-violet-200/80">Your next world awaits</p>
            <h1 className="mb-3 text-2xl font-black tracking-tight sm:text-3xl">จักรวาลอนิเมะกำลังรอคุณอยู่</h1>
            <p className="mb-7 text-sm leading-7 text-white/55">เพิ่มอนิเมะเรื่องแรกเพื่อเริ่มสร้างหน้าแรกของ Aniverse ให้มีชีวิตชีวา</p>
            <a href="/admin" className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-violet-500 to-blue-500 px-6 py-3 text-sm font-bold text-white shadow-lg shadow-violet-950/40 transition hover:-translate-y-0.5 hover:shadow-violet-500/20">ไปจัดการอนิเมะ <span aria-hidden="true">↗</span></a>
          </div>
        </main>
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
    : animeList.filter((a) => a.bannerImage || a.coverImage);

// Always provide at least one hero so a catalogue without banner images still renders.
const safeHeroPool = heroPool.length > 0 ? heroPool : animeList;
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

  const quickGenres = Array.from(genreMap.keys()).slice(0, 6);

  return (
    <div className="aniverse-shell min-h-screen overflow-hidden text-white">
      <Navbar />
      <main>
        <Hero heroes={safeHeroPool} />

        <div className="relative z-10 -mt-2 pb-16 sm:-mt-8 lg:-mt-12">
          <div className="pointer-events-none absolute inset-x-0 top-0 -z-10 h-96 bg-gradient-to-b from-[#0a0b1b]/40 via-[#090a17]/85 to-transparent" />

          <div className="mx-auto mb-10 flex w-full max-w-[1700px] flex-col gap-5 px-4 sm:px-6 lg:mb-14 lg:flex-row lg:items-end lg:justify-between xl:px-10">
            <div className="max-w-2xl">
              <div className="mb-3 flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.32em] text-violet-200/80 sm:text-xs">
                <span className="h-px w-7 bg-gradient-to-r from-violet-400 to-blue-400" />
                Enter your anime universe
              </div>
              <h2 className="text-2xl font-black tracking-tight text-white sm:text-3xl lg:text-4xl">เรื่องโปรดเรื่องต่อไปของคุณ <span className="bg-gradient-to-r from-violet-300 via-indigo-200 to-sky-300 bg-clip-text text-transparent">อยู่ที่นี่</span></h2>
              <p className="mt-3 max-w-xl text-sm leading-6 text-white/50 sm:text-base">ค้นพบเรื่องใหม่ กลับไปดูเรื่องที่ค้างไว้ และสำรวจจักรวาลอนิเมะในแบบของคุณ</p>
            </div>
            <Link href="/search" className="group inline-flex w-fit items-center gap-3 rounded-full border border-white/10 bg-white/[0.045] px-5 py-3 text-sm font-semibold text-white/75 backdrop-blur-xl transition hover:border-violet-300/30 hover:bg-violet-400/10 hover:text-white">
              <span className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-violet-500/25 to-blue-500/25 text-violet-100" aria-hidden="true">⌕</span>
              สำรวจอนิเมะทั้งหมด <span className="text-violet-200 transition-transform group-hover:translate-x-1" aria-hidden="true">→</span>
            </Link>
          </div>

          {quickGenres.length > 0 && (
            <nav aria-label="ประเภทอนิเมะยอดนิยม" className="mx-auto mb-10 flex w-full max-w-[1700px] gap-2 overflow-x-auto px-4 pb-2 scrollbar-hide sm:px-6 lg:mb-14 xl:px-10">
              {quickGenres.map((genre, index) => (
                <Link key={genre} href={`/search?q=${encodeURIComponent(genre)}`} className={`shrink-0 rounded-full border px-4 py-2.5 text-xs font-semibold transition sm:text-sm ${index === 0 ? "border-violet-300/30 bg-gradient-to-r from-violet-500/20 to-blue-500/15 text-violet-100" : "border-white/[0.09] bg-white/[0.025] text-white/55 hover:border-violet-300/25 hover:bg-white/[0.06] hover:text-white"}`}>
                  {genre}
                </Link>
              ))}
            </nav>
          )}

          <div className="space-y-11 sm:space-y-14 lg:space-y-16">
            {continueWatching.length > 0 && (
              <div className="home-row home-row-featured">
                <AnimeRow title="ดูต่อจากที่ค้างไว้" items={continueWatching} />
              </div>
            )}
            <div className="home-row">
              <AnimeRow title="มาใหม่ใน Aniverse" items={animeList} />
            </div>
            {ongoing.length > 0 && (
              <div className="home-row">
                <AnimeRow title="กำลังฉาย" items={ongoing} />
              </div>
            )}
            {Array.from(genreMap.entries()).map(([genre, items]) => (
              <div className="home-row" key={genre}>
                <AnimeRow title={genre} items={items} />
              </div>
            ))}
          </div>

          <footer className="mx-4 mt-16 border-t border-white/[0.07] pt-7 text-center sm:mx-6 lg:mx-10">
            <p className="text-xs tracking-wide text-white/30">ANIVERSE <span className="mx-2 text-violet-300/50">✦</span> Find your next world</p>
          </footer>
        </div>
      </main>
    </div>
  );
}
