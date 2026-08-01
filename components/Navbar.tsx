import Link from "next/link";
import { auth, signOut } from "@/auth";

export default async function Navbar() {
  const session = await auth();

  return (
    <header className="fixed top-0 left-0 right-0 z-50">
      {/* Blur Background */}
      <div className="absolute inset-0 bg-gradient-to-b from-black/90 via-black/60 to-transparent backdrop-blur-md" />

      <div className="relative max-w-7xl mx-auto h-20 px-8 flex items-center justify-between">

        {/* Logo */}
        <Link href="/" className="group flex items-center">
          <span className="text-3xl font-black tracking-tight text-white transition">
            ANI
          </span>

          <span className="ml-1 rounded-md bg-[#ff5d73] px-2 py-0.5 text-3xl font-black tracking-tight text-white transition-all duration-300 group-hover:bg-[#ff738a]">
            VERSE
          </span>
        </Link>

        {/* Menu */}
        <nav className="hidden lg:flex items-center gap-10 text-sm font-medium">
          <Link
            href="/"
            className="text-white hover:text-[#ff5d73] transition"
          >
            หน้าแรก
          </Link>

          <Link
            href="/browse?status=ongoing"
            className="text-white/70 hover:text-[#ff5d73] transition"
          >
            กำลังฉาย
          </Link>

          <Link
            href="/browse?status=completed"
            className="text-white/70 hover:text-[#ff5d73] transition"
          >
            จบแล้ว
          </Link>

          {session?.user && (
            <>
              <Link
                href="/favorites"
                className="text-white/70 hover:text-[#ff5d73] transition"
              >
                รายการโปรด
              </Link>

              <Link
                href="/profile"
                className="text-white/70 hover:text-[#ff5d73] transition"
              >
                โปรไฟล์
              </Link>
            </>
          )}
        </nav>

        {/* Right */}
        <div className="flex items-center gap-5">

          {/* Search */}
          <form action="/search" className="relative hidden md:block">
            <input
              name="q"
              placeholder="ค้นหาอนิเมะ..."
              className="
                w-64
                rounded-full
                border
                border-white/10
                bg-white/10
                backdrop-blur-md
                py-2.5
                pl-5
                pr-11
                text-sm
                text-white
                placeholder:text-white/40
                outline-none
                transition-all
                duration-300
                focus:border-[#ff5d73]
                focus:w-80
              "
            />

            <svg
              className="absolute right-4 top-1/2 h-5 w-5 -translate-y-1/2 text-white/50"
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

          {/* Login */}
          {session?.user ? (
            <form
              action={async () => {
                "use server";
                await signOut({
                  redirectTo: "/",
                });
              }}
            >
              <button
                className="
                  rounded-lg
                  bg-white/10
                  px-4
                  py-2
                  text-sm
                  text-white
                  transition
                  hover:bg-[#ff5d73]
                "
              >
                ออกจากระบบ
              </button>
            </form>
          ) : (
            <Link
              href="/login"
              className="
                rounded-lg
                bg-[#ff5d73]
                px-5
                py-2
                text-sm
                font-semibold
                text-white
                transition
                hover:bg-[#ff738a]
              "
            >
              เข้าสู่ระบบ
            </Link>
          )}
        </div>
      </div>
    </header>
  );
}
