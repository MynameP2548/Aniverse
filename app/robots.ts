import { MetadataRoute } from "next";

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
      ],
    },
    sitemap: "https://aniverse-wheat.vercel.app/sitemap.xml",
  };
}