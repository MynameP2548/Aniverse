import NextAuth from "next-auth";
import authConfig from "./auth.config";

const { auth } = NextAuth(authConfig);

export async function proxy(req: any) {
  return auth(req);
}

export const config = {
  matcher: ["/admin/:path*"],
};