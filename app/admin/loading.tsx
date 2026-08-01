export default function Loading() {
  return (
    <div className="min-h-screen bg-[#0b0b12] text-[#e8e6f0]">
      <header className="border-b border-[#232335] px-6 py-5 animate-pulse">
        <div className="h-6 w-48 rounded bg-[#131320] mb-2" />
        <div className="h-4 w-64 rounded bg-[#131320]" />
      </header>
      <main className="max-w-5xl mx-auto px-6 py-8 grid gap-8 lg:grid-cols-[380px_1fr] animate-pulse">
        <div className="bg-[#131320] border border-[#232335] rounded-xl h-96" />
        <div className="grid gap-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="bg-[#131320] border border-[#232335] rounded-xl h-24" />
          ))}
        </div>
      </main>
    </div>
  );
}
