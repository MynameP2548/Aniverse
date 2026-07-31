import Link from "next/link";
import { auth, signOut } from "@/auth";

export default async function Navbar() {
  const session = await auth();

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-gradient-to-b from-[#0b0b12] via-[#0b0b12]/80 to-transparent">
      <div className="max-w-7xl mx-auto px-6 py-5 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-0.5">
          <span className="text-xl font-black tracking-tight text-[#e8e6f0]">ANI</span>
          <span className="text-xl font-black tracking-tight text-[#ff5d73]">/VERSE</span>
        </Link>

        <nav className="hidden md:flex items-center gap-6 text-sm text-[#8a87a3]">
          <Link href="/" className="hover:text-[#e8e6f0] transition">
            หน้าแรก
          </Link>
          <Link href="/browse?status=ongoing" className="hover:text-[#e8e6f0] transition">
            กำลังฉาย
          </Link>
          <Link href="/browse?status=completed" className="hover:text-[#e8e6f0] transition">
            จบแล้ว
          </Link>
          {session?.user && (
            <Link href="/favorites" className="hover:text-[#e8e6f0] transition">
              รายการโปรด
            </Link>
          )}
        </nav>

        <div className="flex items-center gap-3">
          <form action="/search" className="relative">
            <input
              name="q"
              placeholder="ค้นหาอนิเมะ..."
              className="bg-[#131320]/80 border border-[#232335] rounded-full pl-4 pr-9 py-1.5 text-sm text-[#e8e6f0] placeholder:text-[#5a5770] focus:outline-none focus:ring-1 focus:ring-[#ff5d73] w-40 md:w-56 transition-all focus:w-64"
            />
            <svg
              className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#5a5770]"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M21 21l-4.35-4.35M17 10a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
          </form>

          {session?.user ? (
            <form
              action={async () => {
                "use server";
                await signOut({ redirectTo: "/" });
              }}
            >
              <button
                type="submit"
                className="text-xs text-[#8a87a3] hover:text-[#e8e6f0] transition"
              >
                ออกจากระบบ
              </button>
            </form>
          ) : (
            <Link
              href="/login"
              className="text-xs text-[#8a87a3] hover:text-[#e8e6f0] transition"
            >
              เข้าสู่ระบบ
            </Link>
          )}
        </div>
      </div>
    </header>
  );
}
