import "./globals.css";
import type { ReactNode } from "react";
import type { Metadata, Viewport } from "next";
import { Inter, Playfair_Display } from "next/font/google";

import { CartProvider } from "@/components/CartContext";
import StickyCartBar from "@/components/StickyCartBar";
import PromoPopup from "@/components/PromoPopup";
import TestimonialSchemaSEO from "@/components/TestimonialSchemaSEO";
import InstallPWAButton from "@/components/InstallPWAButton";


import { SpeedInsights } from "@vercel/speed-insights/next";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

const playfair = Playfair_Display({
  subsets: ["latin"],
  variable: "--font-playfair",
  display: "swap",
});

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
};

export const viewport: Viewport = {
  themeColor: "#0FA3A8",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html
      lang="id"
      className={`${inter.variable} ${playfair.variable}`}
      suppressHydrationWarning
    >
      <head>
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="manifest" href="/manifest.json" />
        <link rel="apple-touch-icon" href="/icons/apple-touch-icon.png" />
      </head>

      <body className="antialiased font-inter bg-white text-[#0B4B50] max-w-[100vw] overflow-x-hidden">
        {/* ⭐ SEO: Aggregate Rating & Review Schema */}
        <TestimonialSchemaSEO />

        <CartProvider>
          {children}
        </CartProvider>
        <InstallPWAButton />

        <StickyCartBar />
        <PromoPopup />
        <SpeedInsights />

        {/* smooth scroll fallback */}
        <script
          dangerouslySetInnerHTML={{
            __html: `try { document.documentElement.style.scrollBehavior = "smooth"; } catch(e){}`
          }}
        />
      </body>
    </html>
  );
}
