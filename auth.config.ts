import type { NextAuthConfig } from "next-auth";

// This config has no Prisma/bcrypt imports so it's safe to use in proxy.ts.
// The actual Credentials provider (which needs the database) lives in auth.ts.
export default {
  providers: [],
  pages: {
    signIn: "/login",
  },
callbacks: {
  authorized({ auth, request }) {
    console.log(auth?.user);

    const isAdminRoute = request.nextUrl.pathname.startsWith("/admin");

    if (isAdminRoute) {
      return auth?.user?.role === "ADMIN";
    }

    return true;
  },
},
} satisfies NextAuthConfig;