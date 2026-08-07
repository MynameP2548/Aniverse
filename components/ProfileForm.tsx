"use client";

import {
  ChangeEvent,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

import Image from "next/image";
import { useRouter } from "next/navigation";

type Props = {
  currentName: string;
  email: string;
  avatar?: string | null;
  bio?: string | null;
};

export default function ProfileForm({
  currentName,
  email,
  avatar,
  bio,
}: Props) {
  const router = useRouter();

  /* -------------------------------- */
  /* State                            */
  /* -------------------------------- */

  const [name, setName] = useState(currentName);

  const [about, setAbout] = useState(bio ?? "");

  const [avatarUrl, setAvatarUrl] =
    useState<string | null>(avatar ?? null);

  const [preview, setPreview] =
    useState<string | null>(null);

  const [currentPassword, setCurrentPassword] =
    useState("");

  const [newPassword, setNewPassword] =
    useState("");

  const [saving, setSaving] =
    useState(false);

  const [uploading, setUploading] =
    useState(false);

  const [error, setError] =
    useState("");

  const [success, setSuccess] =
    useState("");

  const fileRef =
    useRef<HTMLInputElement>(null);

  /* -------------------------------- */
  /* Avatar                           */
  /* -------------------------------- */

  const initials = useMemo(() => {
    return (
      name
        ?.trim()
        .split(" ")
        .map((v) => v[0])
        .join("")
        .substring(0, 2)
        .toUpperCase() || "U"
    );
  }, [name]);

  const passwordStrength =
    newPassword.length === 0
      ? 0
      : newPassword.length < 6
      ? 25
      : newPassword.length < 10
      ? 60
      : 100;

  useEffect(() => {
    return () => {
      if (preview) {
        URL.revokeObjectURL(preview);
      }
    };
  }, [preview]);

  /* -------------------------------- */
  /* Upload Avatar                    */
  /* -------------------------------- */

  async function uploadAvatar(
    e: ChangeEvent<HTMLInputElement>
  ) {
    const file =
      e.target.files?.[0];

    if (!file) return;

    if (preview) {
      URL.revokeObjectURL(preview);
    }

    setPreview(
      URL.createObjectURL(file)
    );

    const formData =
      new FormData();

    formData.append(
      "file",
      file
    );

    setUploading(true);

    setError("");

    try {
      const res =
        await fetch(
          "/api/profile/avatar",
          {
            method: "POST",
            body: formData,
          }
        );

      const data =
        await res.json();

      if (!res.ok) {
        throw new Error(
          data.error ??
            "Upload failed"
        );
      }

      setAvatarUrl(
        data.avatar
      );

      setSuccess(
        "อัปโหลดรูปโปรไฟล์สำเร็จ"
      );

      router.refresh();
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Upload failed"
      );
    } finally {
      setUploading(false);
    }
  }

  /* -------------------------------- */
  /* Save Profile                     */
  /* -------------------------------- */

  async function handleSubmit(
    e: React.FormEvent
  ) {
    e.preventDefault();

    setSaving(true);

    setError("");

    setSuccess("");
        try {
      const res = await fetch("/api/profile", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name,
          bio: about,
          currentPassword:
            currentPassword || undefined,
          newPassword:
            newPassword || undefined,
        }),
      });

      const data = await res.json();

      console.log("STATUS:", res.status);
console.log("RESPONSE:", data);

      if (!res.ok) {
        throw new Error(
          data.error ??
            "ไม่สามารถบันทึกข้อมูลได้"
        );
      }

      setSuccess(
        "บันทึกข้อมูลเรียบร้อยแล้ว"
      );

      setCurrentPassword("");

      setNewPassword("");

      router.refresh();
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "เกิดข้อผิดพลาด"
      );
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="space-y-8">

      {/* ================= HERO ================= */}

      <div className="overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-br from-[#171723] via-[#13131d] to-[#0b0b12] shadow-2xl">

        <div className="h-36 bg-gradient-to-r from-[#ff5d73] via-pink-500 to-fuchsia-500" />

        <div className="-mt-16 flex flex-col items-center px-8 pb-8">

          <div className="relative">

            <div className="flex h-32 w-32 items-center justify-center overflow-hidden rounded-full border-4 border-[#11111b] bg-[#1b1b28] shadow-2xl">

              {preview ? (

                <Image
                  src={preview}
                  alt="Preview"
                  fill
                  className="object-cover"
                  unoptimized
                />

              ) : avatarUrl ? (

                <Image
                  src={avatarUrl}
                  alt="Avatar"
                  fill
                  className="object-cover"
                  unoptimized
                />

              ) : (

                <span className="text-5xl font-black text-white">
                  {initials}
                </span>

              )}

            </div>

            <input
              ref={fileRef}
              type="file"
              hidden
              accept="image/png,image/jpeg,image/webp"
              onChange={uploadAvatar}
            />

            <button
              type="button"
              disabled={uploading}
              onClick={() =>
                fileRef.current?.click()
              }
              className="absolute bottom-2 right-2 flex h-10 w-10 items-center justify-center rounded-full bg-[#ff5d73] shadow-lg transition hover:scale-110 disabled:opacity-50"
            >
              {uploading ? "..." : "📷"}
            </button>

          </div>

          <h2 className="mt-6 text-3xl font-black">

            {name}

          </h2>

          <p className="mt-2 text-[#9d9ab4]">

            {email}

          </p>

          <div className="mt-4 rounded-full border border-[#ff5d73]/30 bg-[#ff5d73]/10 px-5 py-1 text-xs font-bold uppercase tracking-[0.2em] text-[#ff91a2]">

            Member

          </div>

          <div className="mt-8 grid w-full gap-4 sm:grid-cols-3">

            <div className="rounded-2xl bg-[#0b0b12]/80 p-5">

              <div className="text-3xl font-black text-[#ff5d73]">
                0
              </div>

              <div className="mt-2 text-sm text-[#8a87a3]">
                Favorites
              </div>

            </div>

            <div className="rounded-2xl bg-[#0b0b12]/80 p-5">

              <div className="text-3xl font-black text-[#ff5d73]">
                0
              </div>

              <div className="mt-2 text-sm text-[#8a87a3]">
                Episodes
              </div>

            </div>

            <div className="rounded-2xl bg-[#0b0b12]/80 p-5">

              <div className="text-3xl font-black text-[#ff5d73]">
                0
              </div>

              <div className="mt-2 text-sm text-[#8a87a3]">
                Reviews
              </div>

            </div>

          </div>

        </div>

      </div>

      <form
        onSubmit={handleSubmit}
        className="space-y-6"
      >
                {/* ================= Alerts ================= */}

        {error && (
          <div className="rounded-2xl border border-red-500/30 bg-red-500/10 p-4 text-sm text-red-300">
            {error}
          </div>
        )}

        {success && (
          <div className="rounded-2xl border border-emerald-500/30 bg-emerald-500/10 p-4 text-sm text-emerald-300">
            {success}
          </div>
        )}

        {/* ================= Personal Information ================= */}

        <div className="rounded-3xl border border-white/10 bg-[#11111b] p-8 shadow-xl">

          <div className="mb-8">

            <h3 className="text-2xl font-bold text-white">
              👤 ข้อมูลส่วนตัว
            </h3>

            <p className="mt-2 text-sm text-[#8a87a3]">
              แก้ไขข้อมูลพื้นฐานของบัญชีผู้ใช้
            </p>

          </div>

          <div className="grid gap-6">

            {/* Name */}

            <div>

              <label className="mb-2 block text-sm font-medium text-[#b8b6cb]">
                ชื่อผู้ใช้
              </label>

              <input
                value={name}
                onChange={(e) =>
                  setName(e.target.value)
                }
                placeholder="ชื่อผู้ใช้"
                className="w-full rounded-2xl border border-[#2a2a3d] bg-[#0b0b12] px-5 py-3 text-white outline-none transition-all duration-300 focus:border-[#ff5d73] focus:ring-2 focus:ring-[#ff5d73]/30"
              />

            </div>

            {/* Email */}

            <div>

              <label className="mb-2 block text-sm font-medium text-[#b8b6cb]">
                อีเมล
              </label>

              <input
                value={email}
                disabled
                className="w-full cursor-not-allowed rounded-2xl border border-[#2a2a3d] bg-[#09090f] px-5 py-3 text-[#7d7b92]"
              />

              <p className="mt-2 text-xs text-[#6b697e]">
                อีเมลไม่สามารถแก้ไขได้
              </p>

            </div>

            {/* Bio */}

            <div>

              <label className="mb-2 block text-sm font-medium text-[#b8b6cb]">
                Bio
              </label>

              <textarea
                rows={5}
                value={about}
                onChange={(e) =>
                  setAbout(e.target.value)
                }
                maxLength={300}
                placeholder="แนะนำตัว เช่น ชอบดูอนิเมะแนว Fantasy, Isekai, Romance..."
                className="w-full resize-none rounded-2xl border border-[#2a2a3d] bg-[#0b0b12] px-5 py-4 text-white outline-none transition-all duration-300 focus:border-[#ff5d73] focus:ring-2 focus:ring-[#ff5d73]/30"
              />

              <div className="mt-2 flex justify-between text-xs">

                <span className="text-[#6d6b81]">
                  Bio ของคุณจะแสดงบนหน้าโปรไฟล์
                </span>

                <span className="text-[#8a87a3]">
                  {about.length}/300
                </span>

              </div>

            </div>

          </div>

        </div>

        {/* ================= Account Summary ================= */}

        <div className="grid gap-5 md:grid-cols-2">

          <div className="rounded-3xl border border-white/10 bg-[#11111b] p-6">

            <div className="text-sm text-[#8a87a3]">
              สถานะบัญชี
            </div>

            <div className="mt-3 text-2xl font-bold text-white">
              MEMBER
            </div>

            <div className="mt-2 text-sm text-[#6d6b81]">
              บัญชีของคุณพร้อมใช้งาน
            </div>

          </div>

          <div className="rounded-3xl border border-white/10 bg-[#11111b] p-6">

            <div className="text-sm text-[#8a87a3]">
              รูปโปรไฟล์
            </div>

            <div className="mt-3 text-2xl font-bold text-white">
              {avatarUrl ? "ตั้งค่าแล้ว" : "ยังไม่มี"}
            </div>

            <div className="mt-2 text-sm text-[#6d6b81]">
              รองรับ JPG, PNG และ WEBP
            </div>

          </div>

        </div>
                {/* ================= Security ================= */}

        <div className="rounded-3xl border border-white/10 bg-[#11111b] p-8 shadow-xl">

          <div className="mb-8">

            <h3 className="text-2xl font-bold text-white">
              🔐 ความปลอดภัย
            </h3>

            <p className="mt-2 text-sm text-[#8a87a3]">
              เปลี่ยนรหัสผ่านเพื่อเพิ่มความปลอดภัยให้บัญชีของคุณ
            </p>

          </div>

          <div className="space-y-6">

            {/* Current Password */}

            <div>

              <label className="mb-2 block text-sm font-medium text-[#b8b6cb]">
                รหัสผ่านปัจจุบัน
              </label>

              <input
                type="password"
                value={currentPassword}
                onChange={(e) =>
                  setCurrentPassword(e.target.value)
                }
                placeholder="กรอกรหัสผ่านปัจจุบัน"
                className="w-full rounded-2xl border border-[#2a2a3d] bg-[#0b0b12] px-5 py-3 text-white outline-none transition-all duration-300 focus:border-[#ff5d73] focus:ring-2 focus:ring-[#ff5d73]/30"
              />

            </div>

            {/* New Password */}

            <div>

              <label className="mb-2 block text-sm font-medium text-[#b8b6cb]">
                รหัสผ่านใหม่
              </label>

              <input
                type="password"
                value={newPassword}
                onChange={(e) =>
                  setNewPassword(e.target.value)
                }
                placeholder="อย่างน้อย 6 ตัวอักษร"
                className="w-full rounded-2xl border border-[#2a2a3d] bg-[#0b0b12] px-5 py-3 text-white outline-none transition-all duration-300 focus:border-[#ff5d73] focus:ring-2 focus:ring-[#ff5d73]/30"
              />

            </div>

            {/* Password Strength */}

            <div>

              <div className="mb-3 flex items-center justify-between">

                <span className="text-sm text-[#8a87a3]">
                  ความแข็งแรงของรหัสผ่าน
                </span>

                <span
                  className={`text-sm font-bold ${
                    passwordStrength === 0
                      ? "text-[#8a87a3]"
                      : passwordStrength < 50
                      ? "text-red-400"
                      : passwordStrength < 100
                      ? "text-yellow-400"
                      : "text-green-400"
                  }`}
                >
                  {passwordStrength === 0
                    ? "-"
                    : passwordStrength < 50
                    ? "อ่อน"
                    : passwordStrength < 100
                    ? "ปานกลาง"
                    : "แข็งแรง"}
                </span>

              </div>

              <div className="h-3 overflow-hidden rounded-full bg-[#1c1c28]">

                <div
                  className={`h-full transition-all duration-500 ${
                    passwordStrength < 50
                      ? "bg-red-500"
                      : passwordStrength < 100
                      ? "bg-yellow-400"
                      : "bg-green-500"
                  }`}
                  style={{
                    width: `${passwordStrength}%`,
                  }}
                />

              </div>

              <div className="mt-3 text-xs text-[#6d6b81]">

                ใช้ตัวอักษรพิมพ์ใหญ่ พิมพ์เล็ก ตัวเลข และสัญลักษณ์
                เพื่อให้รหัสผ่านปลอดภัยมากขึ้น

              </div>

            </div>

            {/* Security Tips */}

            <div className="rounded-2xl border border-cyan-500/20 bg-cyan-500/5 p-5">

              <div className="font-semibold text-cyan-300">
                💡 คำแนะนำ
              </div>

              <ul className="mt-3 space-y-2 text-sm text-[#b8b6cb]">

                <li>• ใช้รหัสผ่านอย่างน้อย 8 ตัวอักษร</li>

                <li>• ไม่ควรใช้ชื่อหรือวันเกิด</li>

                <li>• เปลี่ยนรหัสผ่านเป็นระยะเพื่อความปลอดภัย</li>

              </ul>

            </div>

          </div>

        </div>
                {/* ================= Statistics ================= */}

        <div className="grid gap-6 lg:grid-cols-3">

          {/* Member */}

          <div className="rounded-3xl border border-white/10 bg-[#11111b] p-6 shadow-xl">

            <div className="text-sm text-[#8a87a3]">
              สมาชิกตั้งแต่
            </div>

            <div className="mt-4 text-3xl font-black text-white">
              2026
            </div>

            <p className="mt-3 text-sm text-[#6d6b81]">
              ขอบคุณที่ร่วมเป็นส่วนหนึ่งของ Aniverse
            </p>

          </div>

          {/* Favorites */}

          <div className="rounded-3xl border border-white/10 bg-[#11111b] p-6 shadow-xl">

            <div className="flex items-center justify-between">

              <span className="text-sm text-[#8a87a3]">
                ❤️ Favorites
              </span>

              <span className="rounded-full bg-[#ff5d73]/10 px-3 py-1 text-xs font-semibold text-[#ff5d73]">
                Anime
              </span>

            </div>

            <div className="mt-4 text-4xl font-black text-[#ff5d73]">
              0
            </div>

            <div className="mt-3 h-2 overflow-hidden rounded-full bg-[#1d1d2b]">

              <div className="h-full w-0 rounded-full bg-[#ff5d73]" />

            </div>

          </div>

          {/* Reviews */}

          <div className="rounded-3xl border border-white/10 bg-[#11111b] p-6 shadow-xl">

            <div className="flex items-center justify-between">

              <span className="text-sm text-[#8a87a3]">
                ⭐ Reviews
              </span>

              <span className="rounded-full bg-yellow-500/10 px-3 py-1 text-xs font-semibold text-yellow-400">
                Community
              </span>

            </div>

            <div className="mt-4 text-4xl font-black text-yellow-400">
              0
            </div>

            <div className="mt-3 h-2 overflow-hidden rounded-full bg-[#1d1d2b]">

              <div className="h-full w-0 rounded-full bg-yellow-400" />

            </div>

          </div>

        </div>

        {/* ================= Activity ================= */}

        <div className="rounded-3xl border border-white/10 bg-[#11111b] p-8 shadow-xl">

          <div className="flex items-center justify-between">

            <div>

              <h3 className="text-2xl font-bold text-white">
                📈 กิจกรรม
              </h3>

              <p className="mt-2 text-sm text-[#8a87a3]">
                สถิติการใช้งานบัญชีของคุณ
              </p>

            </div>

            <div className="rounded-full bg-emerald-500/10 px-4 py-2 text-xs font-bold text-emerald-400">

              ACTIVE

            </div>

          </div>

          <div className="mt-8 grid gap-5 md:grid-cols-2 xl:grid-cols-4">

            <div className="rounded-2xl bg-[#0b0b12] p-5">

              <div className="text-3xl font-black text-[#ff5d73]">
                0
              </div>

              <div className="mt-2 text-sm text-[#8a87a3]">
                Anime ที่ดู
              </div>

            </div>

            <div className="rounded-2xl bg-[#0b0b12] p-5">

              <div className="text-3xl font-black text-cyan-400">
                0
              </div>

              <div className="mt-2 text-sm text-[#8a87a3]">
                ชั่วโมงรับชม
              </div>

            </div>

            <div className="rounded-2xl bg-[#0b0b12] p-5">

              <div className="text-3xl font-black text-yellow-400">
                0
              </div>

              <div className="mt-2 text-sm text-[#8a87a3]">
                รีวิวทั้งหมด
              </div>

            </div>

            <div className="rounded-2xl bg-[#0b0b12] p-5">

              <div className="text-3xl font-black text-green-400">
                100%
              </div>

              <div className="mt-2 text-sm text-[#8a87a3]">
                Account Health
              </div>

            </div>

          </div>

        </div>
                {/* ================= Actions ================= */}

        <div className="rounded-3xl border border-white/10 bg-[#11111b] p-8 shadow-xl">

          <div className="flex flex-col gap-4 sm:flex-row sm:justify-end">

            <button
              type="button"
              onClick={() => {
                setName(currentName);
                setAbout(bio ?? "");
                setCurrentPassword("");
                setNewPassword("");
                setError("");
                setSuccess("");
              }}
              className="rounded-2xl border border-[#2a2a3d] bg-[#0b0b12] px-8 py-3 font-semibold text-[#b8b6cb] transition-all duration-300 hover:border-[#ff5d73] hover:text-white"
            >
              รีเซ็ต
            </button>

            <button
              type="submit"
              disabled={saving}
              className="group relative overflow-hidden rounded-2xl bg-[#ff5d73] px-10 py-3 font-bold text-[#0b0b12] transition-all duration-300 hover:scale-[1.02] hover:bg-[#ff738a] disabled:cursor-not-allowed disabled:opacity-50"
            >
              <span className="relative z-10 flex items-center gap-2">

                {saving && (

                  <svg
                    className="h-5 w-5 animate-spin"
                    viewBox="0 0 24 24"
                    fill="none"
                  >
                    <circle
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                      opacity=".2"
                    />

                    <path
                      d="M22 12A10 10 0 0012 2"
                      stroke="currentColor"
                      strokeWidth="4"
                      strokeLinecap="round"
                    />

                  </svg>

                )}

                {saving
                  ? "กำลังบันทึก..."
                  : "💾 บันทึกการเปลี่ยนแปลง"}

              </span>

              <span className="absolute inset-0 -translate-x-full bg-white/20 transition-transform duration-700 group-hover:translate-x-full" />

            </button>

          </div>

        </div>

      </form>

      {/* Footer */}

      <div className="pb-10 text-center">

        <p className="text-sm text-[#6d6b81]">

          Aniverse Profile v3

        </p>

        <p className="mt-2 text-xs text-[#55536a]">

          Manage your profile, avatar and security in one place.

        </p>

      </div>

    </div>
  );
}