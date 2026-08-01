import { MetadataRoute } from "next";
import prisma from "@/lib/prisma";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = "https://aniverse-wheat.vercel.app";

  const anime = await prisma.anime.findMany({
    select: {
      id: true,
      updatedAt: true,
    },
    orderBy: {
      updatedAt: "desc",
    },
  });

  const animeUrls: MetadataRoute.Sitemap = anime.map((item) => ({
    url: `${baseUrl}/anime/${item.id}`,
    lastModified: item.updatedAt,
    changeFrequency: "weekly",
    priority: 0.9,
  }));

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
      priority: 0.8,
    },

    {
      url: `${baseUrl}/favorites`,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 0.6,
    },

    {
      url: `${baseUrl}/profile`,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 0.5,
    },

    ...animeUrls,
  ];
}
