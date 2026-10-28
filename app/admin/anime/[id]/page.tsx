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

  introStart?: number | null;
  introEnd?: number | null;
  nextEpisodeTime?: number | null;

  audioTracks?: {
    id?: string;
    language: "THAI" | "JAPANESE";
    url: string;
    label?: string;
  }[];

  subtitles?: {
    id?: string;
    language: string;
    url: string;
    label?: string;
  }[];
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
  introStart: "",
  introEnd: "",
  nextEpisodeTime: "",
  thaiAudioUrl: "",
  japaneseAudioUrl: "",
  thaiSubtitleUrl: "",
};

function secondsToTime(value?: number | null) {
  if (typeof value !== "number" || value < 0) return "";

  const minutes = Math.floor(value / 60);
  const seconds = Math.floor(value % 60);

  return `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(
    2,
    "0"
  )}`;
}

function timeToSeconds(value: string) {
  const text = value.trim();

  if (!text) return null;

  const match = text.match(/^(\d+):([0-5]\d)$/);

  if (!match) {
    return undefined;
  }

  const minutes = Number(match[1]);
  const seconds = Number(match[2]);

  return minutes * 60 + seconds;
}

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
  // Upload HLS Multi-Audio → R2
  // ==========================

  const [uploadingHls, setUploadingHls] =
    useState(false);

  const [hlsUploadProgress, setHlsUploadProgress] =
    useState(0);

  const [selectedHlsFiles, setSelectedHlsFiles] =
    useState<File[]>([]);

  const hlsInputRef =
    useRef<HTMLInputElement>(null);

  // ==========================
  // Upload HLS Multi-Audio → R2
  // ==========================

  async function uploadHlsFolder(
    files: File[]
  ) {
    if (!files.length) {
      return;
    }

    setUploadingHls(true);
    setHlsUploadProgress(0);
    setErrorMsg("");

    try {
      // ----------------------------------------------
      // ตรวจสอบไฟล์สำคัญ
      // ----------------------------------------------

      const hasMaster = files.some(
        (file) =>
          file.webkitRelativePath
            .split("/")
            .pop()
            ?.toLowerCase() === "master.m3u8"
      );

      if (!hasMaster) {
        throw new Error(
          "ไม่พบ master.m3u8 ในโฟลเดอร์ที่เลือก"
        );
      }

      const allowed = files.every(
        (file) => {
          const lower =
            file.webkitRelativePath.toLowerCase();

          return (
            lower.endsWith(".m3u8") ||
            lower.endsWith(".ts")
          );
        }
      );

      if (!allowed) {
        throw new Error(
          "โฟลเดอร์ HLS ต้องมีเฉพาะไฟล์ .m3u8 และ .ts"
        );
      }

      if (files.length > 2000) {
        throw new Error(
          "จำนวนไฟล์ HLS มากเกินไป (สูงสุด 2000 ไฟล์)"
        );
      }

      setSelectedHlsFiles(files);

      // ----------------------------------------------
      // 1. ขอ Presigned URLs จาก Server
      // ----------------------------------------------

      const initRes = await fetch(
        "/api/upload/hls",
        {
          method: "POST",
          headers: {
            "Content-Type":
              "application/json",
          },
          body: JSON.stringify({
            action: "init",
            files: files.map((file) => ({
              name: file.name,
              relativePath:
                file.webkitRelativePath ||
                file.name,
              size: file.size,
            })),
          }),
        }
      );

      const initData =
        await initRes.json();

      if (!initRes.ok) {
        throw new Error(
          initData.error ||
            "ไม่สามารถเริ่มอัปโหลด HLS ได้"
        );
      }

type HlsUploadFile = {
  name: string;
  relativePath: string;
  key: string;
  uploadUrl: string;
  contentType: string;
};

const uploadFiles: HlsUploadFile[] =
  Array.isArray(initData.files)
    ? initData.files
    : [];

      if (!uploadFiles.length) {
        throw new Error(
          "Server ไม่ได้ส่งรายการไฟล์สำหรับอัปโหลดกลับมา"
        );
      }

      // ----------------------------------------------
      // จับคู่ URL กับ File จริง
      // ----------------------------------------------

      const fileMap = new Map<
        string,
        File
      >();

      for (const file of files) {
        const relativePath =
          file.webkitRelativePath ||
          file.name;

        const cleanRelativePath =
          relativePath
            .replace(/\\/g, "/")
            .split("/")
            .filter(Boolean)
            .slice(1)
            .join("/");

        fileMap.set(
          cleanRelativePath,
          file
        );
      }

      // ----------------------------------------------
      // 2. Upload ตรงจาก Browser → R2
      // ----------------------------------------------

      let completed = 0;

      const CONCURRENCY = 5;

      async function uploadOne(
        item: {
          relativePath: string;
          uploadUrl: string;
          contentType: string;
        }
      ) {
        const file =
          fileMap.get(
            item.relativePath
          );

        if (!file) {
          throw new Error(
            `ไม่พบไฟล์ ${item.relativePath} ในเครื่อง`
          );
        }

        const res =
          await fetch(
            item.uploadUrl,
            {
              method: "PUT",
              headers: {
                "Content-Type":
                  item.contentType,
              },
              body: file,
            }
          );

        if (!res.ok) {
          throw new Error(
            `อัปโหลด ${item.relativePath} ไม่สำเร็จ (${res.status})`
          );
        }

        completed += 1;

        setHlsUploadProgress(
          Math.min(
            99,
            Math.round(
              (completed /
                uploadFiles.length) *
                100
            )
          )
        );
      }

      for (
        let i = 0;
        i < uploadFiles.length;
        i += CONCURRENCY
      ) {
        const batch =
          uploadFiles.slice(
            i,
            i + CONCURRENCY
          );

await Promise.all(
  batch.map(
    (item: HlsUploadFile) =>
      uploadOne(item)
  )
);
      }

      // ----------------------------------------------
      // 3. แจ้ง Server ว่าอัปโหลดครบแล้ว
      // ----------------------------------------------

      const completeRes =
        await fetch(
          "/api/upload/hls",
          {
            method: "POST",
            headers: {
              "Content-Type":
                "application/json",
            },
            body: JSON.stringify({
              action: "complete",
              uploadId:
                initData.uploadId,
              baseKey:
                initData.baseKey,
            }),
          }
        );

      const completeData =
        await completeRes.json();

      if (!completeRes.ok) {
        throw new Error(
          completeData.error ||
            "อัปโหลด HLS สำเร็จแต่ไม่สามารถยืนยันการอัปโหลดได้"
        );
      }

      if (
        !completeData.masterUrl
      ) {
        throw new Error(
          "ไม่พบ URL ของ master.m3u8"
        );
      }

      // ----------------------------------------------
      // 4. ใส่ master.m3u8 ลง videoUrl อัตโนมัติ
      // ----------------------------------------------

      setForm((prev) => ({
        ...prev,
        videoUrl:
          completeData.masterUrl,
      }));

      setHlsUploadProgress(100);
    } catch (err) {
      console.error(
        "HLS MULTIAUDIO UPLOAD ERROR:",
        err
      );

      setErrorMsg(
        err instanceof Error
          ? err.message
          : "อัปโหลด HLS ไม่สำเร็จ"
      );

      setHlsUploadProgress(0);
    } finally {
      setUploadingHls(false);
    }
  }

  // ==========================
  // Upload Thumbnail → Supabase
  // ==========================

  const [uploadingThumbnail, setUploadingThumbnail] =
    useState(false);

  const thumbnailInputRef =
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
  // Upload Thumbnail → Supabase
  // ==========================

  async function uploadThumbnail(
    file: File
  ) {
    if (!file.type.startsWith("image/")) {
      setErrorMsg(
        "กรุณาเลือกไฟล์รูปภาพเท่านั้น"
      );
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      setErrorMsg(
        "รูป Thumbnail ต้องมีขนาดไม่เกิน 10MB"
      );
      return;
    }

    setUploadingThumbnail(true);
    setErrorMsg("");

    try {
      const formData = new FormData();
      formData.append("file", file);

      const res = await fetch(
        "/api/upload",
        {
          method: "POST",
          body: formData,
        }
      );

      const data = await res.json();

      if (!res.ok || !data.url) {
        throw new Error(
          data.error ||
            "อัปโหลด Thumbnail ไม่สำเร็จ"
        );
      }

      setForm((prev) => ({
        ...prev,
        thumbnail: data.url,
      }));
    } catch (err) {
      console.error(
        "THUMBNAIL UPLOAD ERROR:",
        err
      );

      setErrorMsg(
        err instanceof Error
          ? err.message
          : "อัปโหลด Thumbnail ไม่สำเร็จ"
      );
    } finally {
      setUploadingThumbnail(false);

      if (thumbnailInputRef.current) {
        thumbnailInputRef.current.value = "";
      }
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
  seasonId: ep.seasonId ?? "",
  episodeNumber: String(ep.episodeNumber),
  title: ep.title || "",
  videoUrl: ep.videoUrl,
  thumbnail: ep.thumbnail || "",
  duration: ep.duration
    ? String(ep.duration)
    : "",

  introStart: ep.introStart
    ? String(ep.introStart)
    : "",

  introEnd: ep.introEnd
    ? String(ep.introEnd)
    : "",

  nextEpisodeTime: ep.nextEpisodeTime
    ? String(ep.nextEpisodeTime)
    : "",
  thaiAudioUrl:
    ep.audioTracks?.find(
      (track) => track.language === "THAI"
    )?.url || "",
  japaneseAudioUrl:
    ep.audioTracks?.find(
      (track) => track.language === "JAPANESE"
    )?.url || "",
  thaiSubtitleUrl:
    ep.subtitles?.find(
      (track) => track.language === "THAI"
    )?.url || "",
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

    const introStart = timeToSeconds(
      form.introStart
    );

    const introEnd = timeToSeconds(
      form.introEnd
    );

    const nextEpisodeTime =
      timeToSeconds(
        form.nextEpisodeTime
      );

    if (
      introStart === undefined ||
      introEnd === undefined ||
      nextEpisodeTime === undefined
    ) {
      setErrorMsg(
        "รูปแบบเวลาต้องเป็น MM:SS เช่น 01:30"
      );
      return;
    }

    if (
      introStart !== null &&
      introEnd !== null &&
      introEnd <= introStart
    ) {
      setErrorMsg(
        "เวลา Intro จบต้องมากกว่าเวลา Intro เริ่ม"
      );
      return;
    }

    if (
      introStart !== null &&
      form.duration &&
      introStart >= Number(form.duration)
    ) {
      setErrorMsg(
        "เวลาเริ่ม Intro ต้องน้อยกว่าความยาววิดีโอ"
      );
      return;
    }

    if (
      introEnd !== null &&
      form.duration &&
      introEnd > Number(form.duration)
    ) {
      setErrorMsg(
        "เวลาจบ Intro ต้องไม่เกินความยาววิดีโอ"
      );
      return;
    }

    if (
      nextEpisodeTime !== null &&
      form.duration &&
      nextEpisodeTime >= Number(form.duration)
    ) {
      setErrorMsg(
        "เวลาขึ้นตอนถัดไปต้องน้อยกว่าความยาววิดีโอ"
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

        introStart,
        introEnd,
        nextEpisodeTime,

        audioTracks: [
          ...(form.thaiAudioUrl.trim()
            ? [
                {
                  language: "THAI",
                  url: form.thaiAudioUrl.trim(),
                  label: "พากย์ไทย",
                },
              ]
            : []),
          ...(form.japaneseAudioUrl.trim()
            ? [
                {
                  language: "JAPANESE",
                  url: form.japaneseAudioUrl.trim(),
                  label: "พากย์ญี่ปุ่น",
                },
              ]
            : []),
        ],

        subtitles: [
          ...(form.thaiSubtitleUrl.trim()
            ? [
                {
                  language: "THAI",
                  url: form.thaiSubtitleUrl.trim(),
                  label: "ไทย",
                },
              ]
            : []),
        ],
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
    <div className="min-h-screen bg-[#080914] text-[#e8e6f0]">

      <header className="border-b border-[#232335] px-6 py-5">

        <Link
          href="/admin"
          className="text-xs text-[#9693b8] hover:text-[#e8e6f0]"
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
                border-[#8b5cf6]/40
                bg-[#3a1620]
                px-3
                py-2
                text-sm
                text-[#c4b5fd]
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

              <label className="mb-1 block text-xs text-[#9693b8]">
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
                  bg-[#080914]
                  px-3
                  py-2
                  text-sm
                  focus:outline-none
                  focus:ring-2
                  focus:ring-[#8b5cf6]
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
                  bg-[#8b5cf6]
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

              <label className="mb-1 block text-xs text-[#9693b8]">
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
                  bg-[#080914]
                  px-3
                  py-2
                  text-sm
                  focus:outline-none
                  focus:ring-2
                  focus:ring-[#8b5cf6]
                "
                placeholder="1"
              />

            </div>

            <div>

              <label className="mb-1 block text-xs text-[#9693b8]">
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
                  bg-[#080914]
                  px-3
                  py-2
                  text-sm
                  focus:outline-none
                  focus:ring-2
                  focus:ring-[#8b5cf6]
                "
                placeholder="1440"
              />

            </div>

          </div>

          {/* ==========================
              Skip Intro / Next Episode
          ========================== */}

          <div className="mb-5 rounded-xl border border-[#2a2a3d] bg-[#0f0f18] p-4">
            <h3 className="mb-1 text-sm font-semibold text-white">
              ⏭ ระบบข้าม Intro
            </h3>
            <p className="mb-4 text-xs text-[#9693b8]">
              กำหนดเป็น MM:SS เช่น 01:30 หากไม่ต้องการใช้ ให้เว้นว่างไว้
            </p>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="mb-1 block text-xs text-[#9693b8]">
                  Intro เริ่ม
                </label>
                <input
                  type="text"
                  inputMode="numeric"
                  value={form.introStart ?? ""}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      introStart: e.target.value,
                    })
                  }
                  className="
                    w-full rounded-lg border border-[#2a2a3d]
                    bg-[#080914] px-3 py-2 text-sm
                    focus:outline-none focus:ring-2 focus:ring-[#8b5cf6]
                  "
                  placeholder="01:30"
                />
              </div>

              <div>
                <label className="mb-1 block text-xs text-[#9693b8]">
                  Intro จบ
                </label>
                <input
                  type="text"
                  inputMode="numeric"
                  value={form.introEnd ?? ""}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      introEnd: e.target.value,
                    })
                  }
                  className="
                    w-full rounded-lg border border-[#2a2a3d]
                    bg-[#080914] px-3 py-2 text-sm
                    focus:outline-none focus:ring-2 focus:ring-[#8b5cf6]
                  "
                  placeholder="03:00"
                />
              </div>
            </div>
          </div>

          <div className="mb-5 rounded-xl border border-[#2a2a3d] bg-[#0f0f18] p-4">
            <h3 className="mb-1 text-sm font-semibold text-white">
              ▶ ตอนถัดไป
            </h3>
            <p className="mb-4 text-xs text-[#9693b8]">
              เมื่อถึงเวลานี้จะแสดงตอนถัดไปและเริ่มนับถอยหลัง 5 วินาที
            </p>

            <div>
              <label className="mb-1 block text-xs text-[#9693b8]">
                แสดงตอนถัดไปเมื่อ
              </label>
              <input
                type="text"
                inputMode="numeric"
                value={form.nextEpisodeTime ?? ""}
                onChange={(e) =>
                  setForm({
                    ...form,
                    nextEpisodeTime: e.target.value,
                  })
                }
                className="
                  w-full rounded-lg border border-[#2a2a3d]
                  bg-[#080914] px-3 py-2 text-sm
                  focus:outline-none focus:ring-2 focus:ring-[#8b5cf6]
                "
                placeholder="22:00"
              />
            </div>
          </div>

          {/* ==========================
              Episode Title
          ========================== */}

          <div className="mb-3">

            <label className="mb-1 block text-xs text-[#9693b8]">
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
                bg-[#080914]
                px-3
                py-2
                text-sm
                focus:outline-none
                focus:ring-2
                focus:ring-[#8b5cf6]
              "
              placeholder="จุดเริ่มต้น"
            />

          </div>

          {/* ==========================
              Video Upload
          ========================== */}

          <div className="mb-5">
            <label className="mb-1 block text-xs text-[#9693b8]">
              วิดีโอ
            </label>

            <input
              value={form.videoUrl}
              readOnly
              className="
                w-full
                rounded-lg
                border
                border-[#2a2a3d]
                bg-[#080914]
                px-3
                py-2
                text-sm
              "
              placeholder="เลือก MP4 หรือ HLS Multi-Audio"
            />

            <div className="mt-3 flex flex-wrap gap-2">
              {/* MP4 */}
              <input
                ref={fileInputRef}
                type="file"
                accept="video/mp4"
                className="hidden"
                onChange={(e) => {
                  const file =
                    e.target.files?.[0];

                  if (!file) return;

                  setSelectedVideo(
                    file
                  );

                  setSelectedHlsFiles(
                    []
                  );

                  uploadVideo(file).catch(
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
                  uploadingVideo ||
                  uploadingHls
                }
                className="
                  rounded-lg
                  bg-[#8b5cf6]
                  px-4
                  py-2
                  text-sm
                  font-semibold
                  text-black
                  transition
                  hover:bg-[#a78bfa]
                  disabled:cursor-not-allowed
                  disabled:opacity-60
                "
              >
                {uploadingVideo
                  ? "กำลังอัปโหลด MP4..."
                  : "📹 เลือกไฟล์ MP4"}
              </button>

              {/* HLS folder */}
              <input
                ref={hlsInputRef}
                type="file"
                multiple
                className="hidden"
                // @ts-expect-error webkitdirectory ไม่อยู่ใน React type ปกติ
                webkitdirectory=""
                directory=""
                accept=".m3u8,.ts"
                onChange={(e) => {
                  const files = Array.from(
                    e.target.files || []
                  );

                  if (!files.length) {
                    return;
                  }

                  setSelectedVideo(
                    null
                  );

                  uploadHlsFolder(
                    files
                  ).catch(
                    (err) => {
                      setErrorMsg(
                        err instanceof Error
                          ? err.message
                          : "อัปโหลด HLS ไม่สำเร็จ"
                      );
                    }
                  );
                }}
              />

              <button
                type="button"
                onClick={() =>
                  hlsInputRef.current?.click()
                }
                disabled={
                  uploadingVideo ||
                  uploadingHls
                }
                className="
                  rounded-lg
                  border
                  border-[#8b5cf6]/40
                  bg-[#8b5cf6]/10
                  px-4
                  py-2
                  text-sm
                  font-semibold
                  text-[#c4b5fd]
                  transition
                  hover:bg-[#8b5cf6]/20
                  disabled:cursor-not-allowed
                  disabled:opacity-60
                "
              >
                {uploadingHls
                  ? "กำลังอัปโหลด HLS..."
                  : "🎬 เลือกโฟลเดอร์ HLS"}
              </button>
            </div>

            {/* HLS information */}
            <div className="mt-3 rounded-lg border border-[#2a2a3d] bg-[#0f0f18] p-3 text-xs text-[#9693b8]">
              <p className="font-medium text-white">
                HLS Multi-Audio
              </p>

              <p className="mt-1">
                เลือกโฟลเดอร์ที่มี
                master.m3u8,
                stream-Thai.m3u8,
                stream-Japanese.m3u8
                และไฟล์ .ts ทั้งหมด
              </p>

              <p className="mt-1">
                ระบบจะอัปโหลดตรงจากเครื่องของคุณไป R2
                โดยไม่ส่งไฟล์ทั้งหมดผ่าน Next.js
              </p>
            </div>

            {/* MP4 information */}
            {selectedVideo &&
              !uploadingHls && (
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
                      <p className="text-sm font-medium">
                        {
                          selectedVideo.name
                        }
                      </p>

                      <p className="mt-1 text-xs text-[#9693b8]">
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

                  {uploadingVideo && (
                    <div className="mt-4">
                      <div className="mb-1 flex justify-between text-xs">
                        <span>
                          กำลังอัปโหลด...
                        </span>

                        <span>
                          {uploadProgress}%
                        </span>
                      </div>

                      <div className="h-2 overflow-hidden rounded-full bg-[#222]">
                        <div
                          className="
                            h-full
                            bg-[#8b5cf6]
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

            {/* HLS information / progress */}
            {(uploadingHls ||
              selectedHlsFiles.length > 0) && (
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
                    <p className="text-sm font-medium">
                      HLS Multi-Audio
                    </p>

                    <p className="mt-1 text-xs text-[#9693b8]">
                      {selectedHlsFiles.length} ไฟล์
                    </p>
                  </div>

                  {!uploadingHls &&
                    hlsUploadProgress ===
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
                        ✓ HLS Upload สำเร็จ
                      </span>
                    )}
                </div>

                <div className="mt-4">
                  <div className="mb-1 flex justify-between text-xs">
                    <span>
                      {uploadingHls
                        ? "กำลังอัปโหลด HLS..."
                        : "เสร็จแล้ว"}
                    </span>

                    <span>
                      {hlsUploadProgress}%
                    </span>
                  </div>

                  <div className="h-2 overflow-hidden rounded-full bg-[#222]">
                    <div
                      className="
                        h-full
                        bg-[#8b5cf6]
                        transition-all
                        duration-300
                      "
                      style={{
                        width: `${hlsUploadProgress}%`,
                      }}
                    />
                  </div>
                </div>
              </div>
            )}

            {/* HLS preview */}
            {form.videoUrl &&
              form.videoUrl
                .toLowerCase()
                .includes(".m3u8") && (
              <div className="mt-5 rounded-xl border border-[#2a2a3d] bg-[#0f0f18] p-4">
                <p className="text-xs text-[#9693b8]">
                  HLS Master URL
                </p>

                <p className="mt-1 break-all text-xs text-white/70">
                  {form.videoUrl}
                </p>

                <p className="mt-2 text-xs text-[#6f6c84]">
                  เสียงใน HLS: 🇹🇭 Thai + 🇯🇵 Japanese
                </p>
              </div>
            )}

            {/* MP4 Preview */}
            {form.videoUrl &&
              !form.videoUrl
                .toLowerCase()
                .includes(".m3u8") && (
              <div className="mt-5">
                <label className="mb-2 block text-xs text-[#9693b8]">
                  ตัวอย่างวิดีโอ
                </label>

                <video
                  src={form.videoUrl}
                  controls
                  preload="metadata"
                  className="
                    aspect-video
                    w-full
                    rounded-xl
                    border
                    border-[#232335]
                    bg-black
                  "
                />
              </div>
            )}
          </div>

          {/* ==========================
              Audio / Subtitle
          ========================== */}

          <div className="mb-5 rounded-xl border border-[#2a2a3d] bg-[#0f0f18] p-4">
            <h3 className="mb-1 text-sm font-semibold text-white">
              🔊 เสียงพากย์
            </h3>

            <p className="mb-4 text-xs text-[#9693b8]">
              ใส่ URL ของ Audio Track สำหรับตอนนี้
              หากยังไม่มี สามารถเว้นว่างไว้ก่อนได้
            </p>

            <div className="space-y-3">
              <div>
                <label className="mb-1 block text-xs text-[#9693b8]">
                  🇹🇭 พากย์ไทย
                </label>

                <input
                  type="url"
                  value={form.thaiAudioUrl}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      thaiAudioUrl: e.target.value,
                    })
                  }
                  className="
                    w-full rounded-lg border border-[#2a2a3d]
                    bg-[#080914] px-3 py-2 text-sm
                    focus:outline-none focus:ring-2 focus:ring-[#8b5cf6]
                  "
                  placeholder="https://.../thai.m3u8"
                />
              </div>

              <div>
                <label className="mb-1 block text-xs text-[#9693b8]">
                  🇯🇵 พากย์ญี่ปุ่น
                </label>

                <input
                  type="url"
                  value={form.japaneseAudioUrl}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      japaneseAudioUrl: e.target.value,
                    })
                  }
                  className="
                    w-full rounded-lg border border-[#2a2a3d]
                    bg-[#080914] px-3 py-2 text-sm
                    focus:outline-none focus:ring-2 focus:ring-[#8b5cf6]
                  "
                  placeholder="https://.../japanese.m3u8"
                />
              </div>
            </div>
          </div>

          <div className="mb-5 rounded-xl border border-[#2a2a3d] bg-[#0f0f18] p-4">
            <h3 className="mb-1 text-sm font-semibold text-white">
              💬 คำบรรยาย
            </h3>

            <p className="mb-4 text-xs text-[#9693b8]">
              ตอนนี้รองรับซับไทยก่อน สามารถเว้นว่างไว้ได้
            </p>

            <div>
              <label className="mb-1 block text-xs text-[#9693b8]">
                🇹🇭 ซับไทย
              </label>

              <input
                type="url"
                value={form.thaiSubtitleUrl}
                onChange={(e) =>
                  setForm({
                    ...form,
                    thaiSubtitleUrl: e.target.value,
                  })
                }
                className="
                  w-full rounded-lg border border-[#2a2a3d]
                  bg-[#080914] px-3 py-2 text-sm
                  focus:outline-none focus:ring-2 focus:ring-[#8b5cf6]
                "
                placeholder="https://.../thai.vtt"
              />
            </div>
          </div>

          {/* ==========================
              Thumbnail
          ========================== */}

          <div className="mb-4">
            <label className="mb-1 block text-xs text-[#9693b8]">
              รูปปกตอน (Thumbnail)
            </label>

            <input
              ref={thumbnailInputRef}
              type="file"
              accept="image/png,image/jpeg,image/webp,image/gif"
              className="hidden"
              onChange={(e) => {
                const file =
                  e.target.files?.[0];

                if (!file) return;

                uploadThumbnail(file);
              }}
            />

            <button
              type="button"
              onClick={() =>
                thumbnailInputRef.current?.click()
              }
              disabled={uploadingThumbnail}
              className="
                w-full
                rounded-lg
                bg-[#8b5cf6]
                px-4
                py-2.5
                text-sm
                font-semibold
                text-black
                transition
                hover:bg-[#a78bfa]
                disabled:cursor-not-allowed
                disabled:opacity-60
              "
            >
              {uploadingThumbnail
                ? "กำลังอัปโหลดรูป..."
                : "🖼️ เลือกรูป Thumbnail"}
            </button>

            {form.thumbnail && (
              <div className="mt-3 overflow-hidden rounded-xl border border-[#2a2a3d] bg-[#080914]">
                <img
                  src={form.thumbnail}
                  alt="Thumbnail Preview"
                  className="
                    aspect-video
                    w-full
                    object-cover
                  "
                />

                <div className="flex items-center justify-between gap-3 p-3">
                  <span className="truncate text-xs text-[#9693b8]">
                    อัปโหลดแล้ว
                  </span>

                  <button
                    type="button"
                    onClick={() =>
                      setForm((prev) => ({
                        ...prev,
                        thumbnail: "",
                      }))
                    }
                    className="
                      rounded-lg
                      border
                      border-[#8b5cf6]/30
                      px-3
                      py-1.5
                      text-xs
                      text-[#8b5cf6]
                      hover:bg-[#8b5cf6]/10
                    "
                  >
                    ลบรูป
                  </button>
                </div>
              </div>
            )}

            <p className="mt-2 text-xs text-[#6f6c84]">
              รองรับ PNG, JPG, WEBP และ GIF • สูงสุด 10MB
            </p>
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
                uploadingHls ||
                !selectedSeason
              }
              className="
                flex-1
                rounded-lg
                bg-[#8b5cf6]
                py-2
                text-sm
                font-semibold
                text-[#080914]
                transition
                hover:bg-[#a78bfa]
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
                  text-[#9693b8]
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

          <p className="text-sm text-[#9693b8]">
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
                      text-[#8b5cf6]
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

                    <div className="mt-1 truncate text-xs text-[#9693b8]">
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
                      border-[#8b5cf6]/30
                      px-3
                      py-1.5
                      text-xs
                      text-[#8b5cf6]
                      hover:bg-[#8b5cf6]/10
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