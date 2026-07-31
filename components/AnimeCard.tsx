import Link from "next/link";

type Props = {
  anime: {
    id: string;
    title: string;
    coverImage?: string | null;
    releaseYear?: number | null;
    status: "ONGOING" | "COMPLETED";
    genres?: string[];
    rating?: number | null;
    description?: string | null;
  };
};

export default function AnimeCard({ anime }: Props) {
  return (
    <div className="group relative flex-shrink-0 w-[160px] md:w-[190px] snap-start">
      {/* Base card — always visible, sits in normal flow */}
      <Link href={`/anime/${anime.id}`} className="block">
        <div className="relative w-full aspect-[2/3] rounded-lg overflow-hidden bg-[#131320] border border-[#232335]">
          {anime.coverImage ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={anime.coverImage}
              alt={anime.title}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-[#3a3a52] text-xs">
              ไม่มีรูปปก
            </div>
          )}
          {anime.status === "ONGOING" && (
            <span className="absolute top-2 left-2 text-[10px] font-semibold bg-[#0b0b12]/80 text-[#5ee6a0] px-2 py-0.5 rounded-full border border-[#5ee6a0]/30">
              กำลังฉาย
            </span>
          )}
        </div>
        <p className="mt-2 text-sm text-[#e8e6f0] font-medium truncate">{anime.title}</p>
        {anime.releaseYear && <p className="text-xs text-[#5a5770]">{anime.releaseYear}</p>}
      </Link>

      {/* Hover expansion — pops out above everything, doesn't shift layout */}
      <div
        className="absolute top-0 left-0 w-full scale-100 group-hover:scale-125 origin-top
                   bg-[#181826] border border-[#2a2a3d] rounded-lg shadow-2xl shadow-black/50
                   opacity-0 group-hover:opacity-100 pointer-events-none group-hover:pointer-events-auto
                   transition-all duration-200 ease-out z-0 group-hover:z-30 overflow-hidden"
      >
        <div className="relative w-full aspect-[2/3]">
          {anime.coverImage ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={anime.coverImage} alt={anime.title} className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-[#3a3a52] text-xs bg-[#131320]">
              ไม่มีรูปปก
            </div>
          )}
        </div>

        <div className="p-3">
          <div className="flex items-center gap-2 mb-2">
            <Link
              href={`/anime/${anime.id}`}
              className="w-8 h-8 flex items-center justify-center rounded-full bg-[#ff5d73] hover:bg-[#ff738a] transition"
              title="ดูเลย"
            >
              <svg className="w-3.5 h-3.5 text-[#0b0b12]" fill="currentColor" viewBox="0 0 20 20">
                <path d="M6 4l10 6-10 6V4z" />
              </svg>
            </Link>
            <Link
              href={`/anime/${anime.id}`}
              className="w-8 h-8 flex items-center justify-center rounded-full border border-[#3a3a52] hover:border-[#5a5770] transition ml-auto"
              title="รายละเอียดเพิ่มเติม"
            >
              <svg
                className="w-4 h-4 text-[#e8e6f0]"
                fill="none"
                stroke="currentColor"
                strokeWidth={2}
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
              </svg>
            </Link>
          </div>

          <p className="text-sm font-bold text-[#e8e6f0] truncate mb-1">{anime.title}</p>

          <div className="flex items-center gap-2 text-[11px] mb-1.5">
            {anime.rating ? (
              <span className="text-[#ffc857] font-semibold">★ {anime.rating.toFixed(1)}</span>
            ) : null}
            {anime.releaseYear && <span className="text-[#8a87a3]">{anime.releaseYear}</span>}
            <span
              className={`px-1.5 py-0.5 rounded ${
                anime.status === "ONGOING"
                  ? "bg-[#1e3a2e] text-[#5ee6a0]"
                  : "bg-[#2a2a3d] text-[#8a87a3]"
              }`}
            >
              {anime.status === "ONGOING" ? "กำลังฉาย" : "จบแล้ว"}
            </span>
          </div>

          {anime.genres && anime.genres.length > 0 && (
            <p className="text-[11px] text-[#5a5770] truncate">
              {anime.genres.slice(0, 3).join(" · ")}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
