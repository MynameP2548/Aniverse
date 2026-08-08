import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: [
        "/admin",
        "/api",
        "/login",
        "/register",
        "/profile",
        "/favorites",
      ],
    },

    sitemap: "https://aniverse-wheat.vercel.app/sitemap.xml",
  };
}