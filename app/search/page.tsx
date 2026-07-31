import prisma from "@/lib/prisma";
import Navbar from "@/components/Navbar";
import AnimeGrid from "@/components/AnimeGrid";

export const dynamic = "force-dynamic";

type Props = {
  searchParams: Promise<{ q?: string }>;
};

export default async function SearchPage({ searchParams }: Props) {
  const { q } = await searchParams;
  const query = (q || "").trim();

  const results = query
    ? await prisma.anime.findMany({
        where: {
          OR: [
            { title: { contains: query, mode: "insensitive" } },
            { titleEn: { contains: query, mode: "insensitive" } },
            { genres: { has: query } },
          ],
        },
        orderBy: { createdAt: "desc" },
      })
    : [];

  return (
    <div className="min-h-screen bg-[#0b0b12] text-[#e8e6f0]">
      <Navbar />
      <main className="max-w-7xl mx-auto px-6 pt-24 pb-16">
        <h1 className="text-xl font-bold mb-1">
          ผลการค้นหา{query ? ` "${query}"` : ""}
        </h1>
        <p className="text-sm text-[#8a87a3] mb-6">
          {query ? `พบ ${results.length} เรื่อง` : "พิมพ์คำค้นหาที่แถบด้านบน"}
        </p>

        <AnimeGrid
          items={results}
          emptyMessage={query ? "ไม่พบอนิเมะที่ตรงกับคำค้นหานี้" : "ยังไม่มีคำค้นหา"}
        />
      </main>
    </div>
  );
}
