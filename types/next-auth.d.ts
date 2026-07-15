import { DefaultSession } from "next-auth";

declare module "next-auth" {
  interface Session {
    user: {
      role: "USER" | "ADMIN";
      id: string;
    } & DefaultSession["user"];
  }

  interface User {
    role: "USER" | "ADMIN";
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    role: "USER" | "ADMIN";
    id: string;
  }
}
