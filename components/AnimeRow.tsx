import AnimeCard from "./AnimeCard";

type AnimeItem = {
  id: string;
  title: string;
  coverImage?: string | null;
  releaseYear?: number | null;
  status: "ONGOING" | "COMPLETED";
};

type Props = {
  title: string;
  items: AnimeItem[];
};

export default function AnimeRow({ title, items }: Props) {
  if (items.length === 0) return null;

  return (
    <section className="mb-10">
      <div className="max-w-7xl mx-auto px-6 flex items-center justify-between mb-4">
        <h2 className="text-lg md:text-xl font-bold text-[#e8e6f0]">{title}</h2>
      </div>

      <div className="max-w-7xl mx-auto px-6">
        <div className="flex gap-4 overflow-x-auto pb-2 snap-x scrollbar-hide">
          {items.map((anime) => (
            <AnimeCard key={anime.id} anime={anime} />
          ))}
        </div>
      </div>
    </section>
  );
}
