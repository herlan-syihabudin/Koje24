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
    <section className="py-20 bg-[#f6fbfb] min-h-screen">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">

        {/* HEADER PREMIUM */}
        <div className="text-center mb-14">
          <div className="text-[#0FA3A8] text-xs tracking-[0.3em] font-semibold mb-3">
            SEMUA ULASAN
          </div>

          <h1 className="text-3xl md:text-4xl font-playfair font-bold text-[#0B4B50]">
            Semua Testimoni <span className="text-[#0FA3A8]">KOJE24</span>
          </h1>

          <p className="text-gray-500 text-sm max-w-xl mx-auto mt-3">
            Terima kasih kepada seluruh pelanggan yang telah berbagi pengalaman
            setelah menikmati KOJE24. 💚
          </p>

          <div className="w-28 h-[2px] bg-gradient-to-r from-[#0FA3A8] via-[#E8C46B] to-[#0FA3A8] mx-auto mt-6 rounded-full" />
        </div>

        {/* BUTTON TULIS TESTIMONI */}
        <div className="flex justify-center mb-12">
          <div className="scale-[1.05] hover:scale-[1.08] transition-all">
            <TulisTestimoniForm onSuccess={() => window.location.reload()} />
          </div>
        </div>

        {/* CONTENT */}
        {loading ? (
          <p className="text-center text-gray-500">Memuat testimoni...</p>
        ) : data.length === 0 ? (
          <p className="text-center text-gray-500">
            Belum ada testimoni yang aktif. 😇
          </p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
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
                  className="
                    bg-white/95 
                    backdrop-blur-sm 
                    border border-[#E5EFEF] 
                    rounded-3xl 
                    p-6 
                    shadow-[0_12px_40px_rgba(15,163,168,0.08)]
                    hover:shadow-[0_20px_55px_rgba(15,163,168,0.15)]
                    transition-all duration-300
                  "
                >
                  {/* HEADER */}
                  <div className="flex items-center gap-3 mb-4">
                    {t.img ? (
                      <img
                        src={t.img}
                        alt={t.nama}
                        className="w-12 h-12 rounded-full object-cover shadow-md border border-white"
                      />
                    ) : (
                      <div className="w-12 h-12 rounded-full bg-gradient-to-br from-[#0FA3A8] to-[#0B4B50] text-white flex items-center justify-center font-semibold shadow-md uppercase">
                        {initials}
                      </div>
                    )}

                    <div className="flex-1">
                      <h3 className="font-playfair text-lg font-bold text-[#0B4B50] leading-none">
                        {t.nama}
                      </h3>
                      <p className="text-sm text-gray-500">{t.kota}</p>
                    </div>

                    <div className="text-right text-[#F4B400] text-sm leading-none">
                      {"★".repeat(safeRating)}
                      <span className="text-gray-300">
                        {"★".repeat(5 - safeRating)}
                      </span>
                    </div>
                  </div>

                  {/* BADGE VARIAN */}
                  <span className="inline-block mb-2 px-3 py-[3px] text-[11px] font-semibold uppercase tracking-wide bg-[#0FA3A8]/10 text-[#0B4B50] rounded-full">
                    {t.varian}
                  </span>

                  {/* BODY */}
                  <p className="italic text-gray-700 leading-relaxed text-sm">
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
