// app/(public)/testimoni/metadata.ts
import { Metadata } from "next"

export const testimoniMetadata: Metadata = {
  title: "Testimoni Pelanggan KOJE24 - Cold Pressed Juice",
  description: "Lihat ulasan nyata pelanggan KOJE24 tentang cold-pressed juice alami. Testimoni dari pelanggan Bekasi & Jakarta yang sudah merasakan manfaatnya.",
  keywords: "testimoni KOJE24, ulasan jus detox, review cold pressed juice, testimoni pelanggan",
  openGraph: {
    title: "Testimoni Pelanggan KOJE24",
    description: "Apa kata pelanggan tentang cold-pressed juice KOJE24?",
    images: ["https://koje24.com/og-testimoni.jpg"],
    type: "website",
  },
  alternates: {
    canonical: "https://koje24.com/testimoni",
  },
}
