"use client"

import { motion } from "framer-motion"
import Image from "next/image"
import Link from "next/link"
import { useState, useEffect } from "react"

export default function KenapaKOJE() {
  const [showScrollTop, setShowScrollTop] = useState(false)

  useEffect(() => {
    const handleScroll = () => {
      setShowScrollTop(window.scrollY > 300)
    }
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const handleCtaClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault()
    if (window.location.pathname !== '/') {
      window.location.href = '/#produk'
    } else {
      const element = document.getElementById('produk')
      if (element) {
        element.scrollIntoView({ behavior: 'smooth' })
      }
    }
  }

  return (
    <>
      <main className="min-h-screen bg-gradient-to-b from-[#f8fcfc] via-[#eef8f8] to-[#e4f3f3] text-[#0B4B50] relative overflow-hidden pt-24">
        {/* Aura Background */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute -top-40 left-0 w-80 h-80 bg-[#0FA3A8]/15 blur-[110px] rounded-full" />
          <div className="absolute bottom-0 right-0 w-96 h-96 bg-[#E8C46B]/20 blur-[120px] rounded-full" />
        </div>

        <div className="relative max-w-7xl mx-auto px-6 md:px-10 lg:px-20 py-12 space-y-24">
          {/* BREADCRUMB - FITUR BARU */}
          <div className="text-sm text-gray-500">
            <Link href="/" className="hover:text-[#0FA3A8] transition">Beranda</Link>
            <span className="mx-2">/</span>
            <span className="text-[#0FA3A8]">Tentang KOJE24</span>
          </div>

          {/* HERO SECTION - KONTEN ASLI */}
          <motion.section
            initial={{ opacity: 0, y: 26 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, ease: "easeOut" }}
            className="grid md:grid-cols-2 gap-12 items-center"
          >
            <div>
              <span className="inline-flex items-center gap-2 rounded-full bg-white/70 border border-[#d7ecec] px-5 py-1 text-xs font-semibold text-[#0FA3A8] shadow-sm">
                <span className="w-1.5 h-1.5 bg-[#0FA3A8] rounded-full" />
                Kenapa Memilih KOJE24?
              </span>

              <h1 className="font-playfair text-4xl md:text-5xl font-semibold leading-tight mt-4 mb-4">
                KOJE24 dibuat dengan <span className="text-[#0FA3A8]">niat & standar tinggi</span>.
              </h1>

              <p className="text-gray-600 text-base md:text-lg leading-relaxed max-w-xl mb-6">
                Bukan sekadar jus — KOJE24 adalah <b>premium cold-pressed juice</b>  
                yang diracik untuk mendukung energi, imun, metabolisme, pencernaan,  
                dan mood kamu setiap hari. Tanpa gula tambahan, tanpa pengawet,  
                dan tanpa bahan "nakalin".
              </p>

              <div className="flex gap-3 flex-wrap">
                <span className="px-4 py-2 bg-white border border-[#dceeee] rounded-full text-xs shadow-sm">
                  🍃 100% Natural
                </span>
                <span className="px-4 py-2 bg-white border border-[#dceeee] rounded-full text-xs shadow-sm">
                  💧 Cold-Pressed
                </span>
                <span className="px-4 py-2 bg-white border border-[#dceeee] rounded-full text-xs shadow-sm">
                  🌿 No Sugar • No Preservatives
                </span>
              </div>
            </div>

            <motion.div
              initial={{ opacity: 0, x: 35 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.7, delay: 0.1 }}
              className="relative h-[360px] md:h-[480px] rounded-3xl overflow-hidden shadow-[0_20px_55px_rgba(15,163,168,0.25)]"
            >
              <Image
                src="/image/koje.png"
                alt="KOJE24 Premium Cold Pressed Juice"
                fill
                className="object-cover scale-[1.04] hover:scale-[1.07] transition-transform duration-[1600ms]"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent" />
            </motion.div>
          </motion.section>

          {/* SOCIAL PROOF - FITUR BARU */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className="flex justify-center gap-8 md:gap-16 text-center py-8 border-y border-[#d7ecec]"
          >
            <div>
              <div className="text-2xl md:text-3xl font-bold text-[#0FA3A8]">5000+</div>
              <div className="text-xs text-gray-500">Happy Customers</div>
            </div>
            <div>
              <div className="text-2xl md:text-3xl font-bold text-[#0FA3A8]">100%</div>
              <div className="text-xs text-gray-500">Natural Ingredients</div>
            </div>
            <div>
              <div className="text-2xl md:text-3xl font-bold text-[#0FA3A8]">Fresh</div>
              <div className="text-xs text-gray-500">Daily Production</div>
            </div>
          </motion.div>

          {/* SECTION 1 — Nilai Utama KOJE24 - KONTEN ASLI */}
          <motion.section
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-120px" }}
            transition={{ duration: 0.6 }}
            className="space-y-10"
          >
            <h2 className="font-playfair text-3xl md:text-4xl font-semibold text-[#0B4B50]">
              Dibuat dengan prinsip <span className="text-[#0FA3A8]">kualitas & transparansi</span>.
            </h2>

            <div className="grid md:grid-cols-3 gap-7">
              {[
                {
                  title: "Cold-Pressed Technology",
                  desc: "Tanpa panas, tanpa oksidasi. Nutrisi buah & sayur terkunci maksimal.",
                },
                {
                  title: "Zero Sugar • Zero Preservatives",
                  desc: "Tidak ada campuran air, gula rafinasi, pewarna atau pemanis buatan.",
                },
                {
                  title: "Premium Ingredients Only",
                  desc: "Semua bahan dipilih, dicuci, dan diproses hanya dari yang paling segar.",
                },
              ].map((item, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 18 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: i * 0.08 }}
                  className="bg-white/80 border border-[#ddeeee] rounded-3xl p-6 shadow-[0_8px_28px_rgba(11,75,80,0.07)]"
                >
                  <h3 className="font-playfair text-xl text-[#0B4B50] font-semibold mb-2">
                    {item.title}
                  </h3>
                  <p className="text-gray-600 text-sm leading-relaxed">{item.desc}</p>
                </motion.div>
              ))}
            </div>
          </motion.section>

          {/* SECTION 2 — Filosofi Racikan - KONTEN ASLI */}
          <motion.section
            initial={{ opacity: 0, y: 26 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-120px" }}
            transition={{ duration: 0.6 }}
            className="grid md:grid-cols-2 gap-10 items-center"
          >
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6 }}
            >
              <h2 className="font-playfair text-3xl md:text-4xl font-semibold mb-4">
                Racikan yang <span className="text-[#0FA3A8]">terukur & purposeful</span>.
              </h2>
              <p className="text-gray-600 text-base leading-relaxed mb-5">
                Setiap varian KOJE24 tidak dibuat asal-asalan.  
                Ada fungsi dan tujuan di balik setiap botol untuk memenuhi kebutuhan tubuh kamu:
              </p>

              <ul className="space-y-2 text-sm text-[#0B4B50]">
                <li>• Detox & pembuangan racun harian</li>
                <li>• Imun & antioksidan tinggi</li>
                <li>• Pencernaan lebih sehat</li>
                <li>• Energi stabil & clean</li>
                <li>• Kulit lebih cerah dari dalam</li>
              </ul>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6 }}
              className="relative h-[300px] md:h-[380px] rounded-3xl overflow-hidden shadow-[0_15px_45px_rgba(0,0,0,0.15)]"
            >
              <Image
                src="/image/koje-bottles.png"
                alt="KOJE24 Variants"
                fill
                className="object-cover"
              />
            </motion.div>
          </motion.section>

          {/* CTA - KONTEN ASLI dengan onClick yang diperbaiki */}
          <motion.section
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7 }}
          >
            <div className="relative bg-gradient-to-r from-[#0B4B50] via-[#0C6C72] to-[#0FA3A8] text-white p-8 md:p-10 rounded-3xl shadow-[0_18px_65px_rgba(0,0,0,0.25)] overflow-hidden">
              <div className="absolute right-[-80px] inset-y-0 w-64 bg-white/10 blur-3xl" />

              <div className="relative flex flex-col md:flex-row md:items-center md:justify-between gap-5">
                <div>
                  <h2 className="font-playfair text-2xl md:text-3xl font-semibold mb-2">
                    Siap mulai ritual sehat premium kamu?
                  </h2>
                  <p className="text-sm md:text-base text-white/85 max-w-xl">
                    Coba 1–2 botol per hari dan rasakan perubahan nyata dalam 7–14 hari.
                  </p>
                </div>

                <Link
                  href="/#produk"
                  onClick={handleCtaClick}
                  className="inline-flex items-center justify-center px-6 py-3 bg-white text-[#0B4B50] rounded-full text-sm md:text-base font-semibold shadow hover:bg-[#f2faf9] active:scale-[0.97] transition"
                >
                  Lihat Semua Varian KOJE24 →
                </Link>
              </div>
            </div>
          </motion.section>
        </div>
      </main>

      {/* SCROLL TO TOP BUTTON - FITUR BARU */}
      {showScrollTop && (
        <button
          onClick={scrollToTop}
          className="fixed bottom-6 right-6 bg-[#0FA3A8] hover:bg-[#0B4B50] text-white w-10 h-10 rounded-full shadow-lg transition-all duration-300 z-40 flex items-center justify-center"
          aria-label="Scroll to top"
        >
          ↑
        </button>
      )}
    </>
  )
}
