import "./globals.css"
import { Inter, Playfair_Display } from "next/font/google"

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" })
const playfair = Playfair_Display({ subsets: ["latin"], variable: "--font-playfair" })

export const metadata = {
  title: "KOJE24 • Natural Cold-Pressed Juice | Healthy Daily Detox",
  description:
    "KOJE24 — minuman cold-pressed alami tanpa gula & pengawet. Segar setiap hari untuk energi, imun, dan keseimbangan hidup.",
  keywords:
    "jus sehat, cold pressed juice, detox, KOJE24, minuman alami, minuman sehat Indonesia, juice tanpa gula",
  openGraph: {
    title: "KOJE24 — Natural Cold-Pressed Juice",
    description:
      "Segar alami setiap hari 🍃 | Cold-Pressed tanpa gula & pengawet. Explore the Taste, Explore the World.",
    url: "https://webkoje-cacs.vercel.app",
    siteName: "KOJE24",
    images: [
      {
        url: "/image/hero2.png",
        width: 1200,
        height: 630,
        alt: "KOJE24 Hero Image",
      },
    ],
    locale: "id_ID",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "KOJE24 — Natural Cold-Pressed Juice",
    description: "Minuman sehat cold-pressed alami tanpa pengawet & gula tambahan.",
    images: ["/image/hero2.png"],
  },
  icons: {
    icon: "/favicon.ico",
  },
}

export default function RootLayout({ children }) {
  return (
    <html lang="id" className={`${inter.variable} ${playfair.variable}`}>
      <body className="bg-white text-[#0B4B50]">{children}</body>
    </html>
  )
}
