"use client";

import { useState } from "react";
import { signIn, getSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function LoginPage() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    setLoading(true);
    setError("");

    const res = await signIn("credentials", {
      email,
      password,
      redirect: false,
    });

    setLoading(false);

    if (res?.error) {
      setError("อีเมลหรือรหัสผ่านไม่ถูกต้อง");
      return;
    }

    const session = await getSession();

    if (session?.user?.role === "ADMIN") {
      router.push("/admin");
    } else {
      router.push("/");
    }

    router.refresh();
  }

  return (
    <div className="relative min-h-screen overflow-hidden bg-[#070711] text-white">

      {/* Background */}
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

            <h1 className="text-4xl font-black tracking-tight">
              ANI
              <span className="text-[#8b5cf6]">/VERSE</span>
            </h1>

            <p className="mt-3 text-sm text-[#9c9ab3]">
              ยินดีต้อนรับกลับ
            </p>

          </div>

          {error && (
            <div className="mb-6 rounded-xl border border-red-500/30 bg-red-500/10 p-3 text-sm text-red-300">
              {error}
            </div>
          )}

          <div className="mb-5">

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

          <div className="mb-6">

            <label className="mb-2 block text-sm text-[#b8b6cb]">
              รหัสผ่าน
            </label>

            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full rounded-xl border border-[#2a2a3d] bg-[#080914]/80 px-4 py-3 outline-none transition focus:border-[#8b5cf6] focus:ring-2 focus:ring-[#8b5cf6]/30"
            />

          </div>
                    <button
            type="submit"
            disabled={loading}
            className="group relative w-full overflow-hidden rounded-xl bg-[#8b5cf6] py-3 font-bold text-[#080914] transition-all duration-300 hover:scale-[1.02] hover:bg-[#a78bfa] disabled:cursor-not-allowed disabled:opacity-50"
          >
            <span className="relative z-10">
              {loading ? "กำลังเข้าสู่ระบบ..." : "เข้าสู่ระบบ"}
            </span>

            <span className="absolute inset-0 -translate-x-full bg-white/20 transition-transform duration-700 group-hover:translate-x-full" />
          </button>

          <div className="mt-6 flex items-center justify-between text-sm">

            <label className="flex items-center gap-2 text-[#9c9ab3]">

              <input
                type="checkbox"
                className="rounded border-[#2a2a3d] bg-[#080914]"
              />

              จดจำฉัน

            </label>

            <Link
              href="/forgot-password"
              className="font-medium text-[#8b5cf6] transition hover:text-[#a78bfa]"
            >
              ลืมรหัสผ่าน?
            </Link>

          </div>

          <div className="my-8 flex items-center">

            <div className="h-px flex-1 bg-[#2a2a3d]" />

            <span className="px-4 text-xs uppercase tracking-[0.3em] text-[#6d6b81]">
              OR
            </span>

            <div className="h-px flex-1 bg-[#2a2a3d]" />

          </div>

          <div className="rounded-2xl border border-[#232335] bg-[#080914]/70 p-4">

            <p className="text-center text-sm text-[#9c9ab3]">
              ยังไม่มีบัญชี?
            </p>

            <Link
              href="/register"
              className="mt-3 flex h-11 w-full items-center justify-center rounded-xl border border-[#8b5cf6]/40 bg-[#8b5cf6]/10 font-semibold text-[#8b5cf6] transition hover:bg-[#8b5cf6] hover:text-[#080914]"
            >
              สมัครสมาชิก
            </Link>

          </div>

          <p className="mt-8 text-center text-xs leading-6 text-[#6d6b81]">
            การเข้าสู่ระบบถือว่าคุณยอมรับ
            <br />
            ข้อกำหนดการใช้งาน และ นโยบายความเป็นส่วนตัว
          </p>
                  </form>
      </div>

      {/* Bottom Glow */}
      <div className="pointer-events-none absolute inset-x-0 bottom-0 h-48 bg-gradient-to-t from-[#8b5cf6]/10 to-transparent" />

    </div>
  );
}