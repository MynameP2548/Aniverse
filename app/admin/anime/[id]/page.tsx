"use client";

import { useEffect, useRef, useState } from "react";
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

  const [anime, setAnime] =
    useState<Anime | null>(null);

  const [episodes, setEpisodes] =
    useState<Episode[]>([]);

  const [seasons, setSeasons] =
    useState<Season[]>([]);

  const [selectedSeason, setSelectedSeason] =
    useState("");

  const [creatingSeason, setCreatingSeason] =
    useState(false);

  const [form, setForm] =
    useState(emptyForm);

  const [editingId, setEditingId] =
    useState<string | null>(null);

  const [loading, setLoading] =
    useState(true);

  const [saving, setSaving] =
    useState(false);

  const [errorMsg, setErrorMsg] =
    useState("");

  // ==========================
  // Upload Video
  // ==========================

  const [uploadingVideo, setUploadingVideo] =
    useState(false);

  const [uploadProgress, setUploadProgress] =
    useState(0);

  const [selectedVideo, setSelectedVideo] =
    useState<File | null>(null);

  const fileInputRef =
    useRef<HTMLInputElement>(null);

  // ==========================
  // โหลดข้อมูลทั้งหมด
  // ==========================

  async function loadData() {
    setLoading(true);

    try {
      const [
        animeRes,
        episodesRes,
        seasonsRes,
      ] = await Promise.all([
        fetch("/api/anime").then((r) =>
          r.json()
        ),

        fetch(
          `/api/anime/${animeId}/episodes?seasonId=${selectedSeason}`
        ).then((r) => r.json()),

        fetch(
          `/api/anime/${animeId}/seasons`
        ).then((r) => r.json()),
      ]);

      setSeasons(seasonsRes);

      if (
        seasonsRes.length > 0 &&
        selectedSeason === ""
      ) {
        setSelectedSeason(
          seasonsRes[0].id
        );
      }

      const found = Array.isArray(
        animeRes
      )
        ? animeRes.find(
            (a: Anime) =>
              a.id === animeId
          )
        : null;

      setAnime(found || null);

      setEpisodes(episodesRes);
    } catch {
      setErrorMsg(
        "โหลดข้อมูลไม่สำเร็จ"
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadData();

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [animeId, selectedSeason]);

  // ==========================
  // Upload Video → R2
  // ==========================

  async function uploadVideo(
  file: File
) {
  setUploadingVideo(true);
  setUploadProgress(0);
  setErrorMsg("");

  try {
    // ==================================================
    // 1. ขอ Multipart Upload จาก Server
    // ==================================================

    const initRes =
      await fetch(
        "/api/upload/video",
        {
          method: "POST",

          headers: {
            "Content-Type":
              "application/json",
          },

          body: JSON.stringify({
            action: "init",

            fileName:
              file.name,

            contentType:
              file.type,

            size:
              file.size,
          }),
        }
      );

    const initData =
      await initRes.json();

    if (!initRes.ok) {
      throw new Error(
        initData.error ||
          "ไม่สามารถเริ่มอัปโหลดได้"
      );
    }

    const {
      uploadId,
      key,
      partSize,
      parts,
    } = initData;

    if (
      !uploadId ||
      !key ||
      !partSize ||
      !Array.isArray(parts)
    ) {
      throw new Error(
        "ข้อมูล Multipart Upload ไม่ถูกต้อง"
      );
    }

    // ==================================================
    // 2. Upload แต่ละ Part
    // ==================================================

    type UploadedPart = {
      partNumber: number;
      etag: string;
    };

    const uploadedParts: UploadedPart[] =
      [];

    let uploadedBytes = 0;

    // อัปโหลดทีละ 3 parts
    // เพื่อไม่ให้ connection หนักเกินไป
    const CONCURRENCY = 3;

    async function uploadPart(
      part: {
        partNumber: number;
        uploadUrl: string;
      }
    ) {
      const start =
        (part.partNumber - 1) *
        partSize;

      const end =
        Math.min(
          start + partSize,
          file.size
        );

      const blob =
        file.slice(
          start,
          end
        );

      return new Promise<UploadedPart>(
        (
          resolve,
          reject
        ) => {
          const xhr =
            new XMLHttpRequest();

          xhr.open(
            "PUT",
            part.uploadUrl
          );

          xhr.upload.onprogress = (
            event
          ) => {
            if (
              event.lengthComputable
            ) {
              const currentPartBytes =
                event.loaded;

              const totalProgressBytes =
                uploadedBytes +
                currentPartBytes;

              const percent =
                Math.min(
                  99,
                  Math.round(
                    (totalProgressBytes *
                      100) /
                      file.size
                  )
                );

              setUploadProgress(
                percent
              );
            }
          };

          xhr.onload = () => {
            if (
              xhr.status >= 200 &&
              xhr.status < 300
            ) {
              const etag =
                xhr.getResponseHeader(
                  "ETag"
                );

              if (!etag) {
                reject(
                  new Error(
                    `Part ${part.partNumber}: ไม่พบ ETag`
                  )
                );

                return;
              }

              uploadedBytes +=
                blob.size;

              setUploadProgress(
                Math.min(
                  99,
                  Math.round(
                    (uploadedBytes *
                      100) /
                      file.size
                  )
                )
              );

              resolve({
                partNumber:
                  part.partNumber,

                etag,
              });
            } else {
              reject(
                new Error(
                  `Part ${part.partNumber} อัปโหลดไม่สำเร็จ (${xhr.status})`
                )
              );
            }
          };

          xhr.onerror = () => {
            reject(
              new Error(
                `Part ${part.partNumber} เชื่อมต่อ R2 ไม่สำเร็จ`
              )
            );
          };

          xhr.onabort = () => {
            reject(
              new Error(
                `Part ${part.partNumber} ถูกยกเลิก`
              )
            );
          };

          // ไม่ต้องตั้ง Content-Type
          // เพราะ presigned UploadPart
          // ไม่ได้เซ็น Content-Type

          xhr.send(blob);
        }
      );
    }

    // ==================================================
    // 3. ทำงานเป็นชุด ๆ
    // ==================================================

    for (
      let i = 0;
      i < parts.length;
      i += CONCURRENCY
    ) {
      const batch =
        parts.slice(
          i,
          i + CONCURRENCY
        );

      const results =
        await Promise.all(
          batch.map(
            (
              part: {
                partNumber: number;
                uploadUrl: string;
              }
            ) =>
              uploadPart(part)
          )
        );

      uploadedParts.push(
        ...results
      );
    }

    // ==================================================
    // 4. Complete Multipart Upload
    // ==================================================

    setUploadProgress(99);

    const completeRes =
      await fetch(
        "/api/upload/video",
        {
          method: "POST",

          headers: {
            "Content-Type":
              "application/json",
          },

          body: JSON.stringify({
            action:
              "complete",

            uploadId,

            key,

            parts:
              uploadedParts,
          }),
        }
      );

    const completeData =
      await completeRes.json();

    if (!completeRes.ok) {
      throw new Error(
        completeData.error ||
          "ไม่สามารถรวมไฟล์วิดีโอได้"
      );
    }

    if (
      !completeData.url
    ) {
      throw new Error(
        "R2 ไม่ส่ง URL กลับมา"
      );
    }

    // ==================================================
    // 5. บันทึก URL ลง Form
    // ==================================================

    setForm((prev) => ({
      ...prev,

      videoUrl:
        completeData.url,
    }));

    setUploadProgress(
      100
    );

  } catch (err) {
    console.error(
      "VIDEO MULTIPART UPLOAD ERROR:",
      err
    );

    setErrorMsg(
      err instanceof Error
        ? err.message
        : "อัปโหลดวิดีโอไม่สำเร็จ"
    );

    // ----------------------------------------------
    // ถ้า error หลังจากสร้าง upload
    // พยายาม Abort เพื่อไม่ทิ้ง multipart ค้าง
    // ----------------------------------------------

    // หมายเหตุ:
    // ถ้าอยากทำ abort แบบสมบูรณ์
    // เราจะเก็บ uploadId/key ไว้ด้านนอก try
    // ในเวอร์ชันถัดไปได้

    setUploadProgress(0);

    throw err;
  } finally {
    setUploadingVideo(false);
  }
}

  // ==========================
  // Create Season
  // ==========================

  async function createSeason() {
    const title = prompt(
      "ชื่อ Season เช่น Season 1"
    );

    if (!title) return;

    const seasonNumber = prompt(
      "Season Number"
    );

    if (!seasonNumber) return;

    setCreatingSeason(true);

    try {
      const res = await fetch(
        `/api/anime/${animeId}/seasons`,
        {
          method: "POST",

          headers: {
            "Content-Type":
              "application/json",
          },

          body: JSON.stringify({
            title,

            seasonNumber:
              Number(seasonNumber),
          }),
        }
      );

      const data =
        await res.json();

      if (!res.ok) {
        throw new Error(
          data.error
        );
      }

      await loadData();

      setSelectedSeason(
        data.id
      );

      alert(
        "เพิ่ม Season สำเร็จ"
      );
    } catch (err) {
      alert(
        err instanceof Error
          ? err.message
          : "เพิ่ม Season ไม่สำเร็จ"
      );
    } finally {
      setCreatingSeason(
        false
      );
    }
  }

  // ==========================
  // Delete Season
  // ==========================

  async function deleteSeason() {
    if (!selectedSeason)
      return;

    if (
      !confirm(
        "ต้องการลบ Season นี้ใช่หรือไม่?"
      )
    ) {
      return;
    }

    try {
      const res = await fetch(
        `/api/seasons/${selectedSeason}`,
        {
          method: "DELETE",
        }
      );

      const data =
        await res.json();

      if (!res.ok) {
        throw new Error(
          data.error
        );
      }

      setSelectedSeason("");

      await loadData();

      alert(
        "ลบ Season สำเร็จ"
      );
    } catch (err) {
      alert(
        err instanceof Error
          ? err.message
          : "ลบ Season ไม่สำเร็จ"
      );
    }
  }

  // ==========================
  // Edit Episode
  // ==========================

  function startEdit(
    ep: Episode
  ) {
    setEditingId(ep.id);

    setSelectedSeason(
      ep.seasonId ?? ""
    );

    setForm({
      seasonId:
        ep.seasonId ?? "",

      episodeNumber: String(
        ep.episodeNumber
      ),

      title:
        ep.title || "",

      videoUrl:
        ep.videoUrl,

      thumbnail:
        ep.thumbnail || "",

      duration: ep.duration
        ? String(
            ep.duration
          )
        : "",
    });

    setSelectedVideo(
      null
    );

    setUploadProgress(
      0
    );
  }

  // ==========================
  // Cancel Edit
  // ==========================

  function cancelEdit() {
    setEditingId(null);

    setForm(
      emptyForm
    );

    setSelectedVideo(
      null
    );

    setUploadProgress(
      0
    );

    if (
      seasons.length > 0
    ) {
      setSelectedSeason(
        seasons[0].id
      );
    }
  }

  // ==========================
  // Submit
  // ==========================

  async function handleSubmit(
    e: React.FormEvent
  ) {
    e.preventDefault();

    if (
      !form.episodeNumber ||
      !form.videoUrl
    ) {
      setErrorMsg(
        "กรุณากรอกลำดับตอนและอัปโหลดวิดีโอ"
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

      const payload = {
        seasonId:
          selectedSeason,

        episodeNumber:
          Number(
            form.episodeNumber
          ),

        title:
          form.title.trim(),

        videoUrl:
          form.videoUrl,

        thumbnail:
          form.thumbnail.trim(),

        duration: form.duration
          ? Number(
              form.duration
            )
          : null,
      };

      const res = await fetch(
        url,
        {
          method,

          headers: {
            "Content-Type":
              "application/json",
          },

          body: JSON.stringify(
            payload
          ),
        }
      );

      const data =
        await res.json();

      if (!res.ok) {
        throw new Error(
          data.error ||
            "บันทึกไม่สำเร็จ"
        );
      }

      cancelEdit();

      await loadData();

      alert(
        editingId
          ? "แก้ไขตอนสำเร็จ"
          : "เพิ่มตอนสำเร็จ"
      );
    } catch (err) {
      setErrorMsg(
        err instanceof Error
          ? err.message
          : "เกิดข้อผิดพลาด"
      );
    } finally {
      setSaving(false);
    }
  }

  // ==========================
  // Delete Episode
  // ==========================

  async function handleDelete(
    id: string
  ) {
    if (
      !confirm(
        "ยืนยันลบตอนนี้?"
      )
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

  // ==========================
  // JSX
  // ==========================

  return (
    <div className="min-h-screen bg-[#0b0b12] text-[#e8e6f0]">

      <header className="border-b border-[#232335] px-6 py-5">

        <Link
          href="/admin"
          className="text-xs text-[#8a87a3] hover:text-[#e8e6f0]"
        >
          ← กลับไปรายการอนิเมะ
        </Link>

        <h1 className="mt-2 text-2xl font-bold tracking-tight">
          จัดการตอน
          {anime
            ? ` · ${anime.title}`
            : ""}
        </h1>

      </header>

      <main className="mx-auto max-w-3xl px-6 py-8">

        <form
          onSubmit={
            handleSubmit
          }
          className="
            mb-8
            rounded-xl
            border
            border-[#232335]
            bg-[#131320]
            p-5
          "
        >

          <h2 className="mb-4 text-lg font-semibold">

            {editingId
              ? "แก้ไขตอน"
              : "เพิ่มตอนใหม่"}

          </h2>

          {errorMsg && (
            <div
              className="
                mb-4
                rounded-lg
                border
                border-[#ff5d73]/40
                bg-[#3a1620]
                px-3
                py-2
                text-sm
                text-[#ff9aa8]
              "
            >
              {errorMsg}
            </div>
          )}

          {/* ==========================
              Season
          ========================== */}

          <div className="mb-5 flex items-end gap-3">

            <div className="flex-1">

              <label className="mb-1 block text-xs text-[#8a87a3]">
                Season *
              </label>

              <select
                value={
                  selectedSeason
                }
                onChange={(e) =>
                  setSelectedSeason(
                    e.target.value
                  )
                }
                className="
                  w-full
                  rounded-lg
                  border
                  border-[#2a2a3d]
                  bg-[#0b0b12]
                  px-3
                  py-2
                  text-sm
                  focus:outline-none
                  focus:ring-2
                  focus:ring-[#ff5d73]
                "
              >

                {seasons.map(
                  (season) => (
                    <option
                      key={
                        season.id
                      }
                      value={
                        season.id
                      }
                    >
                      {season.title ||
                        `Season ${season.seasonNumber}`}
                    </option>
                  )
                )}

              </select>

            </div>

            <div className="flex gap-2">

              <button
                type="button"
                onClick={
                  createSeason
                }
                disabled={
                  creatingSeason
                }
                className="
                  h-[42px]
                  rounded-lg
                  bg-[#ff5d73]
                  px-4
                  font-semibold
                  text-black
                "
              >
                + Season
              </button>

              <button
                type="button"
                onClick={
                  deleteSeason
                }
                className="
                  h-[42px]
                  rounded-lg
                  border
                  border-red-500/40
                  px-4
                  text-red-400
                  hover:bg-red-500/10
                "
              >
                ลบ
              </button>

            </div>

          </div>

          {/* ==========================
              Episode Number / Duration
          ========================== */}

          <div className="grid grid-cols-2 gap-3 mb-3">

            <div>

              <label className="mb-1 block text-xs text-[#8a87a3]">
                ลำดับตอน *
              </label>

              <input
                type="number"
                value={
                  form.episodeNumber
                }
                onChange={(e) =>
                  setForm({
                    ...form,
                    episodeNumber:
                      e.target.value,
                  })
                }
                className="
                  w-full
                  rounded-lg
                  border
                  border-[#2a2a3d]
                  bg-[#0b0b12]
                  px-3
                  py-2
                  text-sm
                  focus:outline-none
                  focus:ring-2
                  focus:ring-[#ff5d73]
                "
                placeholder="1"
              />

            </div>

            <div>

              <label className="mb-1 block text-xs text-[#8a87a3]">
                ความยาว (วินาที)
              </label>

              <input
                type="number"
                value={
                  form.duration
                }
                onChange={(e) =>
                  setForm({
                    ...form,
                    duration:
                      e.target.value,
                  })
                }
                className="
                  w-full
                  rounded-lg
                  border
                  border-[#2a2a3d]
                  bg-[#0b0b12]
                  px-3
                  py-2
                  text-sm
                  focus:outline-none
                  focus:ring-2
                  focus:ring-[#ff5d73]
                "
                placeholder="1440"
              />

            </div>

          </div>

          {/* ==========================
              Episode Title
          ========================== */}

          <div className="mb-3">

            <label className="mb-1 block text-xs text-[#8a87a3]">
              ชื่อตอน
            </label>

            <input
              value={
                form.title
              }
              onChange={(e) =>
                setForm({
                  ...form,
                  title:
                    e.target.value,
                })
              }
              className="
                w-full
                rounded-lg
                border
                border-[#2a2a3d]
                bg-[#0b0b12]
                px-3
                py-2
                text-sm
                focus:outline-none
                focus:ring-2
                focus:ring-[#ff5d73]
              "
              placeholder="จุดเริ่มต้น"
            />

          </div>

          {/* ==========================
              Video Upload
          ========================== */}

          <div className="mb-4">

            <label className="mb-1 block text-xs text-[#8a87a3]">
              วิดีโอ
            </label>

            <input
              value={
                form.videoUrl
              }
              readOnly
              className="
                w-full
                rounded-lg
                border
                border-[#2a2a3d]
                bg-[#09090f]
                px-3
                py-2
                text-sm
              "
              placeholder="อัปโหลดไฟล์ MP4 เพื่อสร้าง URL"
            />

            <input
              ref={
                fileInputRef
              }
              type="file"
              accept="video/mp4"
              className="hidden"
              onChange={(e) => {
                const file =
                  e.target.files?.[0];

                if (!file)
                  return;

                setSelectedVideo(
                  file
                );

                uploadVideo(
                  file
                ).catch(
                  (err) => {
                    setErrorMsg(
                      err instanceof Error
                        ? err.message
                        : "อัปโหลดไม่สำเร็จ"
                    );
                  }
                );
              }}
            />

            <button
              type="button"
              onClick={() =>
                fileInputRef.current?.click()
              }
              disabled={
                uploadingVideo
              }
              className="
                mt-3
                rounded-lg
                bg-[#ff5d73]
                px-4
                py-2
                text-sm
                font-semibold
                text-black
                transition
                hover:bg-[#ff738a]
                disabled:opacity-60
              "
            >
              {uploadingVideo
                ? "กำลังอัปโหลด..."
                : "📹 เลือกไฟล์ MP4"}
            </button>

            {/* ==========================
                Upload Information
            ========================== */}

            {selectedVideo && (
              <div
                className="
                  mt-4
                  rounded-lg
                  border
                  border-[#2a2a3d]
                  bg-[#0f0f18]
                  p-4
                "
              >

                <div className="flex items-center justify-between">

                  <div>

                    <p className="font-medium text-sm">
                      {
                        selectedVideo.name
                      }
                    </p>

                    <p className="mt-1 text-xs text-[#8a87a3]">
                      {(
                        selectedVideo.size /
                        1024 /
                        1024
                      ).toFixed(2)}
                      {" MB"}
                    </p>

                  </div>

                  {uploadProgress ===
                    100 && (
                    <span
                      className="
                        rounded-full
                        bg-green-500/20
                        px-3
                        py-1
                        text-xs
                        font-semibold
                        text-green-400
                      "
                    >
                      ✓ Upload สำเร็จ
                    </span>
                  )}

                </div>

                {/* Progress */}

                {uploadingVideo && (
                  <div className="mt-4">

                    <div className="mb-1 flex justify-between text-xs">

                      <span>
                        กำลังอัปโหลด...
                      </span>

                      <span>
                        {
                          uploadProgress
                        }%
                      </span>

                    </div>

                    <div
                      className="
                        h-2
                        overflow-hidden
                        rounded-full
                        bg-[#222]
                      "
                    >

                      <div
                        className="
                          h-full
                          bg-[#ff5d73]
                          transition-all
                          duration-300
                        "
                        style={{
                          width: `${uploadProgress}%`,
                        }}
                      />

                    </div>

                  </div>
                )}

              </div>
            )}

            {/* ==========================
                Video Preview
            ========================== */}

            {form.videoUrl && (
              <div className="mt-5">

                <label className="mb-2 block text-xs text-[#8a87a3]">
                  ตัวอย่างวิดีโอ
                </label>

                <video
                  src={
                    form.videoUrl
                  }
                  controls
                  preload="metadata"
                  className="
                    aspect-video
                    w-full
                    rounded-xl
                    bg-black
                    border
                    border-[#232335]
                  "
                />

              </div>
            )}

          </div>

          {/* ==========================
              Thumbnail
          ========================== */}

          <div className="mb-4">

            <label className="mb-1 block text-xs text-[#8a87a3]">
              URL รูปปกตอน (Thumbnail)
            </label>

            <input
              value={
                form.thumbnail
              }
              onChange={(e) =>
                setForm({
                  ...form,
                  thumbnail:
                    e.target.value,
                })
              }
              className="
                w-full
                rounded-lg
                border
                border-[#2a2a3d]
                bg-[#0b0b12]
                px-3
                py-2
                text-sm
                focus:outline-none
                focus:ring-2
                focus:ring-[#ff5d73]
              "
              placeholder="https://..."
            />

          </div>

          {/* ==========================
              Actions
          ========================== */}

          <div className="flex gap-2">

            <button
              type="submit"
              disabled={
                saving ||
                uploadingVideo ||
                !selectedSeason
              }
              className="
                flex-1
                rounded-lg
                bg-[#ff5d73]
                py-2
                text-sm
                font-semibold
                text-[#0b0b12]
                transition
                hover:bg-[#ff738a]
                disabled:opacity-50
              "
            >
              {saving
                ? "กำลังบันทึก..."
                : editingId
                ? "บันทึกการแก้ไข"
                : "เพิ่มตอน"}
            </button>

            {editingId && (
              <button
                type="button"
                onClick={
                  cancelEdit
                }
                className="
                  rounded-lg
                  border
                  border-[#2a2a3d]
                  px-4
                  text-sm
                  text-[#8a87a3]
                  hover:text-white
                "
              >
                ยกเลิก
              </button>
            )}

          </div>

        </form>

        {/* ==========================
            Episode List
        ========================== */}

        <h2 className="mb-4 text-lg font-semibold">

          รายการตอนทั้งหมด

          {!loading &&
            ` (${episodes.length})`}

        </h2>

        {loading ? (

          <div className="grid gap-2 animate-pulse">

            {Array.from({
              length: 4,
            }).map((_, i) => (

              <div
                key={i}
                className="
                  flex
                  items-center
                  gap-3
                  rounded-lg
                  border
                  border-[#232335]
                  bg-[#131320]
                  p-3
                "
              >

                <div className="h-4 w-10 rounded bg-[#1a1a28]" />

                <div className="h-4 flex-1 rounded bg-[#1a1a28]" />

              </div>

            ))}

          </div>

        ) : episodes.length === 0 ? (

          <p className="text-sm text-[#8a87a3]">
            ยังไม่มีตอนในเรื่องนี้
          </p>

        ) : (

          <div className="grid gap-2">

            {episodes.map(
              (ep) => (

                <div
                  key={ep.id}
                  className="
                    flex
                    items-center
                    gap-3
                    rounded-lg
                    border
                    border-[#232335]
                    bg-[#131320]
                    p-3
                  "
                >

                  <span
                    className="
                      w-10
                      flex-shrink-0
                      text-sm
                      font-bold
                      text-[#ff5d73]
                    "
                  >
                    EP
                    {
                      ep.episodeNumber
                    }
                  </span>

                  <div className="flex-1">

                    <div className="truncate text-sm">
                      {ep.title ||
                        "(ไม่มีชื่อตอน)"}
                    </div>

                    <div className="mt-1 truncate text-xs text-[#8a87a3]">
                      {
                        ep.videoUrl
                      }
                    </div>

                  </div>

                  <button
                    onClick={() =>
                      startEdit(
                        ep
                      )
                    }
                    className="
                      rounded-lg
                      border
                      border-[#2a2a3d]
                      px-3
                      py-1.5
                      text-xs
                      hover:bg-[#1a1a28]
                    "
                  >
                    แก้ไข
                  </button>

                  <button
                    onClick={() =>
                      handleDelete(
                        ep.id
                      )
                    }
                    className="
                      rounded-lg
                      border
                      border-[#ff5d73]/30
                      px-3
                      py-1.5
                      text-xs
                      text-[#ff5d73]
                      hover:bg-[#ff5d73]/10
                    "
                  >
                    ลบ
                  </button>

                </div>

              )
            )}

          </div>

        )}

      </main>

    </div>
  );
}