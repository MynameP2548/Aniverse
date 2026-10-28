"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function ForgotPasswordPage() {

  const router = useRouter();

  const [email, setEmail] = useState("");

  const [loading, setLoading] = useState(false);

  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent) {

    e.preventDefault();

    setLoading(true);

    setError("");

    try {

      const res = await fetch("/api/auth/forgot-password", {

        method: "POST",

        headers: {

          "Content-Type": "application/json",

        },

        body: JSON.stringify({

          email,

        }),

      });

      const data = await res.json();

if (!res.ok) {

  setError(data.error ?? "เกิดข้อผิดพลาด");
  return;

}

router.push(
  `/verify-otp?email=${encodeURIComponent(email)}`
);

return;

    } catch {

      setError("ไม่สามารถเชื่อมต่อเซิร์ฟเวอร์ได้");

    } finally {

      setLoading(false);

    }

  }

  return (

    <div className="relative min-h-screen overflow-hidden bg-[#070711] text-white">

      <div className="absolute inset-0">

        <img

          src="/images/login-bg.jpg"

          alt=""

          className="h-full w-full object-cover opacity-20"

        />

        <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-[#070711]/70 to-[#070711]" />

        <div className="absolute -left-24 top-20 h-72 w-72 rounded-full bg-[#8b5cf6]/20 blur-[120px]" />

        <div className="absolute right-0 bottom-0 h-80 w-80 rounded-full bg-violet-500/10 blur-[150px]" />

      </div>

      <div className="relative flex min-h-screen items-center justify-center px-6">

        <form

          onSubmit={handleSubmit}

          className="w-full max-w-md rounded-3xl border border-white/10 bg-[#11111b]/80 backdrop-blur-xl shadow-2xl p-8"

        >

          <div className="mb-8 text-center">

            <h1 className="text-4xl font-black">

              ANI

              <span className="text-[#8b5cf6]">/VERSE</span>

            </h1>

            <div className="mt-6 text-6xl">

              🔒

            </div>

            <h2 className="mt-5 text-2xl font-bold">

              ลืมรหัสผ่าน

            </h2>

            <p className="mt-2 text-sm text-[#9c9ab3]">

              กรอกอีเมลของคุณเพื่อรับรหัส OTP

            </p>

          </div>
                    {error && (
            <div className="mb-5 rounded-xl border border-red-500/30 bg-red-500/10 p-4 text-sm text-red-300">
              {error}
            </div>
          )}

          <div className="mb-6">

            <label className="mb-2 block text-sm text-[#b8b6cb]">
              อีเมล
            </label>

            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              className="w-full rounded-xl border border-[#2a2a3d] bg-[#080914]/80 px-4 py-3 outline-none transition focus:border-[#8b5cf6] focus:ring-2 focus:ring-[#8b5cf6]/30"
            />

          </div>

          <button
            type="submit"
            disabled={loading}
            className="group relative w-full overflow-hidden rounded-xl bg-[#8b5cf6] py-3 font-bold text-[#080914] transition-all duration-300 hover:scale-[1.02] hover:bg-[#a78bfa] disabled:cursor-not-allowed disabled:opacity-50"
          >
            <span className="relative z-10">
              {loading
                ? "กำลังส่งรหัส..."
                : "ส่งรหัสยืนยัน"}
            </span>

            <span className="absolute inset-0 -translate-x-full bg-white/20 transition-transform duration-700 group-hover:translate-x-full" />
          </button>

          <div className="my-8 flex items-center">

            <div className="h-px flex-1 bg-[#2a2a3d]" />

            <span className="px-4 text-xs uppercase tracking-[0.3em] text-[#6d6b81]">
              OR
            </span>

            <div className="h-px flex-1 bg-[#2a2a3d]" />

          </div>

          <Link
            href="/login"
            className="flex h-12 w-full items-center justify-center rounded-xl border border-[#232335] bg-[#080914]/70 text-sm font-semibold text-[#b8b6cb] transition hover:border-[#8b5cf6] hover:text-white"
          >
            ← กลับเข้าสู่ระบบ
          </Link>

          <p className="mt-8 text-center text-xs leading-6 text-[#6d6b81]">
            ระบบจะส่งรหัส OTP ไปยังอีเมลของคุณ
            <br />
            เพื่อใช้ยืนยันตัวตนก่อนตั้งรหัสผ่านใหม่
          </p>
                  </form>
      </div>

      {/* Bottom Glow */}
      <div className="pointer-events-none absolute inset-x-0 bottom-0 h-48 bg-gradient-to-t from-[#8b5cf6]/10 to-transparent" />

    </div>
  );
}