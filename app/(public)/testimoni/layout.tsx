import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Testimoni Pelanggan KOJE24 | Ulasan Cold-Pressed Juice Jakarta",
  description:
    "Kumpulan testimoni asli pelanggan KOJE24. Ulasan nyata tentang rasa, manfaat, dan pengalaman minum cold-pressed juice KOJE24. Tanpa gula, tanpa pengawet.",
  openGraph: {
    title: "Testimoni Pelanggan KOJE24",
    description:
      "Lihat ulasan nyata pelanggan KOJE24 tentang rasa dan manfaat minuman cold-pressed alami.",
    url: "https://koje24.id/testimoni",
    siteName: "KOJE24",
    images: [
      {
        url: "https://koje24.id/og/og-testimoni.jpg",
        width: 1200,
        height: 630,
        alt: "Testimoni Pelanggan KOJE24",
      },
    ],
    locale: "id_ID",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Testimoni Pelanggan KOJE24",
    description:
      "Ulasan pelanggan KOJE24 tentang minuman sehat cold-pressed tanpa gula.",
    images: ["https://koje24.id/og/og-testimoni.jpg"],
  },
  // TAMBAHKAN INI (opsional)
  keywords: "testimoni KOJE24, ulasan cold-pressed juice, jus sehat Jakarta, review juicer",
  robots: "index, follow",
  alternates: {
    canonical: "https://koje24.id/testimoni",
  },
}

export default function TestimoniLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <>
      {children}
    </>
  )
}
