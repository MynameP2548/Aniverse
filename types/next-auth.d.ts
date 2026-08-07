import { DefaultSession } from "next-auth";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      role: "USER" | "ADMIN";
      avatar?: string | null;
      bio?: string | null;
    } & DefaultSession["user"];
  }

  interface User {
    id: string;
    role: "USER" | "ADMIN";
    avatar?: string | null;
    bio?: string | null;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id: string;
    role: "USER" | "ADMIN";
    avatar?: string | null;
    bio?: string | null;
  }
}