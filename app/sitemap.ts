import type { MetadataRoute } from "next";
import prisma from "@/lib/prisma";

export const revalidate = 3600;

const baseUrl = "https://aniverse-wheat.vercel.app";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  let animeUrls: MetadataRoute.Sitemap = [];

  try {
    const anime = await prisma.anime.findMany({
      select: {
        slug: true,
        updatedAt: true,
      },
      orderBy: {
        updatedAt: "desc",
      },
    });

    animeUrls = anime.map((item) => ({
      url: `${baseUrl}/anime/${item.slug}`,
      lastModified: item.updatedAt,
      changeFrequency: "weekly",
      priority: 0.9,
    }));
  } catch (error) {
    console.error("Failed to fetch anime for sitemap:", error);
  }

  return [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 1,
    },

    {
      url: `${baseUrl}/browse`,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 0.9,
    },

    {
      url: `${baseUrl}/search`,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 0.7,
    },

    ...animeUrls,
  ];
}