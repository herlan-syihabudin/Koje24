"use client"
import { useEffect, useState, useCallback } from "react"
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
  active?: string
  img?: string
}

export default function TestimoniCarousel() {
  const [data, setData] = useState<Testimoni[]>([])
  const [loading, setLoading] = useState(true)

  const load = useCallback(async () => {
    try {
      setLoading(true)
      const res = await fetch("/api/testimonial", { cache: "no-store" })
      const json = await res.json()

      const filtered: Testimoni[] = json
        .filter((x: any) =>
          ["true", "1", "yes", "ya"].includes(
            String(x.showOnHome).trim().toLowerCase()
          )
        )
        .filter((x: any) =>
          ["true", "1", "yes", "ya"].includes(
            String(x.active).trim().toLowerCase()
          )
        )
        .reverse()

      setData(filtered)
    } catch (err) {
      console.error("Error load testimoni:", err)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    load()
  }, [load])

  return (
    <section className="py-24 bg-gradient-to-b from-[#f6fbfb] to-[#eef7f7] relative overflow-hidden">
      {/* soft background accent */}
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(15,163,168,0.08),transparent_60%)]" />

      <div className="max-w-6xl mx-auto px-6 md:px-10 relative z-10">
        <div className="flex justify-between items-center mb-10 flex-wrap gap-4">
          <div>
            <p className="text-xs uppercase tracking-[0.2em] text-[#0FA3A8] mb-2">
              TESTIMONI PELANGGAN
            </p>
            <h2 className="font-playfair text-3xl md:text-4xl font-semibold text-[#0B4B50] max-w-xl">
              Apa kata mereka tentang{" "}
              <span className="text-[#0FA3A8]">KOJE24</span>?
            </h2>
          </div>

          <div className="flex items-center gap-3">
            <TulisTestimoniForm onSuccess={load} />
            <a
              href="/testimoni"
              className="text-[#0FA3A8] text-sm md:text-base font-medium hover:underline"
            >
              Lihat semua ulasan →
            </a>
          </div>
        </div>

        {/* state loading / kosong */}
        {loading && (
          <div className="flex gap-4 overflow-x-auto pb-2">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="min-w-[280px] sm:min-w-[330px] bg-white/80 border border-[#e6eeee]/70 rounded-3xl p-6 shadow-sm animate-pulse"
              >
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 rounded-full bg-[#e4f4f4]" />
                  <div className="flex-1 space-y-2">
                    <div className="h-3 w-24 bg-slate-200 rounded" />
                    <div className="h-3 w-16 bg-slate-100 rounded" />
                  </div>
                </div>
                <div className="h-3 w-28 bg-slate-100 rounded mb-3" />
                <div className="space-y-2">
                  <div className="h-3 w-full bg-slate-100 rounded" />
                  <div className="h-3 w-5/6 bg-slate-100 rounded" />
                  <div className="h-3 w-3/4 bg-slate-100 rounded" />
                </div>
              </div>
            ))}
          </div>
        )}

        {!loading && data.length === 0 && (
          <p className="text-center text-gray-500 text-sm">
            Belum ada testimoni yang ditampilkan di beranda. 🙌
          </p>
        )}

        {!loading && data.length > 0 && (
          <Marquee pauseOnHover gradient={false} speed={28}>
            {data.map((t, i) => {
              const safeRating = Math.min(5, Math.max(1, Number(t.rating)))
              const initials =
                (t.nama || "")
                  .split(" ")
                  .map((n) => n[0])
                  .join("")
                  .slice(0, 2) || "K"

              return (
                <article
                  key={i}
                  className="mx-3 min-w-[280px] sm:min-w-[330px]"
                >
                  <div
                    className="bg-white/95 border border-[#e6eeee]/80 rounded-3xl p-5 sm:p-6 
                    shadow-[0_16px_40px_rgba(11,75,80,0.10)] hover:shadow-[0_20px_55px_rgba(11,75,80,0.18)] 
                    transition-all duration-300"
                  >
                    {/* header */}
                    <div className="flex items-center gap-3 mb-3">
                      {t.img ? (
                        <img
                          src={t.img}
                          alt={t.nama}
                          className="w-10 h-10 rounded-full object-cover border border-[#e6eeee]"
                        />
                      ) : (
                        <div className="w-10 h-10 rounded-full bg-[#0FA3A8]/10 flex items-center justify-center text-xs font-semibold text-[#0B4B50]">
                          {initials}
                        </div>
                      )}

                      <div className="flex-1">
                        <h3 className="font-playfair text-base sm:text-lg font-semibold text-[#0B4B50]">
                          {t.nama}
                        </h3>
                        <p className="text-xs text-gray-500">{t.kota}</p>
                      </div>

                      <div className="text-right">
                        <div className="text-[11px] uppercase tracking-wide text-gray-400">
                          Rating
                        </div>
                        <div className="text-[13px] text-yellow-500 leading-none">
                          {"★".repeat(safeRating)}
                          <span className="text-gray-300">
                            {"★".repeat(5 - safeRating)}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* body */}
                    <p className="text-[11px] uppercase tracking-[0.16em] text-[#0FA3A8] mb-1">
                      {t.varian}
                    </p>

                    <p className="text-sm text-gray-700 leading-relaxed line-clamp-4">
                      “{t.pesan}”
                    </p>
                  </div>
                </article>
              )
            })}
          </Marquee>
        )}
      </div>
    </section>
  )
}
