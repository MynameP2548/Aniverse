import Link from "next/link";

type Props = {
  anime: {
    id: string;
    title: string;
    coverImage?: string | null;
    releaseYear?: number | null;
    status: "ONGOING" | "COMPLETED";
  };
};

export default function AnimeCard({ anime }: Props) {
  return (
    <Link
      href={`/anime/${anime.id}`}
      className="group relative flex-shrink-0 w-[160px] md:w-[190px] snap-start"
    >
      <div className="relative w-full aspect-[2/3] rounded-lg overflow-hidden bg-[#131320] border border-[#232335] group-hover:border-[#ff5d73]/50 transition-all group-hover:-translate-y-1 group-hover:shadow-[0_8px_24px_rgba(255,93,115,0.15)]">
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
      <p className="mt-2 text-sm text-[#e8e6f0] font-medium truncate group-hover:text-[#ff5d73] transition-colors">
        {anime.title}
      </p>
      {anime.releaseYear && (
        <p className="text-xs text-[#5a5770]">{anime.releaseYear}</p>
      )}
    </Link>
  );
}
