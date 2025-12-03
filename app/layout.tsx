import "./globals.css";
import type { ReactNode } from "react";
import type { Metadata, Viewport } from "next";
import { Inter, Playfair_Display } from "next/font/google";
import { CartProvider } from "@/components/CartContext";
import { SpeedInsights } from "@vercel/speed-insights/next";
import StickyCartBar from "@/components/StickyCartBar";
import PromoPopup from "@/components/PromoPopup";

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
  icons: { icon: "/favicon.ico", apple: "/icons/apple-touch-icon.png" },
};

// THEME COLOR
export const viewport: Viewport = { themeColor: "#0FA3A8" };

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
      </head>

      <body className="antialiased font-inter bg-white text-[#0B4B50] max-w-[100vw] overflow-x-hidden">
        <CartProvider>
          {children}
        </CartProvider>

        <StickyCartBar />
        <PromoPopup />
        <SpeedInsights />

        <script
          dangerouslySetInnerHTML={{
            __html: `try { document.documentElement.style.scrollBehavior = "smooth"; } catch(e){}`
          }}
        />
      </body>
    </html>
  );
}
