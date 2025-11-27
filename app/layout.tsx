import "./globals.css";
import type { ReactNode } from "react";
import type { Metadata, Viewport } from "next";
import { Inter, Playfair_Display } from "next/font/google";
import { CartProvider } from "@/components/CartContext";
import { SpeedInsights } from "@vercel/speed-insights/next"; // ← DITAMBAHKAN
import StickyCartBar from "@/components/StickyCartBar";

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

// ✅ SEO + PWA (step 1: rapihin metadata & hilangin warning themeColor)
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
  // tambahan ringan buat SEO dasar
  keywords: [
    "KOJE24",
    "cold pressed juice",
    "jus sehat",
    "juice detox",
    "minuman sehat Bekasi",
  ],
  robots: {
    index: true,
    follow: true,
  },
};

// ✅ themeColor sekarang pakai export viewport (sesuai Next 16 → warning hilang)
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
      <body className="antialiased font-inter bg-white text-[#0B4B50]">
        <CartProvider>
          {children}
        </CartProvider>

        {/* --- Speed Insights --- */}
        <SpeedInsights />

        <StickyCartBar />

        <script
          dangerouslySetInnerHTML={{
            __html: `
              try { document.documentElement.style.scrollBehavior = "smooth"; } catch(e){}
            `,
          }}
        />
      </body>
    </html>
  );
}
