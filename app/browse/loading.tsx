import Navbar from "@/components/Navbar";
import AnimeGridSkeleton from "@/components/AnimeGridSkeleton";

export default function Loading() {
  return (
    <div className="min-h-screen bg-[#0b0b12] text-[#e8e6f0]">
      <Navbar />
      <main className="max-w-7xl mx-auto px-6 pt-24 pb-16">
        <div className="h-6 w-32 rounded bg-[#131320] animate-pulse mb-2" />
        <div className="h-4 w-20 rounded bg-[#131320] animate-pulse mb-6" />
        <AnimeGridSkeleton />
      </main>
    </div>
  );
}
