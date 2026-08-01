import { MetadataRoute } from "next";
import prisma from "@/lib/prisma";

export const revalidate = 3600; // แคชผลลัพธ์ของ Sitemap ไว้ 1 ชั่วโมง เพื่อลดภาระและป้องกัน Timeout

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = "https://aniverse-wheat.vercel.app";

  let animeUrls: MetadataRoute.Sitemap = [];

  try {
    const anime = await prisma.anime.findMany({
      select: {
        id: true,
        updatedAt: true,
      },
      orderBy: {
        updatedAt: "desc",
      },
    });

    animeUrls = anime.map((item) => ({
      url: `${baseUrl}/anime/${item.id}`,
      lastModified: item.updatedAt,
      changeFrequency: "weekly" as const,
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
