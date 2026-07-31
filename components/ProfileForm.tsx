"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

type Props = {
  currentName: string;
  email: string;
};

export default function ProfileForm({ currentName, email }: Props) {
  const router = useRouter();
  const [name, setName] = useState(currentName);
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [saving, setSaving] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setSuccess("");
    setSaving(true);

    try {
      const res = await fetch("/api/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          currentPassword,
          newPassword: newPassword || undefined,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "อัปเดตไม่สำเร็จ");

      setSuccess("บันทึกข้อมูลสำเร็จ");
      setCurrentPassword("");
      setNewPassword("");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "เกิดข้อผิดพลาด");
    } finally {
      setSaving(false);
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="bg-[#131320] border border-[#232335] rounded-xl p-5"
    >
      {error && (
        <div className="bg-[#3a1620] border border-[#ff5d73]/40 text-[#ff9aa8] text-sm rounded-lg px-3 py-2 mb-4">
          {error}
        </div>
      )}
      {success && (
        <div className="bg-[#1e3a2e] border border-[#5ee6a0]/40 text-[#5ee6a0] text-sm rounded-lg px-3 py-2 mb-4">
          {success}
        </div>
      )}

      <div className="mb-3">
        <label className="text-xs text-[#8a87a3] block mb-1">อีเมล</label>
        <input
          value={email}
          disabled
          className="w-full bg-[#0b0b12] border border-[#2a2a3d] rounded-lg px-3 py-2 text-sm text-[#5a5770] cursor-not-allowed"
        />
      </div>

      <div className="mb-4">
        <label className="text-xs text-[#8a87a3] block mb-1">ชื่อ</label>
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="w-full bg-[#0b0b12] border border-[#2a2a3d] rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#ff5d73]"
        />
      </div>

      <hr className="border-[#232335] mb-4" />

      <div className="mb-3">
        <label className="text-xs text-[#8a87a3] block mb-1">รหัสผ่านปัจจุบัน *</label>
        <input
          type="password"
          required
          value={currentPassword}
          onChange={(e) => setCurrentPassword(e.target.value)}
          className="w-full bg-[#0b0b12] border border-[#2a2a3d] rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#ff5d73]"
          placeholder="กรอกเพื่อยืนยันตัวตน"
        />
      </div>

      <div className="mb-5">
        <label className="text-xs text-[#8a87a3] block mb-1">
          รหัสผ่านใหม่ (เว้นว่างถ้าไม่เปลี่ยน)
        </label>
        <input
          type="password"
          value={newPassword}
          onChange={(e) => setNewPassword(e.target.value)}
          minLength={6}
          className="w-full bg-[#0b0b12] border border-[#2a2a3d] rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#ff5d73]"
          placeholder="อย่างน้อย 6 ตัวอักษร"
        />
      </div>

      <button
        type="submit"
        disabled={saving}
        className="w-full bg-[#ff5d73] hover:bg-[#ff738a] transition text-[#0b0b12] font-semibold rounded-lg py-2 text-sm disabled:opacity-50"
      >
        {saving ? "กำลังบันทึก..." : "บันทึกการเปลี่ยนแปลง"}
      </button>
    </form>
  );
}
