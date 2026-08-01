import AnimeCardSkeleton from "./AnimeCardSkeleton";

export default function AnimeRowSkeleton({ count = 6 }: { count?: number }) {
  return (
    <section className="mb-10">
      <div className="max-w-7xl mx-auto px-6 mb-4">
        <div className="h-6 w-40 rounded bg-[#131320] animate-pulse" />
      </div>
      <div className="max-w-7xl mx-auto px-6">
        <div className="flex gap-4 overflow-hidden pb-2">
          {Array.from({ length: count }).map((_, i) => (
            <AnimeCardSkeleton key={i} />
          ))}
        </div>
      </div>
    </section>
  );
}
