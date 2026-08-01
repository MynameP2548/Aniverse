import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Providers from "./providers";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL("https://aniverse-wheat.vercel.app"),

  title: {
    default: "Aniverse",
    template: "%s | Aniverse",
  },

  description:
    "Aniverse เว็บไซต์ดูอนิเมะออนไลน์ รวมอนิเมะพากย์ไทย ซับไทย อัปเดตตอนใหม่",

  keywords: [
    "Aniverse",
    "Anime",
    "ดูอนิเมะ",
    "อนิเมะ",
    "Anime Online",
    "พากย์ไทย",
    "ซับไทย",
  ],

  openGraph: {
    title: "Aniverse",
    description: "เว็บไซต์ดูอนิเมะออนไลน์",
    url: "https://aniverse-wheat.vercel.app",
    siteName: "Aniverse",
    locale: "th_TH",
    type: "website",
  },

  twitter: {
    card: "summary_large_image",
    title: "Aniverse",
    description: "เว็บไซต์ดูอนิเมะออนไลน์",
  },
};
