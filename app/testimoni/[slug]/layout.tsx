import type { Metadata } from "next"
import type { ReactNode } from "react"

export const metadata: Metadata = {
  title: "Testimoni Pelanggan KOJE24",
  description:
    "Ulasan asli pelanggan KOJE24 tentang manfaat dan rasa minuman cold-pressed alami.",
  openGraph: {
    title: "Testimoni Pelanggan KOJE24",
    description:
      "Pengalaman nyata pelanggan setelah rutin minum KOJE24.",
    images: ["/og-testimoni.jpg"],
    type: "article",
  },
  twitter: {
    card: "summary_large_image",
    images: ["/og-testimoni.jpg"],
  },
}

// ⬇️ INI YANG KEMARIN BELUM ADA
export default function TestimoniDetailLayout({
  children,
}: {
  children: ReactNode
}) {
  return <>{children}</>
}
