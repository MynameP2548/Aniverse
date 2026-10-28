"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

import { useSearchParams } from "next/navigation";

export default function ResetPasswordPage() {

  const router = useRouter();

  const searchParams = useSearchParams();

  const token = searchParams.get("token");


  const [password, setPassword] = useState("");

  const [confirmPassword, setConfirmPassword] = useState("");

  const [loading, setLoading] = useState(false);

  const [error, setError] = useState("");

  const [success, setSuccess] = useState("");

  async function handleSubmit(
    e: React.FormEvent
  ) {

    e.preventDefault();

    setError("");

    setSuccess("");

    if (password.length < 6) {

      setError("รหัสผ่านต้องมีอย่างน้อย 6 ตัวอักษร");

      return;

    }

    if (password !== confirmPassword) {

      setError("รหัสผ่านไม่ตรงกัน");

      return;

    }

if (!token) {
  setError("ไม่พบ Token สำหรับรีเซ็ตรหัสผ่าน");
  return;
}

    setLoading(true);

    try {

      const res = await fetch(
        "/api/auth/reset-password",
        {
          method: "POST",
          headers: {
            "Content-Type":
              "application/json",
          },
body: JSON.stringify({
  token,
  password,
}),
        }
      );

      const data = await res.json();

      if (!res.ok) {

        setError(data.error);

        return;

      }

      setSuccess(
        "เปลี่ยนรหัสผ่านเรียบร้อยแล้ว"
      );

      setTimeout(() => {

        router.push("/login");

      }, 1500);

    } finally {

      setLoading(false);

    }

  }

  return (

    <div className="relative min-h-screen overflow-hidden bg-[#070711] text-white">

      <div className="absolute inset-0">

        <img
          src="/images/login-bg.jpg"
          className="h-full w-full object-cover opacity-20"
          alt=""
        />

        <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-[#070711]/70 to-[#070711]" />

      </div>

      <div className="relative flex min-h-screen items-center justify-center px-6">

        <form
          onSubmit={handleSubmit}
          className="w-full max-w-md rounded-3xl border border-white/10 bg-[#11111b]/80 backdrop-blur-xl p-8"
        >
                    <div className="mb-8 text-center">

            <h1 className="text-4xl font-black tracking-tight">
              ANI
              <span className="text-[#8b5cf6]">/VERSE</span>
            </h1>

            <div className="mt-6 text-6xl">
              🔑
            </div>

            <h2 className="mt-5 text-2xl font-bold">
              ตั้งรหัสผ่านใหม่
            </h2>

            <p className="mt-2 text-sm text-[#9c9ab3]">
              กรุณาตั้งรหัสผ่านใหม่สำหรับบัญชีของคุณ
            </p>

          </div>

          {error && (
            <div className="mb-5 rounded-xl border border-red-500/30 bg-red-500/10 p-4 text-sm text-red-300">
              {error}
            </div>
          )}

          {success && (
            <div className="mb-5 rounded-xl border border-green-500/30 bg-green-500/10 p-4 text-sm text-green-300">
              {success}
            </div>
          )}

          <div className="mb-5">

            <label className="mb-2 block text-sm text-[#b8b6cb]">
              รหัสผ่านใหม่
            </label>

            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="อย่างน้อย 6 ตัวอักษร"
              className="w-full rounded-xl border border-[#2a2a3d] bg-[#080914]/80 px-4 py-3 outline-none transition focus:border-[#8b5cf6] focus:ring-2 focus:ring-[#8b5cf6]/30"
            />

          </div>

          <div className="mb-3">

            <label className="mb-2 block text-sm text-[#b8b6cb]">
              ยืนยันรหัสผ่าน
            </label>

            <input
              type="password"
              value={confirmPassword}
              onChange={(e) =>
                setConfirmPassword(e.target.value)
              }
              placeholder="กรอกรหัสผ่านอีกครั้ง"
              className="w-full rounded-xl border border-[#2a2a3d] bg-[#080914]/80 px-4 py-3 outline-none transition focus:border-[#8b5cf6] focus:ring-2 focus:ring-[#8b5cf6]/30"
            />

          </div>

          {/* Password Strength */}

          <div className="mb-6">

            <div className="mb-2 flex justify-between text-xs text-[#9693b8]">

              <span>ความแข็งแรงของรหัสผ่าน</span>

              <span>

                {password.length < 6
                  ? "อ่อน"
                  : password.length < 10
                  ? "ปานกลาง"
                  : "แข็งแรง"}

              </span>

            </div>

            <div className="h-2 overflow-hidden rounded-full bg-[#222230]">

              <div
                className={`h-full transition-all duration-300 ${
                  password.length < 6
                    ? "w-1/3 bg-red-500"
                    : password.length < 10
                    ? "w-2/3 bg-yellow-400"
                    : "w-full bg-green-500"
                }`}
              />

            </div>

          </div>

          <button
            type="submit"
            disabled={loading}
            className="group relative w-full overflow-hidden rounded-xl bg-[#8b5cf6] py-3 font-bold text-[#080914] transition-all duration-300 hover:scale-[1.02] hover:bg-[#a78bfa] disabled:opacity-50"
          >

            <span className="relative z-10">

              {loading
                ? "กำลังบันทึก..."
                : "บันทึกรหัสผ่านใหม่"}

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
            ← กลับหน้าเข้าสู่ระบบ
          </Link>

          <p className="mt-8 text-center text-xs leading-6 text-[#6d6b81]">
            หลังจากเปลี่ยนรหัสผ่านเรียบร้อย
            <br />
            คุณสามารถเข้าสู่ระบบด้วยรหัสผ่านใหม่ได้ทันที
          </p>
                  </form>
      </div>

      {/* Bottom Glow */}
      <div className="pointer-events-none absolute inset-x-0 bottom-0 h-48 bg-gradient-to-t from-[#8b5cf6]/10 to-transparent" />

      {/* Top Glow */}
      <div className="pointer-events-none absolute left-1/2 top-0 h-80 w-80 -translate-x-1/2 rounded-full bg-[#8b5cf6]/10 blur-[160px]" />

      {/* Side Glow */}
      <div className="pointer-events-none absolute -left-24 top-1/3 h-72 w-72 rounded-full bg-[#8b5cf6]/10 blur-[120px]" />

      <div className="pointer-events-none absolute -right-24 bottom-1/4 h-72 w-72 rounded-full bg-violet-500/10 blur-[120px]" />

    </div>
  );
}