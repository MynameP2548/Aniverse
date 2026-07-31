import { auth } from "@/auth";
import { redirect } from "next/navigation";
import prisma from "@/lib/prisma";
import Navbar from "@/components/Navbar";
import AnimeGrid from "@/components/AnimeGrid";

export const dynamic = "force-dynamic";

export default async function FavoritesPage() {
  const session = await auth();
  if (!session?.user) {
    redirect("/login");
  }

  const favorites = await prisma.favorite.findMany({
    where: { userId: session.user.id },
    include: { anime: true },
    orderBy: { createdAt: "desc" },
  });

  const animeList = favorites.map((f) => f.anime);

  return (
    <div className="min-h-screen bg-[#0b0b12] text-[#e8e6f0]">
      <Navbar />
      <main className="max-w-7xl mx-auto px-6 pt-24 pb-16">
        <h1 className="text-xl font-bold mb-1">รายการโปรดของฉัน</h1>
        <p className="text-sm text-[#8a87a3] mb-6">{animeList.length} เรื่อง</p>

        <AnimeGrid
          items={animeList}
          emptyMessage="ยังไม่มีอนิเมะในรายการโปรด ลองกดหัวใจที่หน้าเรื่องที่ชอบดูครับ"
        />
      </main>
    </div>
  );
}
