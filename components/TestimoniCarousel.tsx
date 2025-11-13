"use client"
import { useEffect, useState } from "react"
import dynamic from "next/dynamic"
import TulisTestimoniForm from "./TulisTestimoniForm"

// 🔹 Import react-fast-marquee dinamis biar gak error SSR
const Marquee = dynamic(() => import("react-fast-marquee"), { ssr: false })

type Testimoni = {
  nama: string
  kota: string
  varian: string
  pesan: string
  rating: number
  ShowOnHome?: string | boolean
  showOnHome?: boolean
}

export default function TestimoniCarousel() {
  const [data, setData] = useState<Testimoni[]>([])
  const API_URL = "/api/testimonial"

  useEffect(() => {
    const run = async () => {
      try {
        const res = await fetch(API_URL, { cache: "no-store" })
        const json = await res.json()

        // ✅ Gunakan properti "ShowOnHome" dari Google Sheet
        const filtered = (json as Testimoni[])
  .filter((x) => x.showOnHome === true || String(x.ShowOnHome || "").toUpperCase() === "TRUE")
  .reverse()

        setData(filtered.slice(0, 5))
      } catch (e) {
        console.error("Gagal ambil testimoni:", e)
      }
    }
    run()
  }, [])

  // 🔹 Fallback data kalau API kosong
  const fallbackData: Testimoni[] = [
    {
      nama: "Dewi Rahma",
      kota: "Jakarta",
      varian: "Green Detox",
      pesan: "Sejak rutin minum KOJE24, badan terasa lebih ringan dan segar tiap pagi!",
      rating: 5,
    },
    {
      nama: "Andi Pratama",
      kota: "Bandung",
      varian: "Yellow Immunity",
      pesan: "Rasanya enak dan natural banget, daya tahan tubuh juga terasa meningkat!",
      rating: 5,
    },
    {
      nama: "Sinta Lestari",
      kota: "Surabaya",
      varian: "Red Series",
      pesan: "Packaging-nya premium, cocok banget buat daily detox. Recommended!",
      rating: 4,
    },
  ]

  const testimonials = data

  return (
    <section className="py-24 bg-gradient-to-b from-[#f6fbfb] to-[#eef7f7] relative overflow-hidden">
      {/* 🔹 Background accent */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(15,163,168,0.06),transparent_70%)] pointer-events-none" />

      <div className="max-w-6xl mx-auto px-6 md:px-10 relative z-10">
        {/* Header */}
        <div className="flex justify-between items-center mb-10 flex-wrap gap-3">
          <h2 className="font-playfair text-3xl md:text-4xl font-semibold text-[#0B4B50]">
            Apa kata mereka tentang <span className="text-[#0FA3A8]">KOJE24</span>?
          </h2>
          <div className="flex items-center gap-3">
            <TulisTestimoniForm />
            <a
              href="/testimoni"
              className="text-[#0FA3A8] font-medium hover:underline hover:text-[#0DC1C7] transition-colors"
            >
              Lihat Semua →
            </a>
          </div>
        </div>

        {/* 🔹 Marquee Carousel */}
        <Marquee pauseOnHover gradient={false} speed={35}>
          {testimonials.map((t, i) => (
  <div
    key={i}
    className="mx-3 min-w-[300px] sm:min-w-[340px] bg-white border border-[#e6eeee]/70 rounded-3xl p-6 shadow-[0_3px_15px_rgba(0,0,0,0.05)] hover:shadow-[0_6px_25px_rgba(15,163,168,0.1)] transition-all duration-300"
  >
    {/* Nama */}
    <h3 className="font-playfair text-lg font-semibold text-[#0B4B50]">
      {t.nama || "-"}
    </h3>

    {/* Kota */}
    <p className="text-sm text-gray-500 mb-1">{t.kota || "-"}</p>

    {/* Varian & Rating sejajar */}
    <div className="flex items-center justify-between text-sm mb-3">
      <p className="italic text-[#0FA3A8]">{t.varian || "-"}</p>
      <span className="text-[#E8C46B] text-base">
        {"★".repeat(Math.max(1, Math.min(5, Number(t.rating) || 5)))}
      </span>
    </div>

    {/* Pesan */}
    <p className="italic text-gray-700 leading-relaxed text-[15px] line-clamp-3">
      “{t.pesan || ""}”
    </p>
  </div>
))}
        </Marquee>

        {/* Footer caption */}
        <div className="text-center mt-14">
          <p className="font-inter text-gray-600 text-base md:text-lg leading-relaxed max-w-2xl mx-auto">
            Bergabunglah dengan{" "}
            <span className="text-[#0FA3A8] font-semibold">ratusan pelanggan</span> yang
            sudah merasakan manfaat alami KOJE24 — segar, sehat, dan seimbang setiap hari 🍃
          </p>
        </div>
      </div>
    </section>
  )
}
