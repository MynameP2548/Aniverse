export default function AnimeCardSkeleton() {
  return (
    <div className="flex-shrink-0 w-[160px] md:w-[190px] animate-pulse">
      <div className="w-full aspect-[2/3] rounded-lg bg-[#131320] border border-[#232335]" />
      <div className="mt-2 h-4 w-4/5 rounded bg-[#131320]" />
      <div className="mt-1.5 h-3 w-1/3 rounded bg-[#131320]" />
    </div>
  );
}
