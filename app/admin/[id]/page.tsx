"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";

type Season = {
  id: string;
  seasonNumber: number;
  title: string | null;
};

type Episode = {
  id: string;
  episodeNumber: number;
  title: string | null;
  videoUrl: string;
  thumbnail: string | null;
  duration: number | null;
  seasonId: string | null;
};

type Anime = {
  id: string;
  title: string;
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

  const [seasons, setSeasons] = useState<Season[]>([]);
  const [selectedSeason, setSelectedSeason] = useState("");

  const [episodes, setEpisodes] = useState<Episode[]>([]);

  const [loading, setLoading] = useState(true);

  const [saving, setSaving] = useState(false);

  const [editingId, setEditingId] =
    useState<string | null>(null);

  const [errorMsg, setErrorMsg] =
    useState("");

  const [form, setForm] =
    useState(emptyForm);
      async function loadData() {
    setLoading(true);

    try {
      const [animeRes, seasonRes, episodeRes] =
        await Promise.all([
          fetch("/api/anime").then((r) => r.json()),
          fetch(
            `/api/anime/${animeId}/seasons`
          ).then((r) => r.json()),
          fetch(
            `/api/anime/${animeId}/episodes`
          ).then((r) => r.json()),
        ]);

      const currentAnime = animeRes.find(
        (item: Anime) => item.id === animeId
      );

      setAnime(currentAnime ?? null);

      setSeasons(seasonRes);

      if (
        seasonRes.length > 0 &&
        selectedSeason === ""
      ) {
        setSelectedSeason(seasonRes[0].id);
      }

      setEpisodes(episodeRes);
    } catch {
      setErrorMsg("โหลดข้อมูลไม่สำเร็จ");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadData();
  }, [animeId]);

  useEffect(() => {
    if (!selectedSeason) return;

    fetch(
      `/api/anime/${animeId}/episodes?seasonId=${selectedSeason}`
    )
      .then((r) => r.json())
      .then(setEpisodes);
  }, [selectedSeason, animeId]);
    function startEdit(ep: Episode) {
    setEditingId(ep.id);

    setForm({
      seasonId: ep.seasonId ?? "",
      episodeNumber: String(ep.episodeNumber),
      title: ep.title ?? "",
      videoUrl: ep.videoUrl,
      thumbnail: ep.thumbnail ?? "",
      duration: ep.duration
        ? String(ep.duration)
        : "",
    });
  }

  function cancelEdit() {
    setEditingId(null);
    setForm(emptyForm);
  }

  async function handleSubmit(
    e: React.FormEvent
  ) {
    e.preventDefault();

    if (
      !form.seasonId ||
      !form.episodeNumber ||
      !form.videoUrl
    ) {
      setErrorMsg(
        "กรุณาเลือก Season และกรอกข้อมูลให้ครบ"
      );
      return;
    }

    setSaving(true);

    setErrorMsg("");

    try {
      const url = editingId
        ? `/api/episodes/${editingId}`
        : `/api/anime/${animeId}/episodes`;

      const method = editingId
        ? "PUT"
        : "POST";

      const res = await fetch(url, {
        method,

        headers: {
          "Content-Type":
            "application/json",
        },

        body: JSON.stringify(form),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(
          data.error ??
            "เกิดข้อผิดพลาด"
        );
      }

      cancelEdit();

      await loadData();
    } catch (err) {
      setErrorMsg(
        err instanceof Error
          ? err.message
          : "บันทึกไม่สำเร็จ"
      );
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(
    id: string
  ) {
    if (
      !confirm("ยืนยันลบตอนนี้?")
    ) {
      return;
    }

    await fetch(
      `/api/episodes/${id}`,
      {
        method: "DELETE",
      }
    );

    await loadData();
  }
    return (
    <div className="min-h-screen bg-[#080914] text-[#e8e6f0]">

      <header className="border-b border-[#232335] px-6 py-5">

        <Link
          href="/admin"
          className="text-xs text-[#9693b8] hover:text-white"
        >
          ← กลับหน้า Admin
        </Link>

        <h1 className="mt-3 text-3xl font-bold">
          {anime?.title}
        </h1>

        <p className="mt-2 text-sm text-[#9693b8]">
          จัดการ Episode
        </p>

      </header>

      <main className="mx-auto max-w-5xl px-6 py-8">

        <div className="mb-8 flex items-center justify-between">

          <div>

            <h2 className="text-2xl font-bold">
              Season
            </h2>

            <p className="text-sm text-[#9693b8]">
              เลือก Season ที่ต้องการจัดการ
            </p>

          </div>

          <select
            value={selectedSeason}
            onChange={(e) =>
              setSelectedSeason(
                e.target.value
              )
            }
            className="rounded-lg border border-[#2a2a3d] bg-[#131320] px-4 py-2"
          >
            {seasons.map((season) => (
              <option
                key={season.id}
                value={season.id}
              >
                {season.title ??
                  `Season ${season.seasonNumber}`}
              </option>
            ))}
          </select>

        </div>
        <form
  onSubmit={handleSubmit}
  className="mb-10 rounded-2xl border border-[#232335] bg-[#131320] p-6"
>

  <h2 className="mb-6 text-xl font-bold">
    {editingId ? "แก้ไข Episode" : "เพิ่ม Episode"}
  </h2>

  {errorMsg && (
    <div className="mb-4 rounded-lg border border-red-500/30 bg-red-500/10 p-3 text-sm text-red-300">
      {errorMsg}
    </div>
  )}

  <div className="grid gap-4 md:grid-cols-2">

    <div>
      <label className="mb-2 block text-sm">
        Season
      </label>

      <select
        value={form.seasonId}
        onChange={(e) =>
          setForm({
            ...form,
            seasonId: e.target.value,
          })
        }
        className="w-full rounded-lg border border-[#2a2a3d] bg-[#080914] px-4 py-3"
      >
        <option value="">
          เลือก Season
        </option>

        {seasons.map((season) => (
          <option
            key={season.id}
            value={season.id}
          >
            {season.title ??
              `Season ${season.seasonNumber}`}
          </option>
        ))}
      </select>
    </div>

    <div>
      <label className="mb-2 block text-sm">
        Episode
      </label>

      <input
        type="number"
        value={form.episodeNumber}
        onChange={(e) =>
          setForm({
            ...form,
            episodeNumber:
              e.target.value,
          })
        }
        className="w-full rounded-lg border border-[#2a2a3d] bg-[#080914] px-4 py-3"
      />
    </div>

    <div className="md:col-span-2">
      <label className="mb-2 block text-sm">
        ชื่อตอน
      </label>

      <input
        value={form.title}
        onChange={(e) =>
          setForm({
            ...form,
            title: e.target.value,
          })
        }
        className="w-full rounded-lg border border-[#2a2a3d] bg-[#080914] px-4 py-3"
      />
    </div>

    <div className="md:col-span-2">
      <label className="mb-2 block text-sm">
        Video URL
      </label>

      <input
        value={form.videoUrl}
        onChange={(e) =>
          setForm({
            ...form,
            videoUrl: e.target.value,
          })
        }
        className="w-full rounded-lg border border-[#2a2a3d] bg-[#080914] px-4 py-3"
      />
    </div>

    <div>
      <label className="mb-2 block text-sm">
        Thumbnail
      </label>

      <input
        value={form.thumbnail}
        onChange={(e) =>
          setForm({
            ...form,
            thumbnail: e.target.value,
          })
        }
        className="w-full rounded-lg border border-[#2a2a3d] bg-[#080914] px-4 py-3"
      />
    </div>

    <div>
      <label className="mb-2 block text-sm">
        Duration
      </label>

      <input
        type="number"
        value={form.duration}
        onChange={(e) =>
          setForm({
            ...form,
            duration: e.target.value,
          })
        }
        className="w-full rounded-lg border border-[#2a2a3d] bg-[#080914] px-4 py-3"
      />
    </div>

  </div>

  <div className="mt-6 flex gap-3">

    <button
      type="submit"
      disabled={saving}
      className="rounded-lg bg-[#8b5cf6] px-6 py-3 font-semibold text-black"
    >
      {saving
        ? "กำลังบันทึก..."
        : editingId
        ? "บันทึก"
        : "เพิ่ม Episode"}
    </button>

    {editingId && (
      <button
        type="button"
        onClick={cancelEdit}
        className="rounded-lg border border-[#2a2a3d] px-6 py-3"
      >
        ยกเลิก
      </button>
    )}

  </div>

</form>
        <h2 className="mb-6 text-2xl font-bold">
          รายการ Episode ({episodes.length})
        </h2>

        {loading ? (
          <div className="text-center py-10 text-[#9693b8]">
            กำลังโหลด...
          </div>
        ) : episodes.length === 0 ? (
          <div className="rounded-xl border border-[#232335] bg-[#131320] p-8 text-center text-[#9693b8]">
            ยังไม่มี Episode ใน Season นี้
          </div>
        ) : (
          <div className="space-y-3">
            {episodes.map((episode) => (
              <div
                key={episode.id}
                className="flex items-center justify-between rounded-xl border border-[#232335] bg-[#131320] p-4"
              >
                <div>
                  <div className="font-bold text-lg">
                    EP {episode.episodeNumber}
                    {episode.title && ` • ${episode.title}`}
                  </div>

                  <div className="mt-1 text-sm text-[#9693b8]">
                    {episode.videoUrl}
                  </div>
                </div>

                <div className="flex gap-2">
                  <button
                    onClick={() => startEdit(episode)}
                    className="rounded-lg border border-blue-500 px-4 py-2 text-blue-400 hover:bg-blue-500/10"
                  >
                    แก้ไข
                  </button>

                  <button
                    onClick={() => handleDelete(episode.id)}
                    className="rounded-lg border border-red-500 px-4 py-2 text-red-400 hover:bg-red-500/10"
                  >
                    ลบ
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}