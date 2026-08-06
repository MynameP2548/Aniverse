import prisma from "@/lib/prisma";
import Navbar from "@/components/Navbar";
import AnimeGrid from "@/components/AnimeGrid";

export const dynamic = "force-dynamic";

type Props = {
  searchParams: Promise<{ status?: string }>;
};

export default async function BrowsePage({ searchParams }: Props) {
  const { status } = await searchParams;
  const normalizedStatus = status === "completed" ? "COMPLETED" : "ONGOING";

const animeList = await prisma.anime.findMany({
  where: {
    status: normalizedStatus,
  },
  orderBy: {
    createdAt: "desc",
  },
});

  return (
    <div className="min-h-screen bg-[#0b0b12] text-[#e8e6f0]">
      <Navbar />
      <main className="max-w-7xl mx-auto px-6 pt-24 pb-16">
        <h1 className="text-xl font-bold mb-1">
          {normalizedStatus === "ONGOING" ? "กำลังฉาย" : "จบแล้ว"}
        </h1>
<p className="text-sm text-[#8a87a3] mb-6">
  พบ {animeList.length} เรื่อง
</p>
<AnimeGrid
  items={animeList}
  emptyMessage="ยังไม่มีอนิเมะในหมวดนี้"
/>
      </main>
    </div>
  );
}
