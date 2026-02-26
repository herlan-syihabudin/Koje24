import "./globals.css";
import type { ReactNode } from "react";
import { Suspense } from "react";
import type { Metadata, Viewport } from "next";
import { Inter, Playfair_Display } from "next/font/google";

import StickyCartBar from "@/components/StickyCartBar";
import PromoPopup from "@/components/PromoPopup";
import TestimonialSchemaSEO from "@/components/TestimonialSchemaSEO";
import InstallPWAButton from "@/components/InstallPWAButton";
import ChatWidget from "@/components/ChatWidget";

import { SpeedInsights } from "@vercel/speed-insights/next";

/* =====================
   FONTS
===================== */
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

/* =====================
   METADATA
===================== */
export const metadata: Metadata = {
  title: {
    default: "KOJE24 • Natural Cold-Pressed Juice",
    template: "%s | KOJE24",
  },
  description:
    "KOJE24 — minuman cold-pressed alami premium tanpa gula tambahan dan tanpa pengawet. Cocok untuk detoks harian dan menjaga imunitas.",
  manifest: "/manifest.json",
  icons: {
    icon: [
      { url: "/favicon.ico" },
      { url: "/icons/icon-192x192.png", sizes: "192x192", type: "image/png" },
      { url: "/icons/icon-512x512.png", sizes: "512x512", type: "image/png" },
    ],
    apple: "/icons/apple-touch-icon.png",
  },
  other: {
    'google-site-verification': 'your-verification-code', // ✅ Tambah ini
  }
};

export const viewport: Viewport = {
  themeColor: "#0FA3A8",
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
};

/* =====================
   ORGANIZATION SCHEMA
===================== */
const organizationSchema = {
  "@context": "https://schema.org",
  "@type": "Organization",
  "name": "KOJE24",
  "url": "https://webkoje24.vercel.app",
  "logo": "https://webkoje24.vercel.app/icons/icon-512x512.png",
  "sameAs": [
    "https://instagram.com/koje24",
    "https://wa.me/6282213139580"
  ]
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html
      lang="id"
      className={`${inter.variable} ${playfair.variable}`}
      suppressHydrationWarning
    >
      <head>
        {/* Preconnect fonts */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />

        {/* Apple Touch Icon */}
        <link rel="apple-touch-icon" href="/icons/apple-touch-icon.png" />

        {/* Preload hero image */}
        <link
          rel="preload"
          as="image"
          href="/image/hero2.webp"
          type="image/webp"
        />
      </head>

      <body className="antialiased font-inter bg-white text-[#0B4B50] max-w-[100vw] overflow-x-hidden">
        {/* SEO Schemas */}
        <TestimonialSchemaSEO />
        
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(organizationSchema)
          }}
        />

        {/* Main content */}
        {children}

        {/* Client Components with Suspense */}
        <Suspense fallback={null}>
          <ChatWidget />
        </Suspense>

        <Suspense fallback={null}>
          <InstallPWAButton />
        </Suspense>

        <Suspense fallback={null}>
          <StickyCartBar />
        </Suspense>

        <Suspense fallback={null}>
          <PromoPopup />
        </Suspense>

        <SpeedInsights />
      </body>
    </html>
  );
}