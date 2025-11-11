"use client"
import { useEffect, useState } from "react"
import Marquee from "react-fast-marquee"
import TulisTestimoniForm from "./TulisTestimoniForm"

export default function TestimoniCarousel() {
  const [data, setData] = useState<any[]>([])
  const API_URL = "/api/testimonial"

  useEffect(() => {
    const run = async () => {
      try {
        const res = await fetch(API_URL)
        const json = await res.json()
        const filtered = json.filter((x: any) => String(x.showOnHome).toUpperCase() === "TRUE").reverse()
        setData(filtered.slice(0, 5))
      } catch (e) { console.error(e) }
    }
    run()
  }, [])

  return (
    <section className="py-16 bg-[#f6fbfb] relative overflow-hidden">
      <div className="max-w-6xl mx-auto px-4">
        <div className="flex justify-between items-center mb-6 flex-wrap gap-3">
          <h2 className="text-2xl font-bold text-[#0B4B50]">
            Apa kata mereka tentang <span className="text-[#0FA3A8]">KOJE24</span>?
          </h2>
          <div className="flex items-center gap-3">
            <TulisTestimoniForm />
            <a href="/testimoni" className="text-[#0FA3A8] font-medium hover:underline">Lihat Semua →</a>
          </div>
        </div>

        <Marquee pauseOnHover gradient={false} speed={40}>
          {data.map((t, i) => (
            <div key={i} className="mx-3 min-w-[300px] sm:min-w-[350px] bg-white border border-[#e6eeee] rounded-2xl p-5 shadow-sm">
              <h3 className="font-semibold text-[#0B4B50] text-lg">{t.nama}</h3>
              <p className="text-sm text-gray-500">{t.kota}</p>
              <p className="text-sm text-[#0FA3A8] italic">{t.varian}</p>
              <p className="mt-3 italic text-gray-700 leading-snug line-clamp-3 overflow-hidden text-ellipsis min-h-[60px]"
                 style={{ display: "-webkit-box", WebkitLineClamp: 3, WebkitBoxOrient: "vertical" }}>
                “{t.pesan}”
              </p>
              <p className="mt-2 text-yellow-400 text-lg">{"★".repeat(Number(t.rating) || 5)}</p>
            </div>
          ))}
        </Marquee>
      </div>
    </section>
  )
}
