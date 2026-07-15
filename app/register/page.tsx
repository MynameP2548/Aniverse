"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function RegisterPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "สมัครสมาชิกไม่สำเร็จ");

      router.push("/login");
    } catch (err) {
      setError(err instanceof Error ? err.message : "เกิดข้อผิดพลาด");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-[#0b0b12] text-[#e8e6f0] flex items-center justify-center px-6">
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-sm bg-[#131320] border border-[#232335] rounded-xl p-6"
      >
        <div className="flex items-center gap-0.5 mb-6">
          <span className="text-xl font-black tracking-tight">ANI</span>
          <span className="text-xl font-black tracking-tight text-[#ff5d73]">/VERSE</span>
        </div>

        <h1 className="text-lg font-bold mb-1">สมัครสมาชิก</h1>
        <p className="text-xs text-[#8a87a3] mb-5">
          บัญชีใหม่จะเป็นสิทธิ์ผู้ใช้ทั่วไป (USER)
        </p>

        {error && (
          <div className="bg-[#3a1620] border border-[#ff5d73]/40 text-[#ff9aa8] text-sm rounded-lg px-3 py-2 mb-4">
            {error}
          </div>
        )}

        <div className="mb-3">
          <label className="text-xs text-[#8a87a3] block mb-1">ชื่อ</label>
          <input
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full bg-[#0b0b12] border border-[#2a2a3d] rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#ff5d73]"
          />
        </div>

        <div className="mb-3">
          <label className="text-xs text-[#8a87a3] block mb-1">อีเมล</label>
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full bg-[#0b0b12] border border-[#2a2a3d] rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#ff5d73]"
          />
        </div>

        <div className="mb-5">
          <label className="text-xs text-[#8a87a3] block mb-1">รหัสผ่าน</label>
          <input
            type="password"
            required
            minLength={6}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full bg-[#0b0b12] border border-[#2a2a3d] rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#ff5d73]"
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-[#ff5d73] hover:bg-[#ff738a] transition text-[#0b0b12] font-semibold rounded-lg py-2 text-sm disabled:opacity-50"
        >
          {loading ? "กำลังสมัคร..." : "สมัครสมาชิก"}
        </button>

        <p className="text-xs text-[#5a5770] text-center mt-4">
          มีบัญชีอยู่แล้ว?{" "}
          <Link href="/login" className="text-[#ff5d73] hover:underline">
            เข้าสู่ระบบ
          </Link>
        </p>
      </form>
    </div>
  );
}
