import "./globals.css";
import type { ReactNode } from "react";
import type { Metadata, Viewport } from "next";
import { Inter, Playfair_Display } from "next/font/google";
import { CartProvider } from "@/components/CartContext";
import { SpeedInsights } from "@vercel/speed-insights/next";
import StickyCartBar from "@/components/StickyCartBar";

// === FONTS ===
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

// === SEO ===
export const metadata: Metadata = {
  title: {
    default: "KOJE24 • Natural Cold-Pressed Juice",
    template: "%s | KOJE24",
  },
  description:
    "KOJE24 — minuman cold-pressed alami premium tanpa gula tambahan dan tanpa pengawet. Cocok untuk detoks harian dan menjaga imunitas.",
  manifest: "/manifest.json",
  icons: {
    icon: "/favicon.ico",
    apple: "/icons/apple-touch-icon.png",
  },
  keywords: [
    "KOJE24",
    "cold pressed juice",
    "jus sehat",
    "juice detox",
    "minuman sehat bekasi",
  ],
  robots: {
    index: true,
    follow: true,
  },

  // 🔥 Open Graph — buat share WhatsApp/FB/IG keren
  openGraph: {
    title: "KOJE24 • Natural Cold-Pressed Juice",
    description:
      "Cold-pressed juice alami tanpa gula tambahan dan tanpa pengawet — premium daily detox.",
    url: "https://koje24.com",
    siteName: "KOJE24",
    images: [
      {
        url: "/og-cover.jpg",
        width: 1200,
        height: 630,
        alt: "KOJE24 Natural Cold-Pressed Juice",
      },
    ],
    type: "website",
  },
};

// === THEME COLOR via viewport (tanpa warning Next 16)
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
        {/* ⚡ Percepat loading font */}
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
      </head>

      <body className="antialiased font-inter bg-white text-[#0B4B50] max-w-[100vw] overflow-x-hidden">
        <CartProvider>
          {children}
        </CartProvider>

        {/* Speed Insights */}
        <SpeedInsights />

        {/* Sticky Cart Bar */}
        <StickyCartBar />

        {/* Smooth scroll fallback */}
        <script
          dangerouslySetInnerHTML={{
            __html: `
              try { document.documentElement.style.scrollBehavior = "smooth"; } catch(e){}
            `,
          }}
        />

        {/* 🔥 JSON-LD Structured Data (SEO PREMIUM - no effect UI) */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "Organization",
              name: "KOJE24",
              url: "https://koje24.com",
              logo: "/icons/apple-touch-icon.png",
            }),
          }}
        />
      </body>
    </html>
  );
}
