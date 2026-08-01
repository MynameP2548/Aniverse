import Navbar from "@/components/Navbar";

export default function Loading() {
  return (
    <div className="min-h-screen bg-[#0b0b12] text-[#e8e6f0]">
      <Navbar />
      <main className="max-w-6xl mx-auto px-6 pt-24 pb-16 animate-pulse">
        <div className="w-full aspect-video rounded-xl bg-[#131320] border border-[#232335] mb-6" />

        <div className="space-y-3 mb-8">
          <div className="h-8 w-2/3 rounded bg-[#131320]" />
          <div className="flex gap-2">
            <div className="h-6 w-16 rounded-full bg-[#131320]" />
            <div className="h-6 w-16 rounded-full bg-[#131320]" />
          </div>
          <div className="h-4 w-full rounded bg-[#131320]" />
          <div className="h-4 w-5/6 rounded bg-[#131320]" />
        </div>

        <div className="h-6 w-32 rounded bg-[#131320] mb-4" />
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="h-16 rounded-lg bg-[#131320] border border-[#232335]" />
          ))}
        </div>
      </main>
    </div>
  );
}
