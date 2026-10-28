import AnimeCard from "./AnimeCard";

type AnimeItem = {
  id: string;
  slug: string;
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
    return <p className="text-[#9693b8] text-sm">{emptyMessage}</p>;
  }

  return (
    <div className="grid grid-cols-2 gap-x-3 gap-y-6 items-start sm:grid-cols-3 sm:gap-x-4 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 2xl:grid-cols-7">
      {items.map((anime) => (
        <AnimeCard key={anime.id} anime={anime} />
      ))}
    </div>
  );
}
