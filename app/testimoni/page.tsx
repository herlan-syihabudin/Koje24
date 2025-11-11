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
      <div className="max-w-6xl mx-auto px-4">
        <h1 className="text-3xl font-bold text-[#0B4B50] mb-8 text-center">
          Semua Testimoni <span className="text-[#0FA3A8]">KOJE24</span>
        </h1>

        <div className="flex justify-center mb-8">
          <TulisTestimoniForm onSuccess={() => window.location.reload()} />
        </div>

        {loading ? (
          <p className="text-center text-gray-500">Memuat testimoni...</p>
        ) : data.length === 0 ? (
          <p className="text-center text-gray-500">Belum ada testimoni 😇</p>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {data.map((t, i) => (
              <div key={i} className="bg-white p-5 rounded-2xl shadow-sm border border-[#e6eeee]">
                <h3 className="font-semibold text-[#0B4B50] text-lg">{t.nama}</h3>
                <p className="text-sm text-gray-500">{t.kota}</p>
                <p className="text-sm text-[#0FA3A8] italic">{t.varian}</p>
                <p
                  className="mt-3 italic text-gray-700 leading-snug line-clamp-4 overflow-hidden text-ellipsis min-h-[80px]"
                  style={{ display: "-webkit-box", WebkitLineClamp: 4, WebkitBoxOrient: "vertical" }}
                >
                  “{t.pesan}”
                </p>
                <p className="mt-2 text-yellow-400 text-lg">
                  {"★".repeat(Number(t.rating) || 5)}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  )
}
