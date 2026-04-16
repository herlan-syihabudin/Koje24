// app/testimoni/[slug]/layout.tsx
import { Metadata } from "next"

type Props = {
  params: { slug: string }
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const slug = params.slug
  const timestamp = decodeURIComponent(slug.split("-")[0])
  
  // Opsional: fetch data buat title & description yang lebih relevan
  // Kalau mau simpel, ya seperti kode kamu sudah cukup
  
  return {
    title: `Detail Testimoni KOJE24`,
    description: "Lihat detail ulasan pelanggan KOJE24 tentang cold-pressed juice alami tanpa gula.",
    robots: "noindex, follow", // Biar gak kompetisi dengan halaman utama testimoni
    openGraph: {
      title: `Testimoni Pelanggan KOJE24`,
      description: "Ulasan asli pelanggan KOJE24",
    },
  }
}

export default function TestimoniDetailLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <>{children}</>
}
