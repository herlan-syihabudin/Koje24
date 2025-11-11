import "./globals.css"
import { Inter, Playfair_Display } from "next/font/google"
import { CartProvider } from "@/components/CartContext"

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" })
const playfair = Playfair_Display({ subsets: ["latin"], variable: "--font-playfair" })

export const metadata = {
  title: "KOJE24 • Natural Cold-Pressed Juice",
  description:
    "KOJE24 adalah minuman cold-pressed alami tanpa gula & pengawet. Segar tiap hari untuk tubuh sehat. Explore the Taste, Explore the World.",
  keywords: [
    "KOJE24",
    "cold pressed juice",
    "minuman sehat",
    "detox alami",
    "jus wortel kunyit jahe",
  ],
  openGraph: {
    title: "KOJE24 • Natural Cold-Pressed Juice",
    description:
      "Explore the Taste, Explore the World — minuman sehat alami tanpa gula & pengawet.",
    url: "https://koje24.vercel.app",
    siteName: "KOJE24",
    images: [
      {
        url: "/image/hero-koje24.png",
        width: 1200,
        height: 630,
        alt: "KOJE24 Natural Cold-Pressed Juice",
      },
    ],
    locale: "id_ID",
    type: "website",
  },
  icons: {
    icon: "/favicon.ico",
  },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="id">
      <head>
        <meta name="theme-color" content="#0FA3A8" />
        <link rel="shortcut icon" href="/favicon.ico" />
      </head>

      <body
        className={`${inter.variable} ${playfair.variable} bg-[#f8fcfc] text-[#0B4B50] scroll-smooth antialiased`}
      >
        {/* 🔹 Provider Global agar StickyCartBar & ProductGrid sinkron */}
        <CartProvider>
          <main className="min-h-screen">{children}</main>
        </CartProvider>

        {/* 🔹 Tambahan aman: Portal untuk komponen popup global */}
        <div id="portal-root"></div>
      </body>
    </html>
  )
}
