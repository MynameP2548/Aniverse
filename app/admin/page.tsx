"use client";

import { useEffect, useState } from "react";
import { signOut } from "next-auth/react";

type Anime = {
  id: string;
  slug: string;

  title: string;
  titleEn?: string;
  description?: string;

  coverImage?: string;
  bannerImage?: string;

  genres: string[];

  status: "ONGOING" | "COMPLETED";

  releaseYear?: number;

  rating?: number;

  featured?: boolean;

  heroTrailer?: string;

  heroLogo?: string;

  heroOrder?: number;
};

const GENRE_OPTIONS = [
  "Action",
  "Adventure",
  "Comedy",
  "Drama",
  "Fantasy",
  "Romance",
  "Sci-Fi",
  "Horror",
  "Mystery",
  "Slice of Life",
  "Sports",
  "Supernatural",
  "Isekai",
  "Mecha",
  "Seinen",
  "Shounen",
  "Shoujo",
  "Josei",
  "School",
  "Ecchi",
  "Psychological",
  "Magic",
  "Military",
  "Music",
  "Historical",
  "Martial Arts",
  "Demons",
  "Vampire",
  "Game",
  "Parody",
];

const emptyForm = {
  title: "",
  titleEn: "",
  description: "",

  coverImage: "",
  bannerImage: "",

  genres: [] as string[],

  status: "ONGOING" as "ONGOING" | "COMPLETED",

  releaseYear: "",

  rating: "",

  featured: false,

  heroTrailer: "",

  heroLogo: "",

  heroOrder: "",
};

export default function AdminPage() {
  const [animeList, setAnimeList] = useState<Anime[]>([]);
  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  async function loadAnime() {
    setLoading(true);
    try {
      const res = await fetch("/api/anime");
      const data = await res.json();
      setAnimeList(data);
    } catch {
      setErrorMsg("โหลดรายการอนิเมะไม่สำเร็จ");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadAnime();
  }, []);

  function startEdit(anime: Anime) {
    console.log("EDIT", anime);

    setEditingId(anime.slug);
setForm({
  title: anime.title,

  titleEn: anime.titleEn || "",

  description: anime.description || "",

  coverImage: anime.coverImage || "",

  bannerImage: anime.bannerImage || "",

  genres: anime.genres,

  status: anime.status,

  releaseYear: anime.releaseYear
    ? String(anime.releaseYear)
    : "",

  rating:
    anime.rating !== undefined
      ? String(anime.rating)
      : "",

  featured: anime.featured ?? false,

  heroTrailer: anime.heroTrailer || "",

  heroLogo: anime.heroLogo || "",

  heroOrder:
    anime.heroOrder !== undefined
      ? String(anime.heroOrder)
      : "",
});
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function cancelEdit() {
    setEditingId(null);
    setForm(emptyForm);
  }

  function toggleGenre(genre: string) {
    setForm((prev) => ({
      ...prev,
      genres: prev.genres.includes(genre)
        ? prev.genres.filter((g) => g !== genre)
        : [...prev.genres, genre],
    }));
  }
  async function uploadImage(
  file: File,
  field: "coverImage" | "bannerImage" | "heroLogo"
) {
  const formData = new FormData();
  formData.append("file", file);

  const res = await fetch("/api/upload", {
    method: "POST",
    body: formData,
  });

  if (!res.ok) {
    alert("อัปโหลดไม่สำเร็จ");
    return;
  }

  const data = await res.json();

  setForm((prev) => ({
    ...prev,
    [field]: data.url,
  }));
}

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.title.trim()) {
      setErrorMsg("กรุณากรอกชื่อเรื่อง");
      return;
    }
    setSaving(true);
    setErrorMsg("");

const payload = {
  title: form.title,

  titleEn: form.titleEn,

  description: form.description,

  coverImage: form.coverImage,

  bannerImage: form.bannerImage,

  genres: form.genres,

  status: form.status,

  releaseYear: form.releaseYear
    ? Number(form.releaseYear)
    : null,

  rating: form.rating
    ? Number(form.rating)
    : null,

  featured: form.featured,

  heroTrailer: form.heroTrailer,

  heroLogo: form.heroLogo,

  heroOrder: form.heroOrder
    ? Number(form.heroOrder)
    : 0,
};

    try {
      const url = editingId ? `/api/anime/${editingId}` : "/api/anime";
      const method = editingId ? "PUT" : "POST";
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!res.ok) throw new Error();
      cancelEdit();
      await loadAnime();
    } catch {
      setErrorMsg("บันทึกไม่สำเร็จ ลองใหม่อีกครั้ง");
    } finally {
      setSaving(false);
    }
  }

async function handleDelete(slug: string) {
  if (!slug) {
    alert("ไม่พบ slug ของอนิเมะ");
    return;
  }

  if (!confirm("ยืนยันลบอนิเมะเรื่องนี้?")) return;

  try {
    const res = await fetch(`/api/anime/${slug}`, {
      method: "DELETE",
    });

    if (!res.ok) {
      throw new Error("Delete failed");
    }

    await loadAnime();
  } catch (e) {
    console.error(e);
    setErrorMsg("ลบไม่สำเร็จ");
  }
}

  return (
    <div className="min-h-screen bg-[#0b0b12] text-[#e8e6f0]">
      <header className="border-b border-[#232335] px-6 py-5 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">
            แผงควบคุมแอดมิน <span className="text-[#ff5d73]">・อนิเมะ</span>
          </h1>
          <p className="text-sm text-[#8a87a3] mt-1">จัดการรายการอนิเมะทั้งหมดของเว็บไซต์</p>
        </div>
        <button
          onClick={() => signOut({ callbackUrl: "/login" })}
          className="text-xs px-4 py-2 rounded-lg border border-[#2a2a3d] text-[#8a87a3] hover:text-[#e8e6f0] hover:border-[#3a3a52] transition"
        >
          ออกจากระบบ
        </button>
      </header>

      <main className="max-w-5xl mx-auto px-6 py-8 grid gap-8 lg:grid-cols-[380px_1fr]">
        {/* Form */}
        <form
          onSubmit={handleSubmit}
          className="bg-[#131320] border border-[#232335] rounded-xl p-5 h-fit sticky top-6"
        >
          <h2 className="font-semibold text-lg mb-4">
            {editingId ? "แก้ไขอนิเมะ" : "เพิ่มอนิเมะใหม่"}
          </h2>

          {errorMsg && (
            <div className="bg-[#3a1620] border border-[#ff5d73]/40 text-[#ff9aa8] text-sm rounded-lg px-3 py-2 mb-4">
              {errorMsg}
            </div>
          )}

          <div className="space-y-3">
            <div>
              <label className="text-xs text-[#8a87a3] block mb-1">ชื่อเรื่อง (ไทย) *</label>
              <input
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
                className="w-full bg-[#0b0b12] border border-[#2a2a3d] rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#ff5d73]"
                placeholder="เช่น ดาบพิฆาตอสูร"
              />
            </div>

<div>
  <label className="text-xs text-[#8a87a3] block mb-1">
    ชื่อเรื่อง (อังกฤษ)
  </label>

  <input
    value={form.titleEn}
    onChange={(e) => setForm({ ...form, titleEn: e.target.value })}
    className="w-full bg-[#0b0b12] border border-[#2a2a3d] rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#ff5d73]"
    placeholder="Demon Slayer"
  />

  <p className="mt-2 text-xs text-[#8a87a3]">
    URL จะเป็น:
    <span className="ml-2 text-[#5ee6a0]">
      /anime/
      {(form.titleEn || form.title)
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-|-$/g, "")}
    </span>
  </p>
</div>

            <div>
              <label className="text-xs text-[#8a87a3] block mb-1">เรื่องย่อ</label>
              <textarea
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                rows={3}
                className="w-full bg-[#0b0b12] border border-[#2a2a3d] rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#ff5d73] resize-none"
              />
            </div>

            <div>
<label>Cover Image</label>

<input
    type="file"
    accept="image/*"
    onChange={(e) => {
        const file = e.target.files?.[0];
        if (file) uploadImage(file, "coverImage");
    }}
/>

<input
    value={form.coverImage}
    onChange={(e)=>
        setForm({
            ...form,
            coverImage:e.target.value
        })
    }
/>

{form.coverImage && (
    <img
        src={form.coverImage}
        className="mt-2 rounded-lg"
    />
)}
            </div>

            <div>
  <label className="text-xs text-[#8a87a3] block mb-1">
    URL Banner
  </label>

<input
    type="file"
    accept="image/*"
    onChange={(e)=>{
        const file=e.target.files?.[0];
        if(file){
            uploadImage(file,"bannerImage")
        }
    }}
/>

<input
  value={form.bannerImage}
  onChange={(e) =>
    setForm({
      ...form,
      bannerImage: e.target.value,
    })
  }
  className="w-full bg-[#0b0b12] border border-[#2a2a3d] rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#ff5d73]"
  placeholder="https://..."
/>

{form.bannerImage && (
<img
src={form.bannerImage}
className="mt-2 rounded-lg"
/>
)}
</div>

            <div>
              <label className="text-xs text-[#8a87a3] block mb-2">หมวดหมู่ (เลือกได้หลายอัน)</label>
              <div className="flex flex-wrap gap-2">
                {GENRE_OPTIONS.map((genre) => {
                  const active = form.genres.includes(genre);
                  return (
                    <button
                      key={genre}
                      type="button"
                      onClick={() => toggleGenre(genre)}
                      className={`text-xs px-3 py-1.5 rounded-full border transition ${
                        active
                          ? "bg-[#ff5d73] border-[#ff5d73] text-[#0b0b12] font-semibold"
                          : "border-[#2a2a3d] text-[#8a87a3] hover:border-[#3a3a52]"
                      }`}
                    >
                      {genre}
                    </button>
                  );
                })}
              </div>
            </div>

<div className="grid grid-cols-3 gap-3">
  <div>
    <label className="text-xs text-[#8a87a3] block mb-1">สถานะ</label>
    <select
      value={form.status}
      onChange={(e) =>
        setForm({
          ...form,
          status: e.target.value as "ONGOING" | "COMPLETED",
        })
      }
      className="w-full bg-[#0b0b12] border border-[#2a2a3d] rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#ff5d73]"
    >
      <option value="ONGOING">กำลังฉาย</option>
      <option value="COMPLETED">จบแล้ว</option>
    </select>
  </div>

  <div>
    <label className="text-xs text-[#8a87a3] block mb-1">
      ปีที่ออกฉาย
    </label>

    <input
      type="number"
      value={form.releaseYear}
      onChange={(e) =>
        setForm({
          ...form,
          releaseYear: e.target.value,
        })
      }
      className="w-full bg-[#0b0b12] border border-[#2a2a3d] rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#ff5d73]"
      placeholder="2024"
    />
  </div>

  <div>
    <label className="text-xs text-[#8a87a3] block mb-1">
      คะแนน
    </label>

    <input
      type="number"
      min="0"
      max="10"
      step="0.1"
      value={form.rating}
      onChange={(e) =>
        setForm({
          ...form,
          rating: e.target.value,
        })
      }
      className="w-full bg-[#0b0b12] border border-[#2a2a3d] rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#ff5d73]"
      placeholder="9.5"
    />
  </div>
</div>

<hr className="my-5 border-[#232335]" />

<h3 className="mb-4 text-sm font-semibold text-white">
  Netflix Hero
</h3>

<label className="mb-4 flex items-center gap-3">
  <input
    type="checkbox"
    checked={form.featured}
    onChange={(e) =>
      setForm({
        ...form,
        featured: e.target.checked,
      })
    }
  />

  <span className="text-sm text-white">
    แสดงบน Hero หน้าแรก
  </span>
</label>

<div className="space-y-3">
  <div>
    <label className="mb-1 block text-xs text-[#8a87a3]">
      Hero Trailer
    </label>

    <input
      value={form.heroTrailer}
      onChange={(e) =>
        setForm({
          ...form,
          heroTrailer: e.target.value,
        })
      }
      className="w-full rounded-lg border border-[#2a2a3d] bg-[#0b0b12] px-3 py-2 text-sm"
      placeholder="/videos/rick.mp4"
    />
  </div>

  <div>
    <label className="mb-1 block text-xs text-[#8a87a3]">
      Hero Logo
    </label>
    <input
type="file"
accept="image/*"
onChange={(e)=>{
const file=e.target.files?.[0];
if(file){
uploadImage(file,"heroLogo")
}
}}
/>

    <input
      value={form.heroLogo}
      onChange={(e) =>
        setForm({
          ...form,
          heroLogo: e.target.value,
        })
      }
      className="w-full rounded-lg border border-[#2a2a3d] bg-[#0b0b12] px-3 py-2 text-sm"
      placeholder="/logos/rick.png"
    />
  </div>

  <div>
    <label className="mb-1 block text-xs text-[#8a87a3]">
      Hero Order
    </label>

    <input
      type="number"
      value={form.heroOrder}
      onChange={(e) =>
        setForm({
          ...form,
          heroOrder: e.target.value,
        })
      }
      className="w-full rounded-lg border border-[#2a2a3d] bg-[#0b0b12] px-3 py-2 text-sm"
      placeholder="0"
    />
  </div>
</div>
</div>

          <div className="flex gap-2 mt-5">
            <button
              type="submit"
              disabled={saving}
              className="flex-1 bg-[#ff5d73] hover:bg-[#ff738a] transition text-[#0b0b12] font-semibold rounded-lg py-2 text-sm disabled:opacity-50"
            >
              {saving ? "กำลังบันทึก..." : editingId ? "บันทึกการแก้ไข" : "เพิ่มอนิเมะ"}
            </button>
            {editingId && (
              <button
                type="button"
                onClick={cancelEdit}
                className="px-4 border border-[#2a2a3d] rounded-lg text-sm text-[#8a87a3] hover:text-[#e8e6f0]"
              >
                ยกเลิก
              </button>
            )}
          </div>
        </form>

        {/* List */}
        <section>
          <h2 className="font-semibold text-lg mb-4">
            รายการอนิเมะทั้งหมด {!loading && `(${animeList.length})`}
          </h2>

          {loading ? (
            <div className="grid gap-3 animate-pulse">
              {Array.from({ length: 4 }).map((_, i) => (
                <div
                  key={i}
                  className="bg-[#131320] border border-[#232335] rounded-xl p-4 flex gap-4"
                >
                  <div className="w-16 h-20 bg-[#1a1a28] rounded-lg flex-shrink-0" />
                  <div className="flex-1 space-y-2 py-1">
                    <div className="h-4 w-1/3 rounded bg-[#1a1a28]" />
                    <div className="h-3 w-1/4 rounded bg-[#1a1a28]" />
                    <div className="h-3 w-2/3 rounded bg-[#1a1a28]" />
                  </div>
                </div>
              ))}
            </div>
          ) : animeList.length === 0 ? (
            <p className="text-[#8a87a3] text-sm">ยังไม่มีอนิเมะในระบบ เพิ่มเรื่องแรกได้จากฟอร์มด้านซ้าย</p>
          ) : (
            <div className="grid gap-3">
              {animeList.map((anime) => (
                <div
                  key={anime.slug}
                  className="bg-[#131320] border border-[#232335] rounded-xl p-4 flex gap-4"
                >
                  <div className="w-16 h-20 bg-[#0b0b12] rounded-lg overflow-hidden flex-shrink-0">
                    {anime.coverImage && (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={anime.coverImage}
                        alt={anime.title}
                        className="w-full h-full object-cover"
                      />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <h3 className="font-medium truncate">{anime.title}</h3>
                      <span
                        className={`text-[10px] px-2 py-0.5 rounded-full flex-shrink-0 ${
                          anime.status === "ONGOING"
                            ? "bg-[#1e3a2e] text-[#5ee6a0]"
                            : "bg-[#2a2a3d] text-[#8a87a3]"
                        }`}
                      >
                        {anime.status === "ONGOING" ? "กำลังฉาย" : "จบแล้ว"}
                      </span>
                    </div>
                    <p className="text-xs text-[#8a87a3] mt-1">
                      {anime.releaseYear || "-"} · {anime.genres.join(", ") || "ไม่ระบุแนว"}
                    </p>
                    <p className="text-xs text-[#5a5770] mt-2 line-clamp-2">
                      {anime.description || "ไม่มีเรื่องย่อ"}
                    </p>
                  </div>
                  <div className="flex flex-col gap-2 flex-shrink-0">
                    <a
                      href={`/admin/anime/${anime.slug}`}
                      className="text-xs px-3 py-1.5 rounded-lg border border-[#ff5d73]/30 text-[#ff5d73] hover:bg-[#ff5d73]/10 text-center"
                    >
                      จัดการตอน
                    </a>
                    <button
                      onClick={() => startEdit(anime)}
                      className="text-xs px-3 py-1.5 rounded-lg border border-[#2a2a3d] hover:bg-[#1a1a28]"
                    >
                      แก้ไข
                    </button>
                    <button
                      onClick={() => handleDelete(anime.slug)}
                      className="text-xs px-3 py-1.5 rounded-lg border border-[#2a2a3d] text-[#8a87a3] hover:bg-[#1a1a28]"
                    >
                      ลบ
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      </main>
    </div>
  );
}
