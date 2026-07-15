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
      const isLoggedIn = !!auth?.user;
      const isAdminRoute = request.nextUrl.pathname.startsWith("/admin");

      console.log("========== AUTH ==========");
      console.log(auth);
      console.log("USER:", auth?.user);
      console.log("==========================");

      // ป้องกันเฉพาะว่าต้อง Login ก่อนเข้า /admin
      if (isAdminRoute) {
        return isLoggedIn;
      }

      return true;
    },
  },
} satisfies NextAuthConfig;