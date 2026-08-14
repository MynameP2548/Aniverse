"use client";

import type { MutableRefObject, RefObject } from "react";
import { useEffect } from "react";
import Hls from "hls.js";

type AudioLanguage =
  | "THAI"
  | "JAPANESE";

export type AudioTrackInfo = {
  id: string;
  language: AudioLanguage;
  label: string;
};

export type SubtitleTrackInfo = {
  id: string;
  language: "THAI";
  label: string;
};

type Props = {
  src: string;
  poster?: string;
  autoPlay?: boolean;

  videoRef: RefObject<
    HTMLVideoElement | null
  >;

  hlsRef: MutableRefObject<
    Hls | null
  >;

  selectedAudioLanguage?: AudioLanguage | null;

  selectedSubtitle?: string;

  onAudioTracksChange?: (
    tracks: AudioTrackInfo[]
  ) => void;

  onSubtitleTracksChange?: (
    tracks: SubtitleTrackInfo[]
  ) => void;
};

function isHlsSource(src: string) {
  try {
    const url = new URL(src);

    return (
      url.pathname.endsWith(".m3u8") ||
      (
        url.pathname.includes("/api/video/") &&
        url.pathname.endsWith("/hls")
      )
    );
  } catch {
    return (
      src.endsWith(".m3u8") ||
      (
        src.includes("/api/video/") &&
        src.includes("/hls")
      )
    );
  }
}

function getAudioTracks(
  hls: Hls
): AudioTrackInfo[] {
  return hls.audioTracks
    .map(
      (
        track,
        index
      ): AudioTrackInfo | null => {
        const lang =
          String(
            track.lang ?? ""
          ).toLowerCase();

        const name =
          String(
            track.name ?? ""
          ).toLowerCase();

        let language:
          | AudioLanguage
          | null = null;

        if (
          lang === "th" ||
          lang === "tha" ||
          lang.startsWith("th-") ||
          name.includes("thai") ||
          name.includes("ไทย")
        ) {
          language = "THAI";
        } else if (
          lang === "ja" ||
          lang === "jpn" ||
          lang.startsWith("ja-") ||
          name.includes("japanese") ||
          name.includes("日本語") ||
          name.includes("ญี่ปุ่น")
        ) {
          language = "JAPANESE";
        }

        if (!language) {
          return null;
        }

        return {
          id: language,
          language,
          label:
            language === "THAI"
              ? "🇹🇭 พากย์ไทย"
              : "🇯🇵 พากย์ญี่ปุ่น",
        };
      }
    )
    // จุดสำคัญ: ตัด null ออกพร้อมบอก TypeScript ว่าหลังจากนี้
    // เหลือ AudioTrackInfo[] เท่านั้น
    .filter(
      (
        track
      ): track is AudioTrackInfo =>
        track !== null
    );
}

function getSubtitleTracks(
  hls: Hls
): SubtitleTrackInfo[] {
  return hls.subtitleTracks
    .map(
      (
        track
      ): SubtitleTrackInfo | null => {
        const lang =
          String(
            track.lang ?? ""
          ).toLowerCase();

        const name =
          String(
            track.name ?? ""
          ).toLowerCase();

        if (
          lang === "th" ||
          lang === "tha" ||
          lang.startsWith("th-") ||
          name.includes("thai") ||
          name.includes("ไทย")
        ) {
          return {
            id: "THAI",
            language: "THAI",
            label: "🇹🇭 ภาษาไทย",
          };
        }

        return null;
      }
    )
    .filter(
      (
        track
      ): track is SubtitleTrackInfo =>
        track !== null
    );
}

function selectAudioTrack(
  hls: Hls,
  language:
    | AudioLanguage
    | null
    | undefined
) {
  if (!language) {
    return;
  }

  const target =
    language === "THAI"
      ? ["th", "tha"]
      : ["ja", "jpn"];

  const index =
    hls.audioTracks.findIndex(
      (track) => {
        const lang =
          String(
            track.lang ?? ""
          ).toLowerCase();

        return (
          target.includes(lang) ||
          (language === "THAI" &&
            (
              lang.startsWith("th-") ||
              String(
                track.name ?? ""
              )
                .toLowerCase()
                .includes("thai") ||
              String(
                track.name ?? ""
              ).includes("ไทย")
            )) ||
          (language ===
            "JAPANESE" &&
            (
              lang.startsWith("ja-") ||
              String(
                track.name ?? ""
              )
                .toLowerCase()
                .includes("japanese") ||
              String(
                track.name ?? ""
              ).includes("日本語") ||
              String(
                track.name ?? ""
              ).includes("ญี่ปุ่น")
            ))
        );
      }
    );

  if (index >= 0) {
    hls.audioTrack = index;
  }
}

function selectSubtitleTrack(
  hls: Hls,
  selectedSubtitle?: string
) {
  if (
    !selectedSubtitle ||
    selectedSubtitle === "off"
  ) {
    hls.subtitleTrack = -1;
    return;
  }

  const index =
    hls.subtitleTracks.findIndex(
      (track) => {
        const lang =
          String(
            track.lang ?? ""
          ).toLowerCase();

        return (
          lang === "th" ||
          lang === "tha" ||
          lang.startsWith("th-") ||
          String(
            track.name ?? ""
          )
            .toLowerCase()
            .includes("thai") ||
          String(
            track.name ?? ""
          ).includes("ไทย")
        );
      }
    );

  if (index >= 0) {
    hls.subtitleTrack = index;
  }
}

export default function Video({
  src,
  poster,
  autoPlay = true,
  videoRef,
  hlsRef,
  selectedAudioLanguage,
  selectedSubtitle = "off",
  onAudioTracksChange,
  onSubtitleTracksChange,
}: Props) {
  // ==================================================
  // สร้าง HLS instance ใหม่เฉพาะเมื่อ src เปลี่ยน
  // หรือ callback ที่ Player ให้มาเปลี่ยนจริง ๆ
  // ==================================================

  useEffect(() => {
    const video =
      videoRef.current;

    if (!video) {
      return;
    }

    // ทำลาย HLS เก่า
    if (hlsRef.current) {
      hlsRef.current.destroy();
      hlsRef.current = null;
    }

    video.removeAttribute("src");
    video.load();

    const hlsSource =
      isHlsSource(src);

    // ==================================================
    // HLS.js
    // ==================================================

    if (
      hlsSource &&
      Hls.isSupported()
    ) {
      const hls = new Hls({
        enableWorker: true,
        lowLatencyMode: false,
      });

      hlsRef.current = hls;

      hls.on(
        Hls.Events.MANIFEST_PARSED,
        () => {
          const audioTracks =
            getAudioTracks(hls);

          const subtitleTracks =
            getSubtitleTracks(hls);

          onAudioTracksChange?.(
            audioTracks
          );

          onSubtitleTracksChange?.(
            subtitleTracks
          );

          // เลือกค่าเริ่มต้น
          selectAudioTrack(
            hls,
            selectedAudioLanguage
          );

          if (
            selectedSubtitle === "off" ||
            !selectedSubtitle
          ) {
            hls.subtitleTrack = -1;
          } else {
            selectSubtitleTrack(
              hls,
              selectedSubtitle
            );
          }

          if (autoPlay) {
            video
              .play()
              .catch(() => {});
          }
        }
      );

      hls.on(
        Hls.Events.AUDIO_TRACKS_UPDATED,
        () => {
          const tracks =
            getAudioTracks(hls);

          onAudioTracksChange?.(
            tracks
          );

          selectAudioTrack(
            hls,
            selectedAudioLanguage
          );
        }
      );

      hls.on(
        Hls.Events.SUBTITLE_TRACKS_UPDATED,
        () => {
          const tracks =
            getSubtitleTracks(hls);

          onSubtitleTracksChange?.(
            tracks
          );

          selectSubtitleTrack(
            hls,
            selectedSubtitle
          );
        }
      );

      hls.on(
        Hls.Events.ERROR,
        (
          _event,
          data
        ) => {
          if (!data?.fatal) {
            return;
          }

          console.error(
            "HLS ERROR:",
            {
              type: data.type,
              details:
                data.details,
              fatal: data.fatal,
              response:
                data.response,
              reason:
                data.reason,
              url: data.url,
            }
          );

          // ไม่ทำ recovery อัตโนมัติเอง
          // เพราะ fatal error ที่เกิดจาก playlist/subtitle
          // ควรปล่อยให้ Player แสดง error ตามจริง
        }
      );

      hls.loadSource(src);
      hls.attachMedia(video);

      return () => {
        hls.destroy();

        if (
          hlsRef.current === hls
        ) {
          hlsRef.current = null;
        }
      };
    }

    // ==================================================
    // Native HLS เช่น Safari
    // ==================================================

    if (
      hlsSource &&
      video.canPlayType(
        "application/vnd.apple.mpegurl"
      )
    ) {
      video.src = src;

      if (autoPlay) {
        video
          .play()
          .catch(() => {});
      }

      return () => {
        video.removeAttribute(
          "src"
        );
        video.load();
      };
    }

    // ==================================================
    // MP4
    // ==================================================

    video.src = src;

    if (autoPlay) {
      video
        .play()
        .catch(() => {});
    }

    return () => {
      video.removeAttribute(
        "src"
      );
      video.load();
    };
  }, [
    src,
    autoPlay,
    videoRef,
    hlsRef,
    onAudioTracksChange,
    onSubtitleTracksChange,
  ]);

  // ==================================================
  // เปลี่ยน Audio โดยไม่สร้าง HLS ใหม่
  // ==================================================

  useEffect(() => {
    const hls =
      hlsRef.current;

    if (!hls) {
      return;
    }

    selectAudioTrack(
      hls,
      selectedAudioLanguage
    );
  }, [
    selectedAudioLanguage,
    hlsRef,
  ]);

  // ==================================================
  // เปลี่ยน Subtitle โดยไม่สร้าง HLS ใหม่
  // ==================================================

  useEffect(() => {
    const hls =
      hlsRef.current;

    if (!hls) {
      return;
    }

    selectSubtitleTrack(
      hls,
      selectedSubtitle
    );
  }, [
    selectedSubtitle,
    hlsRef,
  ]);

  return (
    <video
      ref={videoRef}
      poster={poster}
      playsInline
      preload="metadata"
      controls={false}
      className="
        h-full
        w-full
        select-none
        object-contain
        bg-black
      "
    />
  );
}