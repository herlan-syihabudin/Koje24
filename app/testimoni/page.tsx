"use client"
import { useEffect, useState } from "react"
import TulisTestimoniForm from "../../components/TulisTestimoniForm"

export default function SemuaTestimoni() {
  const [data, setData] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const run = async () => {
      try {
        const res = await fetch("/api/testimonial", { cache: "no-store" })
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
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        
        <h1 className="text-3xl md:text-4xl font-bold text-[#0B4B50] mb-10 text-center">
          Semua Testimoni <span className="text-[#0FA3A8]">KOJE24</span>
        </h1>

        <div className="flex justify-center mb-10">
          <TulisTestimoniForm onSuccess={() => window.location.reload()} />
        </div>

        {loading ? (
          <p className="text-center text-gray-500">Memuat testimoni...</p>
        ) : data.length === 0 ? (
          <p className="text-center text-gray-500">Belum ada testimoni 😇</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-7">
            {data.map((t, i) => (
              <div
                key={i}
                className="bg-white border border-[#e6eeee]/70 rounded-3xl p-6 
                shadow-md hover:shadow-lg transition-all"
              >
                <h3 className="font-playfair text-lg font-semibold text-[#0B4B50]">
                  {t.nama}
                </h3>

                <p className="text-sm text-gray-500 mb-1">{t.kota}</p>

                <div className="flex items-center justify-between mb-2">
                  <p className="italic text-sm text-[#0FA3A8] truncate">{t.varian}</p>
                  <div className="text-yellow-500">
                    {"★".repeat(Math.min(5, Math.max(1, Number(t.rating))))}
                  </div>
                </div>

                <p className="italic text-gray-700 leading-relaxed">“{t.pesan}”</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  )
}
