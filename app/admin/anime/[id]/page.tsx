"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";

type Episode = {
  id: string;
  seasonId?: string | null;
  episodeNumber: number;
  title?: string;
  videoUrl: string;
  thumbnail?: string;
  duration?: number;
};

type Anime = {
  id: string;
  title: string;
  coverImage?: string;
};

type Season = {
  id: string;
  seasonNumber: number;
  title?: string;
};

const emptyForm = {
  seasonId: "",
  episodeNumber: "",
  title: "",
  videoUrl: "",
  thumbnail: "",
  duration: "",
};

export default function ManageEpisodesPage() {
  const params = useParams();
  const animeId = params.id as string;

  const [anime, setAnime] = useState<Anime | null>(null);
  const [episodes, setEpisodes] = useState<Episode[]>([]);
  const [seasons, setSeasons] = useState<Season[]>([]);
  const [selectedSeason, setSelectedSeason] = useState("");
  const [creatingSeason, setCreatingSeason] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  // โหลดข้อมูลทั้งหมด
  async function loadData() {
    setLoading(true);
    try {
      const [animeRes, episodesRes, seasonsRes] = await Promise.all([
        fetch(`/api/anime`).then((r) => r.json()),
        fetch(`/api/anime/${animeId}/episodes?seasonId=${selectedSeason}`).then((r) => r.json()),
        fetch(`/api/anime/${animeId}/seasons`).then((r) => r.json()),
      ]);

      setSeasons(seasonsRes);

      if (seasonsRes.length > 0 && selectedSeason === "") {
        setSelectedSeason(seasonsRes[0].id);
      }

      const found = Array.isArray(animeRes)
        ? animeRes.find((a: Anime) => a.id === animeId)
        : null;
      setAnime(found || null);
      setEpisodes(episodesRes);
    } catch {
      setErrorMsg("โหลดข้อมูลไม่สำเร็จ");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [animeId, selectedSeason]);

  // ฟังก์ชันสร้าง Season ใหม่
  async function createSeason() {
    const title = prompt("ชื่อ Season เช่น Season 1");
    if (!title) return;

    const seasonNumber = prompt("Season Number");
    if (!seasonNumber) return;

    setCreatingSeason(true);

    try {
      const res = await fetch(`/api/anime/${animeId}/seasons`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          title,
          seasonNumber: Number(seasonNumber),
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error);
      }

      await loadData();
      setSelectedSeason(data.id);
      alert("เพิ่ม Season สำเร็จ");
    } catch (err) {
      alert(err instanceof Error ? err.message : "เพิ่ม Season ไม่สำเร็จ");
    } finally {
      setCreatingSeason(false);
    }
  }

  // ฟังก์ชันลบ Season
  async function deleteSeason() {
    if (!selectedSeason) return;

    if (!confirm("ต้องการลบ Season นี้ใช่หรือไม่?")) {
      return;
    }

    try {
      const res = await fetch(`/api/seasons/${selectedSeason}`, {
        method: "DELETE",
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error);
      }

      setSelectedSeason("");
      await loadData();
      alert("ลบ Season สำเร็จ");
    } catch (err) {
      alert(err instanceof Error ? err.message : "ลบ Season ไม่สำเร็จ");
    }
  }

  function startEdit(ep: Episode) {
    setEditingId(ep.id);
    setSelectedSeason(ep.seasonId ?? "");

    setForm({
      seasonId: ep.seasonId ?? "",
      episodeNumber: String(ep.episodeNumber),
      title: ep.title || "",
      videoUrl: ep.videoUrl,
      thumbnail: ep.thumbnail || "",
      duration: ep.duration ? String(ep.duration) : "",
    });
  }

  function cancelEdit() {
    setEditingId(null);
    setForm(emptyForm);

    if (seasons.length > 0) {
      setSelectedSeason(seasons[0].id);
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.episodeNumber || !form.videoUrl) {
      setErrorMsg("กรุณากรอกลำดับตอนและลิงก์วิดีโอ");
      return;
    }
    setSaving(true);
    setErrorMsg("");

    try {
      const url = editingId
        ? `/api/episodes/${editingId}`
        : `/api/anime/${animeId}/episodes`;
      const method = editingId ? "PUT" : "POST";
      
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          seasonId: selectedSeason,
          episodeNumber: form.episodeNumber,
          title: form.title,
          videoUrl: form.videoUrl,
          thumbnail: form.thumbnail,
          duration: form.duration,
        }),
      });
      
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "เกิดข้อผิดพลาด");
      
      cancelEdit();
      await loadData();
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : "บันทึกไม่สำเร็จ");
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(id: string) {
    if (!confirm("ยืนยันลบตอนนี้?")) return;
    await fetch(`/api/episodes/${id}`, { method: "DELETE" });
    await loadData();
  }

  return (
    <div className="min-h-screen bg-[#0b0b12] text-[#e8e6f0]">
      <header className="border-b border-[#232335] px-6 py-5">
        <Link href="/admin" className="text-xs text-[#8a87a3] hover:text-[#e8e6f0]">
          ← กลับไปรายการอนิเมะ
        </Link>
        <h1 className="text-2xl font-bold tracking-tight mt-2">
          จัดการตอน{anime ? ` · ${anime.title}` : ""}
        </h1>
      </header>

      <main className="max-w-3xl mx-auto px-6 py-8">
        <form
          onSubmit={handleSubmit}
          className="bg-[#131320] border border-[#232335] rounded-xl p-5 mb-8"
        >
          <h2 className="font-semibold text-lg mb-4">
            {editingId ? "แก้ไขตอน" : "เพิ่มตอนใหม่"}
          </h2>

          {errorMsg && (
            <div className="bg-[#3a1620] border border-[#ff5d73]/40 text-[#ff9aa8] text-sm rounded-lg px-3 py-2 mb-4">
              {errorMsg}
            </div>
          )}

          <div className="mb-5 flex items-end gap-3">
            <div className="flex-1">
              <label className="text-xs text-[#8a87a3] block mb-1">
                Season *
              </label>
              <select
                value={selectedSeason}
                onChange={(e) => setSelectedSeason(e.target.value)}
                className="w-full bg-[#0b0b12] border border-[#2a2a3d] rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#ff5d73]"
              >
                {seasons.map((season) => (
                  <option key={season.id} value={season.id}>
                    {season.title || `Season ${season.seasonNumber}`}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex gap-2">
              <button
                type="button"
                onClick={createSeason}
                disabled={creatingSeason}
                className="h-[42px] rounded-lg bg-[#ff5d73] px-4 font-semibold text-black"
              >
                + Season
              </button>

              <button
                type="button"
                onClick={deleteSeason}
                className="h-[42px] rounded-lg border border-red-500/40 px-4 text-red-400 hover:bg-red-500/10"
              >
                ลบ
              </button>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3 mb-3">
            <div>
              <label className="text-xs text-[#8a87a3] block mb-1">ลำดับตอน *</label>
              <input
                type="number"
                value={form.episodeNumber}
                onChange={(e) => setForm({ ...form, episodeNumber: e.target.value })}
                className="w-full bg-[#0b0b12] border border-[#2a2a3d] rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#ff5d73]"
                placeholder="1"
              />
            </div>
            <div>
              <label className="text-xs text-[#8a87a3] block mb-1">ความยาว (วินาที)</label>
              <input
                type="number"
                value={form.duration}
                onChange={(e) => setForm({ ...form, duration: e.target.value })}
                className="w-full bg-[#0b0b12] border border-[#2a2a3d] rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#ff5d73]"
                placeholder="1440"
              />
            </div>
          </div>

          <div className="mb-3">
            <label className="text-xs text-[#8a87a3] block mb-1">ชื่อตอน</label>
            <input
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
              className="w-full bg-[#0b0b12] border border-[#2a2a3d] rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#ff5d73]"
              placeholder="จุดเริ่มต้น"
            />
          </div>

          <div className="mb-3">
            <label className="text-xs text-[#8a87a3] block mb-1">
              ลิงก์วิดีโอ (embed URL) *
            </label>
            <input
              value={form.videoUrl}
              onChange={(e) => setForm({ ...form, videoUrl: e.target.value })}
              className="w-full bg-[#0b0b12] border border-[#2a2a3d] rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#ff5d73]"
              placeholder="https://www.youtube.com/embed/VIDEO_ID"
            />
            <p className="text-[10px] text-[#5a5770] mt-1">
              ต้องเป็นลิงก์แบบ /embed/ เช่น youtube.com/embed/xxxx ไม่ใช่ลิงก์หน้าดูปกติ
            </p>
          </div>

          <div className="mb-4">
            <label className="text-xs text-[#8a87a3] block mb-1">URL รูปปกตอน (thumbnail)</label>
            <input
              value={form.thumbnail}
              onChange={(e) => setForm({ ...form, thumbnail: e.target.value })}
              className="w-full bg-[#0b0b12] border border-[#2a2a3d] rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#ff5d73]"
              placeholder="https://..."
            />
          </div>

          <div className="flex gap-2">
            <button
              type="submit"
              disabled={saving || !selectedSeason}
              className="flex-1 bg-[#ff5d73] hover:bg-[#ff738a] transition text-[#0b0b12] font-semibold rounded-lg py-2 text-sm disabled:opacity-50"
            >
              {saving ? "กำลังบันทึก..." : editingId ? "บันทึกการแก้ไข" : "เพิ่มตอน"}
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

        <h2 className="font-semibold text-lg mb-4">
          รายการตอนทั้งหมด {!loading && `(${episodes.length})`}
        </h2>

        {loading ? (
          <div className="grid gap-2 animate-pulse">
            {Array.from({ length: 4 }).map((_, i) => (
              <div
                key={i}
                className="bg-[#131320] border border-[#232335] rounded-lg p-3 flex items-center gap-3"
              >
                <div className="w-10 h-4 rounded bg-[#1a1a28] flex-shrink-0" />
                <div className="flex-1 h-4 rounded bg-[#1a1a28]" />
              </div>
            ))}
          </div>
        ) : episodes.length === 0 ? (
          <p className="text-[#8a87a3] text-sm">ยังไม่มีตอนในเรื่องนี้</p>
        ) : (
          <div className="grid gap-2">
            {episodes.map((ep) => (
              <div
                key={ep.id}
                className="bg-[#131320] border border-[#232335] rounded-lg p-3 flex items-center gap-3"
              >
                <span className="text-[#ff5d73] font-bold text-sm w-10 flex-shrink-0">
                  EP{ep.episodeNumber}
                </span>
                <span className="flex-1 text-sm truncate">
                  {ep.title || "(ไม่มีชื่อตอน)"}
                </span>
                <button
                  onClick={() => startEdit(ep)}
                  className="text-xs px-3 py-1.5 rounded-lg border border-[#2a2a3d] hover:bg-[#1a1a28]"
                >
                  แก้ไข
                </button>
                <button
                  onClick={() => handleDelete(ep.id)}
                  className="text-xs px-3 py-1.5 rounded-lg border border-[#ff5d73]/30 text-[#ff5d73] hover:bg-[#ff5d73]/10"
                >
                  ลบ
                </button>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}