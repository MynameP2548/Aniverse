import AnimeCard from "./AnimeCard";

type AnimeItem = {
  id: string;
  title: string;
  coverImage?: string | null;
  releaseYear?: number | null;
  status: "ONGOING" | "COMPLETED";
  genres?: string[];
  rating?: number | null;
  description?: string | null;
};

type Props = {
  items: AnimeItem[];
  emptyMessage?: string;
};

export default function AnimeGrid({ items, emptyMessage = "ไม่พบอนิเมะ" }: Props) {
  if (items.length === 0) {
    return <p className="text-[#8a87a3] text-sm">{emptyMessage}</p>;
  }

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-x-4 gap-y-10">
      {items.map((anime) => (
        <AnimeCard key={anime.id} anime={anime} />
      ))}
    </div>
  );
}
