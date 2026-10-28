import Navbar from "@/components/Navbar";
import AnimeRowSkeleton from "@/components/AnimeRowSkeleton";

export default function Loading() {
  return (
    <div className="min-h-screen bg-[#080914] text-[#e8e6f0]">
      <Navbar />

      {/* Hero skeleton */}
      <div className="relative w-full h-[78vh] min-h-[480px] bg-[#131320] animate-pulse">
        <div className="max-w-7xl mx-auto px-6 h-full flex flex-col justify-end pb-16">
          <div className="max-w-xl space-y-4">
            <div className="h-4 w-24 rounded bg-[#1a1a28]" />
            <div className="h-12 w-3/4 rounded bg-[#1a1a28]" />
            <div className="h-4 w-1/2 rounded bg-[#1a1a28]" />
            <div className="h-4 w-2/3 rounded bg-[#1a1a28]" />
            <div className="flex gap-3 pt-2">
              <div className="h-11 w-28 rounded-lg bg-[#1a1a28]" />
              <div className="h-11 w-32 rounded-lg bg-[#1a1a28]" />
            </div>
          </div>
        </div>
      </div>

      <div className="pt-4 pb-16">
        <AnimeRowSkeleton />
        <AnimeRowSkeleton />
        <AnimeRowSkeleton />
      </div>
    </div>
  );
}
