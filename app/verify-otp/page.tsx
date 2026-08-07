"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";

export default function VerifyOTPPage() {

  const router = useRouter();

  const searchParams = useSearchParams();

  const email = searchParams.get("email");

  const [otp, setOtp] = useState(["", "", "", "", "", ""]);

  const [loading, setLoading] = useState(false);

  const [error, setError] = useState("");

  const [seconds, setSeconds] = useState(60);

  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  useEffect(() => {

    if (seconds === 0) return;

    const timer = setTimeout(() => {

      setSeconds((s) => s - 1);

    }, 1000);

    return () => clearTimeout(timer);

  }, [seconds]);

  function handleChange(index: number, value: string) {

    if (!/^[0-9]?$/.test(value)) return;

    const copy = [...otp];

    copy[index] = value;

    setOtp(copy);

    if (value && index < 5) {

      inputRefs.current[index + 1]?.focus();

    }

  }

  function handleKeyDown(

    e: React.KeyboardEvent<HTMLInputElement>,

    index: number

  ) {

    if (

      e.key === "Backspace" &&

      otp[index] === "" &&

      index > 0

    ) {

      inputRefs.current[index - 1]?.focus();

    }

  }

  function handlePaste(e: React.ClipboardEvent<HTMLInputElement>) {

    e.preventDefault();

    const text = e.clipboardData.getData("text").trim();

    if (!/^\d{6}$/.test(text)) return;

    const values = text.split("");

    setOtp(values);

    inputRefs.current[5]?.focus();

  }

  async function handleSubmit(

    e: React.FormEvent

  ) {

    e.preventDefault();

    setLoading(true);

    setError("");

    const code = otp.join("");

    try {

const res = await fetch("/api/auth/verify-otp", {
  method: "POST",
  headers: {
    "Content-Type": "application/json",
  },
  body: JSON.stringify({
    email,
    otp: code,
  }),
});

const data = await res.json();

if (!res.ok) {
  setError(data.error);
  return;
}

router.push(
  `/reset-password?token=${data.resetToken}`
);

    } finally {

      setLoading(false);

    }

  }

  return (

    <div className="relative min-h-screen overflow-hidden bg-[#07070d] text-white">

      <div className="absolute inset-0">

        <img
          src="/images/login-bg.jpg"
          className="h-full w-full object-cover opacity-20"
          alt=""
        />

        <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-[#07070d]/70 to-[#07070d]" />

      </div>

      <div className="relative flex min-h-screen items-center justify-center px-6">

        <form

          onSubmit={handleSubmit}

          className="w-full max-w-lg rounded-3xl border border-white/10 bg-[#11111b]/80 backdrop-blur-xl p-8"

        >
                    <div className="mb-8 text-center">

            <h1 className="text-4xl font-black tracking-tight">
              ANI
              <span className="text-[#ff5d73]">/VERSE</span>
            </h1>

            <div className="mt-6 text-6xl">
              🔐
            </div>

            <h2 className="mt-5 text-2xl font-bold">
              ยืนยันรหัส OTP
            </h2>

            <p className="mt-2 text-sm text-[#9c9ab3]">
              กรุณากรอกรหัส 6 หลักที่ส่งไปยังอีเมลของคุณ
            </p>

          </div>

          {error && (
            <div className="mb-6 rounded-xl border border-red-500/30 bg-red-500/10 p-3 text-sm text-red-300">
              {error}
            </div>
          )}

          <div className="mb-8 flex justify-center gap-3">

            {otp.map((digit, index) => (

              <input
                key={index}
                ref={(el) => {
                  inputRefs.current[index] = el;
                }}
                value={digit}
                onPaste={handlePaste}
                onChange={(e) =>
                  handleChange(index, e.target.value)
                }
                onKeyDown={(e) =>
                  handleKeyDown(e, index)
                }
                maxLength={1}
                inputMode="numeric"
                className="
                  h-14
                  w-14
                  rounded-2xl
                  border
                  border-[#2a2a3d]
                  bg-[#0b0b12]
                  text-center
                  text-2xl
                  font-bold
                  outline-none
                  transition
                  focus:border-[#ff5d73]
                  focus:ring-2
                  focus:ring-[#ff5d73]/40
                "
              />

            ))}

          </div>

          <button
            type="submit"
            disabled={loading}
            className="group relative w-full overflow-hidden rounded-xl bg-[#ff5d73] py-3 font-bold text-[#0b0b12] transition-all duration-300 hover:scale-[1.02] hover:bg-[#ff738a] disabled:opacity-50"
          >

            <span className="relative z-10">

              {loading
                ? "กำลังตรวจสอบ..."
                : "ยืนยัน OTP"}

            </span>

            <span className="absolute inset-0 -translate-x-full bg-white/20 transition-transform duration-700 group-hover:translate-x-full" />

          </button>

          <div className="mt-6 text-center">

            {seconds > 0 ? (

              <p className="text-sm text-[#9c9ab3]">

                ส่งรหัสใหม่ได้ใน{" "}

                <span className="font-semibold text-[#ff5d73]">
                  {seconds}
                </span>{" "}

                วินาที

              </p>

            ) : (

              <button
                type="button"
                onClick={() => setSeconds(60)}
                className="text-[#ff5d73] hover:text-[#ff738a]"
              >
                ส่งรหัสอีกครั้ง
              </button>

            )}

          </div>

          <div className="my-8 flex items-center">

            <div className="h-px flex-1 bg-[#2a2a3d]" />

            <span className="px-4 text-xs uppercase tracking-[0.3em] text-[#6d6b81]">
              OR
            </span>

            <div className="h-px flex-1 bg-[#2a2a3d]" />

          </div>

          <Link
            href="/forgot-password"
            className="flex h-12 w-full items-center justify-center rounded-xl border border-[#232335] bg-[#0b0b12]/70 text-sm font-semibold text-[#b8b6cb] transition hover:border-[#ff5d73] hover:text-white"
          >
            ← กลับ
          </Link>
                  </form>
      </div>

      {/* Background Glow */}
      <div className="pointer-events-none absolute inset-x-0 bottom-0 h-48 bg-gradient-to-t from-[#ff5d73]/10 to-transparent" />

      <div className="pointer-events-none absolute left-1/2 top-0 h-80 w-80 -translate-x-1/2 rounded-full bg-[#ff5d73]/10 blur-[160px]" />

    </div>
  );
}