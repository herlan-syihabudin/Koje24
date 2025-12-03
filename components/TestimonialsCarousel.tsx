"use client"

import { useEffect, useState } from "react"
import { motion, AnimatePresence } from "framer-motion"

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

function toBool(v: any) {
  return ["true", "1", "yes", "ya"].includes(String(v).trim().toLowerCase())
}

const AUTO_INTERVAL = 6000 // 6 detik

export default function TestimonialsCarousel() {
  const [items, setItems] = useState<Testi[]>([])
  const [index, setIndex] = useState(0)

  useEffect(() => {
    const run = async () => {
      try {
        const res = await fetch("/api/testimonial", { cache: "no-store" })
        const json = await res.json()

        const filtered: Testi[] = json
          .filter(
            (x: any) => toBool(x.active) && toBool(x.showOnHome)
          )
          .sort((a: any, b: any) => {
            const ra = Number(a.rating || 0)
            const rb = Number(b.rating || 0)
            const pa = a.img ? 1 : 0
            const pb = b.img ? 1 : 0
            return rb - ra || pb - pa
          })

        setItems(filtered)
      } catch (e) {
        console.error(e)
      }
    }
    run()
  }, [])

  useEffect(() => {
    if (items.length <= 1) return
    const id = setInterval(() => {
      setIndex((prev) => (prev + 1) % items.length)
    }, AUTO_INTERVAL)
    return () => clearInterval(id)
  }, [items.length])

  if (items.length === 0) return null

  const current = items[index]
  const rating = Math.min(5, Math.max(1, Number(current.rating) || 5))

  return (
    <section className="py-12 bg-[#f6fbfb]">
      <div className="max-w-5xl mx-auto px-4 sm:px-6">
        <div className="flex flex-col md:flex-row items-center gap-8">
          <div className="flex-1">
            <p className="text-xs uppercase tracking-[0.25em] text-[#0FA3A8] mb-2">
              TESTIMONI PELANGGAN
            </p>
            <h2 className="text-2xl md:text-3xl font-bold text-[#0B4B50] mb-3">
              Mereka sudah merasakan manfaat KOJE24
            </h2>
            <p className="text-gray-500 text-sm">
              Beberapa ulasan pilihan dari pelanggan yang rutin minum KOJE24.
            </p>
          </div>

          <div className="flex-1 relative">
            <AnimatePresence mode="wait">
              <motion.div
                key={current.timestamp}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.35 }}
                className="bg-white rounded-3xl p-6 shadow-[0_16px_50px_rgba(15,163,168,0.15)] border border-[#e8f2f2]"
              >
                <div className="flex items-center gap-4 mb-4">
                  {current.img ? (
                    <img
                      src={current.img}
                      alt={current.nama}
                      className="w-12 h-12 rounded-full object-cover border-2 border-[#B78F3A]/50"
                    />
                  ) : (
                    <div className="w-12 h-12 rounded-full bg-[#0FA3A8]/10 flex items-center justify-center text-sm font-semibold text-[#0B4B50]">
                      {(current.nama || "K")
                        .split(" ")
                        .map((n) => n[0])
                        .join("")
                        .slice(0, 2)}
                    </div>
                  )}

                  <div className="flex-1">
                    <p className="font-semibold text-[#0B4B50]">
                      {current.nama}
                    </p>
                    <p className="text-xs text-gray-500">{current.kota}</p>
                  </div>

                  <div className="flex gap-[2px] text-[#B78F3A] text-sm">
                    {"★".repeat(rating)}
                    <span className="text-gray-300">
                      {"★".repeat(5 - rating)}
                    </span>
                  </div>
                </div>

                <p className="inline-block text-[11px] font-semibold tracking-wide uppercase mb-2 px-2.5 py-1 rounded-full bg-[#0FA3A8]/10 text-[#0FA3A8]">
                  {current.varian}
                </p>

                <p className="italic text-gray-700 text-sm leading-relaxed">
                  “{current.pesan}”
                </p>

                {/* bullets */}
                <div className="flex items-center gap-2 mt-4">
                  {items.map((it, i) => (
                    <button
                      key={it.timestamp}
                      type="button"
                      onClick={() => setIndex(i)}
                      className={`w-2.5 h-2.5 rounded-full transition-all ${
                        i === index
                          ? "bg-[#0FA3A8]"
                          : "bg-gray-300 hover:bg-gray-400"
                      }`}
                    />
                  ))}
                </div>
              </motion.div>
            </AnimatePresence>
          </div>
        </div>
      </div>
    </section>
  )
}
