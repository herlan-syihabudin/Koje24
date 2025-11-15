"use client"

import Image from "next/image"
import { motion, useScroll, useTransform } from "framer-motion"
import { useEffect, useState } from "react"

export default function HeroPremium() {
  // scroll-based subtle parallax
  const { scrollY } = useScroll()
  const bgY = useTransform(scrollY, [0, 600], ["0%", "6%"])
  const bottleY = useTransform(scrollY, [0, 600], ["0px", "40px"])

  // for initial mount reveal fallback for clients that render fast
  const [mounted, setMounted] = useState(false)
  useEffect(() => setMounted(true), [])

  return (
    <header
      aria-label="KOJE24 Hero"
      className="relative w-full min-h-[92vh] md:min-h-[100vh] overflow-hidden bg-[#020507] text-white"
    >
      {/* Background gradient + subtle noise layer */}
      <motion.div
        style={{ y: bgY }}
        className="pointer-events-none absolute inset-0 -z-20"
        aria-hidden
      >
        <div
          className="absolute inset-0 bg-gradient-to-br from-black via-[#021312] to-[#072d2f]"
          style={{ mixBlendMode: "normal" }}
        />
        {/* subtle texture (semi-transparent png in public named noise.png optional) */}
        <div
          className="absolute inset-0 opacity-10"
          style={{
            backgroundImage:
              "url('/image/noise.png')",
            backgroundRepeat: "repeat",
            backgroundSize: "auto",
            mixBlendMode: "overlay",
          }}
        />
      </motion.div>

      {/* Left & Right glow (adaptive: lower opacity on small screens) */}
      <div className="absolute -left-24 top-10 -z-10 hidden md:block">
        <div className="h-80 w-80 rounded-full bg-teal-400/18 blur-[120px]" />
      </div>
      <div className="absolute right-0 bottom-10 -z-10 hidden md:block">
        <div className="h-96 w-96 rounded-full bg-cyan-300/12 blur-[140px]" />
      </div>

      {/* CONTENT GRID */}
      <div className="relative z-10 max-w-7xl mx-auto px-6 sm:px-8 md:px-12 lg:px-20 py-10 md:py-20">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
          {/* LEFT: TEXT BLOCK */}
          <div className="order-2 md:order-1 flex flex-col gap-6 md:gap-8">
            <motion.span
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.9, delay: 0.05 }}
              className="inline-block rounded-full px-3 py-1 text-xs font-medium tracking-widest text-teal-200/90 bg-white/3 w-max"
            >
              NATURAL • COLD-PRESSED
            </motion.span>

            <motion.h1
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 1.0, delay: 0.12 }}
              className="font-playfair font-extrabold text-[2.4rem] sm:text-[2.8rem] md:text-[3.8rem] lg:text-[4.4rem] leading-[1.03] tracking-tight"
              style={{ WebkitFontSmoothing: "antialiased" }}
            >
              Explore the Taste,
              <span className="block text-[#CFF8F8]">Explore the World</span>
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.9, delay: 0.22 }}
              className="text-white/85 max-w-xl text-base sm:text-lg leading-relaxed"
            >
              KOJE24 — cold-pressed juice yang dibuat harian dari bahan lokal terbaik.
              Tanpa gula tambahan, tanpa pengawet. Nutrisi & rasa tetap maksimal.
            </motion.p>

            <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4">
              <motion.a
                initial={{ scale: 0.98, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: 0.34, duration: 0.7, ease: "easeOut" }}
                href="#produk"
                role="button"
                aria-label="Coba Sekarang - lihat varian KOJE24"
                className="inline-flex items-center justify-center rounded-full px-6 py-3 sm:px-8 sm:py-4 text-base sm:text-lg font-semibold bg-gradient-to-r from-[#08B2B6] via-[#0FA3A8] to-[#06D0C9] shadow-[0_12px_40px_rgba(6,178,178,0.16)] focus:outline-none focus-visible:ring-4 focus-visible:ring-[#0FA3A8]/30"
              >
                Coba Sekarang
              </motion.a>

              <motion.a
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.44, duration: 0.7 }}
                href="/#about"
                className="inline-flex items-center gap-2 px-4 py-2 text-sm sm:text-base font-medium text-white/90 rounded-full bg-white/3 hover:bg-white/5 backdrop-blur-sm"
              >
                <span className="inline-block w-3 h-3 rounded-full bg-white/80" aria-hidden />
                Tentang KOJE24
              </motion.a>
            </div>

            {/* Mini features - accessible */}
            <motion.ul
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.52, duration: 0.7 }}
              className="mt-4 grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs text-gray-300"
            >
              <li className="flex flex-col">
                <span className="font-semibold text-teal-200">Tanpa Gula</span>
                <span className="text-gray-400">Rasa alami buah</span>
              </li>
              <li className="flex flex-col">
                <span className="font-semibold text-teal-200">Cold-Pressed</span>
                <span className="text-gray-400">Nutrisi terjaga</span>
              </li>
              <li className="flex flex-col">
                <span className="font-semibold text-teal-200">Fresh Daily</span>
                <span className="text-gray-400">Diproduksi harian</span>
              </li>
            </motion.ul>
          </div>

          {/* RIGHT: PRODUCT VISUAL */}
          <motion.div
            style={{ y: bottleY }}
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.45, duration: 0.9, ease: "easeOut" }}
            className="order-1 md:order-2 flex w-full justify-center md:justify-end"
          >
            <div className="relative flex items-center justify-center w-full max-w-xs sm:max-w-sm md:max-w-md lg:max-w-lg px-6 py-6">
              {/* subtle reflective highlight */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.48, duration: 0.9 }}
                aria-hidden
                className="absolute w-56 h-56 sm:w-64 sm:h-64 md:w-72 md:h-72 rounded-full -z-10 bg-gradient-to-r from-[#0fbdbf]/20 to-[#61e6d9]/8 blur-[70px]"
              />

              {/* floating bottle (gentle hover on desktop) */}
              <motion.div
                whileHover={{ y: -6, scale: 1.02 }}
                animate={mounted ? { y: [0, -8, 0] } : {}}
                transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
                className="relative"
              >
                <Image
                  src="/image/koje.png"
                  alt="Botol KOJE24 - Green Detox"
                  width={520}
                  height={520}
                  className="object-contain drop-shadow-[0_35px_90px_rgba(0,0,0,0.6)]"
                  priority
                />
                {/* decorative badge bottom-left */}
                <div className="absolute left-0 bottom-0 transform -translate-x-4 translate-y-6 bg-white/6 border border-white/8 rounded-full px-3 py-2 text-xs text-teal-100 backdrop-blur-sm">
                  Best Seller • Detox
                </div>
              </motion.div>
            </div>
          </motion.div>
        </div>
      </div>

      {/* scroll hint indicator */}
      <motion.a
        href="#produk"
        aria-hidden={false}
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: [0, 1, 1], y: [8, 0, 0] }}
        transition={{ delay: 0.95, duration: 0.9 }}
        className="absolute left-1/2 -translate-x-1/2 bottom-8 z-30"
      >
        <motion.div
          animate={{ y: [0, 8, 0] }}
          transition={{ duration: 1.6, repeat: Infinity, ease: "easeInOut" }}
          className="flex flex-col items-center gap-2"
        >
          <span className="w-9 h-14 rounded-3xl border border-white/20 flex items-start justify-center p-2">
            <span className="w-2 h-2 rounded-full bg-white/80 block" />
          </span>
          <span className="text-xs text-gray-300">Scroll</span>
        </motion.div>
      </motion.a>

      {/* accessibility: invisible skip link */}
      <a className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-50 bg-white/5 px-3 py-2 rounded" href="#produk">
        Skip to products
      </a>
    </header>
  )
}
