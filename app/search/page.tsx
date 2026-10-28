import Link from "next/link";
import { Search, SlidersHorizontal, Sparkles, X } from "lucide-react";
import prisma from "@/lib/prisma";
import Navbar from "@/components/Navbar";
import AnimeGrid from "@/components/AnimeGrid";

export const dynamic = "force-dynamic";

const SORT_OPTIONS = [
  { value: "newest", label: "เพิ่มล่าสุด" },
  { value: "rating", label: "คะแนนสูงสุด" },
  { value: "title", label: "ชื่อเรื่อง A–Z" },
  { value: "year", label: "ปีที่ฉายล่าสุด" },
] as const;

type Props = {
  searchParams: Promise<{
    q?: string;
    genre?: string;
    year?: string;
    status?: string;
    minRating?: string;
    sort?: string;
  }>;
};

function validNumber(value: string | undefined, min: number, max: number) {
  if (!value || !/^\d+(\.\d+)?$/.test(value)) return undefined;
  const number = Number(value);
  return Number.isFinite(number) && number >= min && number <= max ? number : undefined;
}

export default async function SearchPage({ searchParams }: Props) {
  const params = await searchParams;
  const query = (params.q ?? "").trim().slice(0, 100);
  const genre = (params.genre ?? "").trim().slice(0, 60);
  const year = validNumber(params.year, 1900, 2200);
  const minRating = validNumber(params.minRating, 0, 10);
  const status = params.status === "ONGOING" || params.status === "COMPLETED" ? params.status : undefined;
  const sort = SORT_OPTIONS.some((option) => option.value === params.sort) ? params.sort : "newest";

  const [results, genreRows, yearRows] = await Promise.all([
    prisma.anime.findMany({
      where: {
        AND: [
          query
            ? {
                OR: [
                  { title: { contains: query, mode: "insensitive" } },
                  { titleEn: { contains: query, mode: "insensitive" } },
                  { genres: { has: query } },
                ],
              }
            : {},
          genre ? { genres: { has: genre } } : {},
          year ? { releaseYear: year } : {},
          status ? { status } : {},
          minRating !== undefined ? { rating: { gte: minRating } } : {},
        ],
      },
      orderBy:
        sort === "rating"
          ? [{ rating: "desc" }, { createdAt: "desc" }]
          : sort === "title"
            ? { title: "asc" }
            : sort === "year"
              ? [{ releaseYear: "desc" }, { createdAt: "desc" }]
              : { createdAt: "desc" },
      take: 200,
    }),
    prisma.anime.findMany({ select: { genres: true } }),
    prisma.anime.findMany({
      where: { releaseYear: { not: null } },
      select: { releaseYear: true },
      distinct: ["releaseYear"],
      orderBy: { releaseYear: "desc" },
      take: 60,
    }),
  ]);

  const genres = Array.from(new Set(genreRows.flatMap((anime) => anime.genres)))
    .filter(Boolean)
    .sort((a, b) => a.localeCompare(b, "th"));
  const years = yearRows
    .map((item) => item.releaseYear)
    .filter((value): value is number => value !== null);
  const hasFilters = Boolean(query || genre || year || status || minRating !== undefined || (sort !== "newest"));
  const clearHref = "/search";

  return (
    <div className="min-h-screen overflow-x-hidden bg-[#080914] text-[#e8e6f0]">
      <Navbar />
      <main className="relative mx-auto max-w-[1500px] px-4 pb-20 pt-28 sm:px-6 sm:pt-32 xl:px-12">
        <div aria-hidden="true" className="pointer-events-none absolute left-1/4 top-10 -z-0 h-72 w-72 rounded-full bg-violet-600/[0.09] blur-[110px]" />
        <div className="relative z-10 mb-8 flex flex-col gap-4 sm:mb-10 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-violet-300/15 bg-violet-400/[0.07] px-3 py-1.5 text-xs font-semibold text-violet-200">
              <Sparkles size={14} aria-hidden="true" /> ANIVERSE DISCOVERY
            </div>
            <h1 className="text-3xl font-black tracking-tight text-white sm:text-4xl">ค้นหาอนิเมะ</h1>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-[#a5a3c2] sm:text-base">
              ค้นพบเรื่องโปรดเรื่องต่อไปของคุณ ด้วยตัวกรองที่เลือกได้ตามสไตล์การรับชม
            </p>
          </div>
          <div className="rounded-2xl border border-white/[0.08] bg-white/[0.035] px-4 py-3 sm:min-w-36">
            <div className="text-xs text-white/45">ผลลัพธ์ที่ตรงกัน</div>
            <div className="mt-1 text-2xl font-black text-white">{results.length}<span className="ml-1 text-sm font-medium text-white/45">เรื่อง</span></div>
          </div>
        </div>

        <form action="/search" className="relative z-10 mb-8 rounded-3xl border border-white/[0.09] bg-[#111222]/80 p-4 shadow-[0_24px_80px_rgba(0,0,0,0.2)] backdrop-blur-xl sm:p-6">
          <div className="mb-5 flex items-center gap-2 text-sm font-bold text-white">
            <SlidersHorizontal size={17} className="text-violet-300" aria-hidden="true" /> ค้นหาและกรองรายการ
          </div>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
            <label className="sm:col-span-2">
              <span className="mb-2 block text-xs font-semibold text-white/55">ชื่อเรื่อง</span>
              <span className="flex h-12 items-center gap-3 rounded-xl border border-white/10 bg-black/20 px-4 transition focus-within:border-violet-300/60 focus-within:ring-4 focus-within:ring-violet-500/10">
                <Search size={17} className="shrink-0 text-violet-300" aria-hidden="true" />
                <input name="q" defaultValue={query} maxLength={100} placeholder="ชื่อภาษาไทยหรือภาษาอังกฤษ..." className="h-full min-w-0 flex-1 bg-transparent text-sm text-white outline-none placeholder:text-white/30" />
              </span>
            </label>
            <label>
              <span className="mb-2 block text-xs font-semibold text-white/55">ประเภท</span>
              <select name="genre" defaultValue={genre} className="h-12 w-full rounded-xl border border-white/10 bg-[#17182b] px-3 text-sm text-white outline-none transition focus:border-violet-300/60 focus:ring-4 focus:ring-violet-500/10">
                <option value="">ทุกประเภท</option>
                {genres.map((item) => <option key={item} value={item}>{item}</option>)}
              </select>
            </label>
            <label>
              <span className="mb-2 block text-xs font-semibold text-white/55">สถานะ</span>
              <select name="status" defaultValue={status ?? ""} className="h-12 w-full rounded-xl border border-white/10 bg-[#17182b] px-3 text-sm text-white outline-none transition focus:border-violet-300/60 focus:ring-4 focus:ring-violet-500/10">
                <option value="">ทุกสถานะ</option>
                <option value="ONGOING">กำลังฉาย</option>
                <option value="COMPLETED">จบแล้ว</option>
              </select>
            </label>
            <label>
              <span className="mb-2 block text-xs font-semibold text-white/55">ปีที่ฉาย</span>
              <select name="year" defaultValue={year?.toString() ?? ""} className="h-12 w-full rounded-xl border border-white/10 bg-[#17182b] px-3 text-sm text-white outline-none transition focus:border-violet-300/60 focus:ring-4 focus:ring-violet-500/10">
                <option value="">ทุกปี</option>
                {years.map((item) => <option key={item} value={item}>{item}</option>)}
              </select>
            </label>
            <label>
              <span className="mb-2 block text-xs font-semibold text-white/55">คะแนนขั้นต่ำ</span>
              <select name="minRating" defaultValue={minRating?.toString() ?? ""} className="h-12 w-full rounded-xl border border-white/10 bg-[#17182b] px-3 text-sm text-white outline-none transition focus:border-violet-300/60 focus:ring-4 focus:ring-violet-500/10">
                <option value="">ทุกคะแนน</option>
                <option value="5">5.0 ขึ้นไป</option>
                <option value="6">6.0 ขึ้นไป</option>
                <option value="7">7.0 ขึ้นไป</option>
                <option value="8">8.0 ขึ้นไป</option>
                <option value="9">9.0 ขึ้นไป</option>
              </select>
            </label>
            <label>
              <span className="mb-2 block text-xs font-semibold text-white/55">เรียงลำดับ</span>
              <select name="sort" defaultValue={sort} className="h-12 w-full rounded-xl border border-white/10 bg-[#17182b] px-3 text-sm text-white outline-none transition focus:border-violet-300/60 focus:ring-4 focus:ring-violet-500/10">
                {SORT_OPTIONS.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}
              </select>
            </label>
          </div>
          <div className="mt-5 flex flex-col-reverse gap-3 border-t border-white/[0.07] pt-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="text-xs text-white/40">แสดงสูงสุด 200 เรื่องต่อการค้นหา</div>
            <div className="flex gap-2">
              {hasFilters && <Link href={clearHref} className="inline-flex h-11 items-center justify-center gap-2 rounded-xl border border-white/10 px-4 text-sm font-semibold text-white/70 transition hover:border-white/20 hover:bg-white/5"><X size={15} aria-hidden="true" /> ล้างตัวกรอง</Link>}
              <button type="submit" className="inline-flex h-11 flex-1 items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-violet-500 to-blue-500 px-5 text-sm font-bold text-white shadow-lg shadow-violet-950/30 transition hover:brightness-110 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-300 focus-visible:ring-offset-2 focus-visible:ring-offset-[#111222] sm:flex-none"><Search size={16} aria-hidden="true" /> ค้นหาอนิเมะ</button>
            </div>
          </div>
        </form>

        <section aria-labelledby="results-heading" className="relative z-10">
          <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
            <h2 id="results-heading" className="text-lg font-bold text-white sm:text-xl">{hasFilters ? "ผลการค้นหา" : "อนิเมะทั้งหมด"}</h2>
            {hasFilters && <p className="text-xs text-white/45">พบ {results.length} เรื่อง{results.length === 200 ? " (อาจมีผลลัพธ์เพิ่มเติม)" : ""}</p>}
          </div>
          <AnimeGrid items={results} emptyMessage={hasFilters ? "ไม่พบอนิเมะที่ตรงกับเงื่อนไข ลองเปลี่ยนตัวกรองแล้วค้นหาอีกครั้ง" : "ยังไม่มีอนิเมะในระบบ"} />
        </section>
      </main>
    </div>
  );
}
