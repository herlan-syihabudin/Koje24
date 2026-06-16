// app/layout.tsx

import "./globals.css";
import type { ReactNode } from "react";
import { Inter, Playfair_Display } from "next/font/google";
import type { Metadata, Viewport } from "next";

// =======================
// FONTS
// =======================
const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
  preload: true,
});

const playfair = Playfair_Display({
  subsets: ["latin"],
  variable: "--font-playfair",
  display: "swap",
  preload: true,
});

// =======================
// ✅ METADATA (HARUS ADA DI ROOT LAYOUT!)
// =======================
export const metadata: Metadata = {
  title: {
    default: "KOJE24 • Cold Pressed Juice Bekasi",
    template: "%s | KOJE24",
  },
  description:
    "KOJE24 — cold pressed juice premium di Bekasi. 100% alami tanpa gula tambahan, tanpa pengawet. Cocok untuk detox harian & imunitas. Delivery Jabodetabek.",
  keywords:
    "cold pressed juice Bekasi, jus detox Bekasi, jus sehat Bekasi, KOJE24 Bekasi, minuman detox alami Bekasi, cold pressed juice terbaik Bekasi",
  manifest: "/manifest.json",
  icons: {
    icon: [
      { url: "/favicon.ico" },
      { url: "/icons/icon-192x192.png", sizes: "192x192", type: "image/png" },
      { url: "/icons/icon-512x512.png", sizes: "512x512", type: "image/png" },
    ],
    apple: "/icons/apple-touch-icon.png",
  },
  openGraph: {
    title: "KOJE24 - Cold Pressed Juice Bekasi",
    description: "Cold pressed juice premium di Bekasi. 100% natural, tanpa gula, fresh daily.",
    url: "https://koje24.com",
    siteName: "KOJE24",
    locale: "id_ID",
    type: "website",
    images: [
      {
        url: "https://koje24.com/og-image.jpg",
        width: 1200,
        height: 630,
        alt: "KOJE24 Cold Pressed Juice - Bekasi",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "KOJE24 - Cold Pressed Juice Bekasi",
    description: "Cold pressed juice premium di Bekasi. 100% natural, tanpa gula.",
    images: ["https://koje24.com/og-image.jpg"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  alternates: {
    canonical: "https://koje24.com",
  },
  other: {
    "google-site-verification": "_cTz7gO2HdLMjoMfCIAp2Fud_Wb6X2Yy1t7j6L9Et9k",
  },
};

export const viewport: Viewport = {
  themeColor: "#0FA3A8",
  width: "device-width",
  initialScale: 1,
  maximumScale: 2,
  userScalable: true,
  viewportFit: "cover",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html
      lang="id"
      className={`${inter.variable} ${playfair.variable}`}
      suppressHydrationWarning
    >
      <body className="antialiased font-inter bg-white text-[#0B4B50] max-w-[100vw] overflow-x-hidden">
        {children}
      </body>
    </html>
  );
}
