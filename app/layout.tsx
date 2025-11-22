import "./globals.css";
import type { ReactNode } from "react";
import { Inter, Playfair_Display } from "next/font/google";
import { CartProvider } from "@/components/CartContext";
import KOJE24Assistant from "@/components/KOJE24Assistant"; // ⬅️ tambah ini

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

// SEO + PWA
export const metadata = {
  title: {
    default: "KOJE24 • Natural Cold-Pressed Juice",
    template: "%s | KOJE24",
  },
  description: "KOJE24 — minuman cold-pressed alami premium.",
  manifest: "/manifest.json",
  icons: {
    icon: "/favicon.ico",
    apple: "/icons/apple-touch-icon.png",
  },
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

        {/* Tambah Assistant Tanpa Merusak Layout */}
        <KOJE24Assistant />

        {/* Smooth scroll */}
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
