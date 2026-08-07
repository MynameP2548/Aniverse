import Link from "next/link";
import Image from "next/image";
import { auth, signOut } from "@/auth";

export default async function Navbar() {
const session = await auth();

const user = session?.user?.id
  ? await prisma.user.findUnique({
      where: {
        id: session.user.id,
      },
    })
  : null;

  const initials =
    session?.user?.name
      ?.split(" ")
      .map((v) => v[0])
      .join("")
      .substring(0, 2)
      .toUpperCase() || "U";

  return (
    <header className="fixed inset-x-0 top-0 z-50">

      {/* Background */}

      <div className="absolute inset-0 bg-gradient-to-b from-black/90 via-black/70 to-transparent backdrop-blur-xl" />

      <div
        className="
        relative
        mx-auto
        flex
        h-20
        w-full
        max-w-[1500px]
        items-center
        justify-between
        px-6
        md:px-8
        xl:px-12
        2xl:px-16
      "
      >

        {/* ================= Logo ================= */}

        <Link
          href="/"
          className="group flex shrink-0 items-center"
        >
          <span className="text-2xl font-black tracking-tight text-white md:text-3xl">
            ANI
          </span>

          <span
            className="
            ml-1
            rounded-md
            bg-[#ff5d73]
            px-2
            py-0.5
            text-2xl
            font-black
            tracking-tight
            text-white
            transition-all
            duration-300
            group-hover:bg-[#ff738a]
            md:text-3xl
          "
          >
            VERSE
          </span>
        </Link>

        {/* ================= Menu ================= */}

        <nav className="hidden items-center gap-8 text-sm font-medium lg:flex">

          <Link
            href="/"
            className="text-white transition hover:text-[#ff5d73]"
          >
            หน้าแรก
          </Link>

          <Link
            href="/browse?status=ongoing"
            className="text-white/70 transition hover:text-[#ff5d73]"
          >
            กำลังฉาย
          </Link>

          <Link
            href="/browse?status=completed"
            className="text-white/70 transition hover:text-[#ff5d73]"
          >
            จบแล้ว
          </Link>

          {session?.user && (

            <Link
              href="/favorites"
              className="text-white/70 transition hover:text-[#ff5d73]"
            >
              รายการโปรด
            </Link>

          )}

        </nav>

        {/* ================= Right ================= */}

        <div className="flex items-center gap-4">

          <form
            action="/search"
            className="relative hidden md:block"
          >

            <input
              name="q"
              placeholder="ค้นหาอนิเมะ..."
              className="
                w-64
                rounded-full
                border
                border-white/10
                bg-white/10
                py-2.5
                pl-5
                pr-11
                text-sm
                text-white
                placeholder:text-white/40
                outline-none
                transition
                focus:border-[#ff5d73]
                focus:w-72
              "
            />

            <svg
              className="absolute right-4 top-1/2 h-5 w-5 -translate-y-1/2 text-white/50"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeWidth={2}
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M21 21l-4.35-4.35M17 10a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>

          </form>
                    {/* ================= User ================= */}

          {session?.user ? (

            <div className="relative group">

              <button
                className="
                  flex
                  items-center
                  gap-3
                  rounded-full
                  border
                  border-white/10
                  bg-white/5
                  px-2
                  py-1.5
                  backdrop-blur-xl
                  transition-all
                  duration-300
                  hover:border-[#ff5d73]
                  hover:bg-white/10
                "
              >

                {/* Avatar */}

                <div className="relative h-11 w-11 overflow-hidden rounded-full border border-white/10 bg-[#1a1a28]">

                  {user?.avatar ? (

                    <Image
                      src={user?.avatar}
                      alt="Avatar"
                      fill
                      className="object-cover"
                      unoptimized
                    />

                  ) : (

                    <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-[#ff5d73] to-pink-500 text-sm font-black text-white">

                      {initials}

                    </div>

                  )}

                </div>

                <div className="hidden text-left lg:block">

                  <div className="max-w-[140px] truncate text-sm font-semibold text-white">

                    {user?.name}

                  </div>

                  <div className="text-xs text-white/50">

                    {session.user.role}

                  </div>

                </div>

                <svg
                  className="hidden h-4 w-4 text-white/60 transition group-hover:rotate-180 lg:block"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeWidth={2}
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M19 9l-7 7-7-7"
                  />
                </svg>

              </button>

              {/* Dropdown */}

              <div
                className="
                  invisible
                  absolute
                  right-0
                  mt-3
                  w-72
                  translate-y-2
                  rounded-2xl
                  border
                  border-white/10
                  bg-[#11111b]/95
                  p-2
                  opacity-0
                  shadow-2xl
                  backdrop-blur-2xl
                  transition-all
                  duration-300
                  group-hover:visible
                  group-hover:translate-y-0
                  group-hover:opacity-100
                "
              >

                <div className="flex items-center gap-4 rounded-xl p-3">

                  <div className="relative h-14 w-14 overflow-hidden rounded-full bg-[#1b1b28]">

                    {user?.avatar ? (

                      <Image
                        src={user?.avatar}
                        alt="Avatar"
                        fill
                        className="object-cover"
                        unoptimized
                      />

                    ) : (

                      <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-[#ff5d73] to-pink-500 text-lg font-black text-white">

                        {initials}

                      </div>

                    )}

                  </div>

                  <div>

                    <div className="font-bold text-white">

                      {user?.name}

                    </div>

                    <div className="text-sm text-white/50">

                      {user?.email}

                    </div>

                  </div>

                </div>

                <div className="my-2 h-px bg-white/10" />

                <Link
                  href="/profile"
                  className="flex items-center gap-3 rounded-xl px-4 py-3 text-sm text-white transition hover:bg-white/10"
                >
                  👤 โปรไฟล์
                </Link>

                <Link
                  href="/favorites"
                  className="flex items-center gap-3 rounded-xl px-4 py-3 text-sm text-white transition hover:bg-white/10"
                >
                  ❤️ รายการโปรด
                </Link>

                <Link
                  href="/history"
                  className="flex items-center gap-3 rounded-xl px-4 py-3 text-sm text-white transition hover:bg-white/10"
                >
                  🕒 ประวัติการรับชม
                </Link>

                <div className="my-2 h-px bg-white/10" />
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
                      flex
                      w-full
                      items-center
                      gap-3
                      rounded-xl
                      px-4
                      py-3
                      text-left
                      text-sm
                      text-red-400
                      transition-all
                      hover:bg-red-500/10
                    "
                  >
                    🚪 ออกจากระบบ
                  </button>
                </form>

              </div>

            </div>

          ) : (

            <Link
              href="/login"
              className="
                rounded-xl
                bg-[#ff5d73]
                px-5
                py-2.5
                text-sm
                font-semibold
                text-white
                transition-all
                duration-300
                hover:scale-105
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