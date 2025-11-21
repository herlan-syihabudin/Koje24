"use client"
import { useEffect, useState } from "react"
import dynamic from "next/dynamic"
import TulisTestimoniForm from "./TulisTestimoniForm"

const Marquee = dynamic(() => import("react-fast-marquee"), { ssr: false })

type Testimoni = {
  nama: string
  kota: string
  pesan: string
  rating: number
  varian: string
  showOnHome: string
}

export default function TestimoniCarousel() {
  const [data, setData] = useState<Testimoni[]>([])

  useEffect(() => {
    const load = async () => {
      try {
        const res = await fetch("/api/testimonial", { cache: "no-store" })
        const json = await res.json()

        const filtered = json
          .filter((x: any) =>
            ["true", "1", "yes", "ya"].includes(
              String(x.showOnHome).trim().toLowerCase()
            )
          )
          .reverse()

        setData(filtered)
      } catch (err) {
        console.error("Error load testimoni:", err)
      }
    }

    load()
  }, [])

  return (
    <section className="py-24 bg-gradient-to-b from-[#f6fbfb] to-[#eef7f7] relative overflow-hidden">
      <div className="max-w-6xl mx-auto px-6 md:px-10">
        
        <div className="flex justify-between items-center mb-10 flex-wrap gap-3">
          <h2 className="font-playfair text-3xl md:text-4xl font-semibold text-[#0B4B50]">
            Apa kata mereka tentang <span className="text-[#0FA3A8]">KOJE24</span>?
          </h2>

          <div className="flex items-center gap-3">
            <TulisTestimoniForm />
            <a href="/testimoni" className="text-[#0FA3A8] font-medium hover:underline">
              Lihat Semua →
            </a>
          </div>
        </div>

        <Marquee pauseOnHover gradient={false} speed={32}>
          {data.map((t, i) => (
            <div
              key={i}
              className="mx-3 min-w-[280px] sm:min-w-[330px] bg-white border border-[#e6eeee]/70 
              rounded-3xl p-6 shadow-md hover:shadow-lg transition-all"
            >
              <h3 className="font-playfair text-lg font-semibold text-[#0B4B50]">{t.nama}</h3>
              <p className="text-sm text-gray-500">{t.kota}</p>

              <div className="flex items-center justify-between mb-2">
                <p className="italic text-sm text-[#0FA3A8] truncate">{t.varian}</p>
                <div className="text-yellow-500">
                  {"★".repeat(Math.min(5, Math.max(1, Number(t.rating))))}
                </div>
              </div>

              <p className="italic text-gray-700 line-clamp-3">“{t.pesan}”</p>
            </div>
          ))}
        </Marquee>
      </div>
    </section>
  )
}
