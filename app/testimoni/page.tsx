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

        const filtered = json
          .filter((x: any) =>
            ["true", "1", "yes", "ya"].includes(
              String(x.active).trim().toLowerCase()
            )
          )
          .reverse()

        setData(filtered)
      } finally {
        setLoading(false)
      }
    }
    run()
  }, [])

  return (
    <section className="py-16 md:py-20 bg-[#f6fbfb] min-h-screen">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <div className="text-center mb-10">
          <p className="text-xs uppercase tracking-[0.25em] text-[#0FA3A8] mb-2">
            SEMUA ULASAN
          </p>
          <h1 className="text-3xl md:text-4xl font-bold text-[#0B4B50]">
            Semua Testimoni <span className="text-[#0FA3A8]">KOJE24</span>
          </h1>
          <p className="text-gray-500 text-sm max-w-xl mx-auto mt-2">
            Terima kasih untuk semua pelanggan yang sudah berbagi pengalaman
            setelah minum KOJE24. 💚
          </p>
        </div>

        <div className="flex justify-center mb-10">
          <TulisTestimoniForm onSuccess={() => window.location.reload()} />
        </div>

        {loading ? (
          <p className="text-center text-gray-500">Memuat testimoni...</p>
        ) : data.length === 0 ? (
          <p className="text-center text-gray-500">
            Belum ada testimoni yang aktif. 😇
          </p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-7">
            {data.map((t, i) => {
              const safeRating = Math.min(5, Math.max(1, Number(t.rating)))
              const initials =
                (t.nama || "")
                  .split(" ")
                  .map((n: string) => n[0])
                  .join("")
                  .slice(0, 2) || "K"

              return (
                <article
  key={i}
  className="bg-white border border-[#e8f2f2] rounded-3xl p-7
             shadow-[0_12px_40px_rgba(15,163,168,0.08)]
             hover:shadow-[0_22px_65px_rgba(15,163,168,0.18)]
             hover:-translate-y-[3px]
             transition-all duration-300"
>

  {/* header */}
  <div className="flex items-center gap-4 mb-4">
    {t.img ? (
      <img
        src={t.img}
        alt={t.nama}
        className="w-12 h-12 rounded-full object-cover border-2 border-[#B78F3A]/50 shadow-sm"
      />
    ) : (
      <div className="w-12 h-12 rounded-full bg-[#0FA3A8]/10 flex items-center justify-center text-sm font-semibold text-[#0B4B50] border border-[#B78F3A]/40">
        {initials}
      </div>
    )}

    <div className="flex-1">
      <h3 className="font-playfair text-lg font-semibold tracking-wide text-[#0B4B50] leading-none">
        {t.nama}
      </h3>
      <p className="text-[13px] text-gray-500 mt-[2px]">{t.kota}</p>
    </div>

    {/* rating */}
    <div className="flex gap-[2px] text-[#B78F3A]">
      {"★".repeat(safeRating)}
      <span className="text-gray-300">
        {"★".repeat(5 - safeRating)}
      </span>
    </div>
  </div>

  {/* badge varian */}
  <span className="inline-block text-[11px] font-semibold tracking-wide uppercase mb-2 px-2.5 py-1 rounded-full bg-[#0FA3A8]/10 text-[#0FA3A8]">
    {t.varian}
  </span>

  {/* message */}
  <p className="italic text-gray-600 leading-relaxed text-sm">
    “{t.pesan}”
  </p>
</article>
              )
            })}
          </div>
        )}
      </div>
    </section>
  )
}
