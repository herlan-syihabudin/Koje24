import "./globals.css"
import type { ReactNode } from "react"
import { CartProvider } from "@/components/CartContext"
import { Inter, Playfair_Display } from "next/font/google"

// FONTS
const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
})

const playfair = Playfair_Display({
  subsets: ["latin"],
  variable: "--font-playfair",
  display: "swap",
})

export const metadata = {
  title: {
    default: "KOJE24 • Natural Cold-Pressed Juice",
    template: "%s | KOJE24",
  },
  description:
    "KOJE24 — minuman cold-pressed alami tanpa gula, tanpa pengawet. Premium daily detox.",
  icons: { icon: "/favicon.ico" },
  manifest: "/manifest.json",
  themeColor: "#0FA3A8",
}

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html
      lang="id"
      className={`${inter.variable} ${playfair.variable}`}
      suppressHydrationWarning
    >
      {/* ❗ BODY Background controlled by Tailwind */}
      <body className="bg-[#020507] text-white antialiased font-inter">
        <CartProvider>{children}</CartProvider>
      </body>
    </html>
  )
}
