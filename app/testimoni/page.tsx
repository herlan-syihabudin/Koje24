// app/testimoni/page.tsx
"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { motion } from "framer-motion"
import TulisTestimoniForm from "@/components/TulisTestimoniForm"

type Testi = {
  timestamp: string
  nama: string
  kota: string
  pesan: string
  rating: number | string
  varian: string
  img?: string
  active?: string | boolean
  showOnHome?: string | boolean
}

// helper: normalisasi boolean dari Google Sheet
function toBool(v: any) {
  return ["true", "1", "yes", "ya"].includes(String(v).trim().toLowerCase())
}

// helper: slug basic untuk SEO URL (nama + timestamp)
function buildSlug(t: Testi) {
  const safeName = (t.nama || "pelanggan")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")

  return `${encodeURIComponent(t.timestamp)}-${safeName}`
}

export default function SemuaTestimoni() {
  const [data, setData] = useState<Testi[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const run = async () => {
      try {
        const res = await fetch("/api/testimonial", { cache: "no-store" })
        const json = await res.json()

        // hanya ambil yg active = true
        const filtered: Testi[] = json
          .filter((x: any) => toBool(x.active))
          // rating tinggi + ada foto di-prioritaskan di atas
          .sort((a: any, b: any) => {
            const ra = Number(a.rating || 0)
            const rb = Number(b.rating || 0)
            const pa = a.img ? 1 : 0
            const pb = b.img ? 1 : 0
            return rb - ra || pb - pa
          })
          .reverse()

        setData(filtered)
      } finally {
        setLoading(false)
      }
    }
    run()
  }, [])

  // animasi container & card
  const containerVariants = {
    hidden: { opacity: 0, y: 10 },
    show: {
      opacity: 1,
      y: 0,
      transition: { staggerChildren: 0.05, delayChildren: 0.05 },
    },
  }

  const cardVariants = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 },
  }

  return (
    <section className="py-16 md:py-20 bg-[#f6fbfb] min-h-screen">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        {/* HEADER */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="text-center mb-10"
        >
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
        </motion.div>

        {/* CTA TULIS TESTIMONI */}
        <div className="flex justify-center mb-10">
          <TulisTestimoniForm onSuccess={() => window.location.reload()} />
        </div>

        {/* LIST TESTIMONI */}
        {loading ? (
          <p className="text-center text-gray-500">Memuat testimoni...</p>
        ) : data.length === 0 ? (
          <p className="text-center text-gray-500">
            Belum ada testimoni yang aktif. 😇
          </p>
        ) : (
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="show"
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-7"
          >
            {data.map((t, i) => {
              const safeRating = Math.min(5, Math.max(1, Number(t.rating) || 5))
              const initials =
                (t.nama || "")
                  .split(" ")
                  .map((n: string) => n[0])
                  .join("")
                  .slice(0, 2) || "K"

              const slug = buildSlug(t)

              return (
                <motion.article
                  key={i}
                  variants={cardVariants}
                  className="bg-white border border-[#e8f2f2] rounded-3xl p-7
                             shadow-[0_12px_40px_rgba(15,163,168,0.08)]
                             hover:shadow-[0_22px_65px_rgba(15,163,168,0.18)]
                             hover:-translate-y-[3px]
                             transition-all duration-300 group cursor-default"
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
                      <p className="text-[13px] text-gray-500 mt-[2px]">
                        {t.kota}
                      </p>
                    </div>

                    {/* rating */}
                    <div className="flex gap-[2px] text-[#B78F3A] text-sm">
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
                  <p className="italic text-gray-600 leading-relaxed text-sm mb-3">
                    “{t.pesan}”
                  </p>

                  {/* link detail untuk SEO / keperluan share */}
                  <Link
                    href={`/testimoni/${slug}`}
                    className="text-[11px] font-medium text-[#0FA3A8] hover:text-[#0B4B50] underline-offset-2 hover:underline"
                  >
                    Lihat detail ulasan
                  </Link>
                </motion.article>
              )
            })}
          </motion.div>
        )}
      </div>
    </section>
  )
}
