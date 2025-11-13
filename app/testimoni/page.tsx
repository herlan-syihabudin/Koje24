"use client"
import { useEffect, useState } from "react"
import TulisTestimoniForm from "../../components/TulisTestimoniForm"

export default function SemuaTestimoni() {
  const [data, setData] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const API_URL = "/api/testimonial"

  useEffect(() => {
    const run = async () => {
      try {
        const res = await fetch(API_URL, { cache: "no-store" })
        const json = await res.json()
        setData(json.reverse())
      } finally {
        setLoading(false)
      }
    }
    run()
  }, [])

  return (
    <section className="py-16 bg-[#f6fbfb] min-h-screen">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* 🔹 Judul */}
        <h1 className="text-3xl md:text-4xl font-bold text-[#0B4B50] mb-10 text-center">
          Semua Testimoni <span className="text-[#0FA3A8]">KOJE24</span>
        </h1>

        {/* 🔹 Tombol tulis testimoni */}
        <div className="flex justify-center mb-10">
          <TulisTestimoniForm onSuccess={() => window.location.reload()} />
        </div>

        {/* 🔹 Loader & Data */}
        {loading ? (
          <p className="text-center text-gray-500">Memuat testimoni...</p>
        ) : data.length === 0 ? (
          <p className="text-center text-gray-500">Belum ada testimoni 😇</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-7 md:gap-8">
            {data.map((t, i) => (
              <div
                key={i}
                className="bg-white border border-[#e6eeee]/70 rounded-3xl p-6 shadow-[0_3px_15px_rgba(0,0,0,0.05)] hover:shadow-[0_6px_25px_rgba(15,163,168,0.1)] transition-all duration-300"
              >
                {/* 🔹 Nama */}
                <h3 className="font-playfair text-lg font-semibold text-[#0B4B50]">
                  {t.nama || "-"}
                </h3>

                {/* 🔹 Kota */}
                <p className="text-sm text-gray-500 mb-1">
                  {t.kota || "-"}
                </p>

                {/* 🔹 Varian + Rating sejajar */}
                <div className="flex items-center justify-between text-sm mb-3">
                  <p className="italic text-[#0FA3A8]">{t.varian || "-"}</p>
                  <span className="text-[#E8C46B] text-base">
                    {"★".repeat(Math.max(1, Math.min(5, Number(t.rating) || 5)))}
                  </span>
                </div>

                {/* 🔹 Pesan */}
                <p className="italic text-gray-700 leading-relaxed text-[15px]">
                  “{t.pesan || ""}”
                </p>
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  )
}
