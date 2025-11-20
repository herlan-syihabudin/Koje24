import "./globals.css"
import type { ReactNode } from "react"
import { CartProvider } from "@/components/CartContext"

// 🌍 SEO & META Lengkap
export const metadata = {
  metadataBase: new URL("https://webkoje-cacs.vercel.app"),
  title: {
    default: "KOJE24 • Natural Cold-Pressed Juice | Healthy Daily Detox",
    template: "%s | KOJE24",
  },
  description:
    "KOJE24 — minuman cold-pressed alami tanpa gula & pengawet. Segar setiap hari untuk energi, imun, dan keseimbangan hidup.",
  keywords: [
    "jus sehat",
    "cold pressed juice",
    "detox alami",
    "minuman sehat",
    "KOJE24",
    "juice alami tanpa gula",
    "jus tanpa pengawet",
    "minuman natural Indonesia",
  ],
  openGraph: {
    title: "KOJE24 — Natural Cold-Pressed Juice",
    description:
      "Segar alami setiap hari 🍃 | Cold-Pressed tanpa gula & pengawet. Explore the Taste, Explore the World.",
    url: "https://webkoje-cacs.vercel.app",
    siteName: "KOJE24",
    type: "website",
    locale: "id_ID",
    images: [
      {
        url: "/image/hero2.png",
        width: 1200,
        height: 630,
        alt: "KOJE24 Hero Image",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "KOJE24 — Natural Cold-Pressed Juice",
    description:
      "Minuman sehat cold-pressed alami tanpa pengawet & gula tambahan.",
    images: ["/image/hero2.png"],
    creator: "@koje24",
  },

  icons: {
    icon: "/favicon.ico",
    apple: [
      "/icon/apple-icon-120.png",
      "/icon/apple-icon-152.png",
      "/icon/apple-icon-167.png",
      "/icon/apple-icon-180.png",
    ],
  },

  manifest: "/manifest.json",
  themeColor: "#0FA3A8",
  alternates: {
    canonical: "https://webkoje-cacs.vercel.app",
  },
}

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="id" suppressHydrationWarning>
      <head>
        {/* GOOGLE FONTS – playlist Display & Inter */}
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&family=Playfair+Display:wght@400;600;700&display=swap"
          rel="stylesheet"
        />
      </head>

      <body className="bg-white text-[#0B4B50] antialiased selection:bg-[#0FA3A8]/20 selection:text-[#0B4B50] font-inter">
        <CartProvider>{children}</CartProvider>
      </body>
    </html>
  )
}
