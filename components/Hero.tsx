"use client"

import Image from "next/image"
import { motion, useScroll, useTransform } from "framer-motion"
import { useState } from "react"

export default function Hero() {
  const { scrollY } = useScroll()

  const y = useTransform(scrollY, [0, 400], [0, 120])
  const opacity = useTransform(scrollY, [0, 250], [1, 0.85])

  const [loaded, setLoaded] = useState(false)

  return (
    <section className="relative w-full h-[95vh] md:h-[100vh] flex items-center overflow-hidden bg-black">
      {/* Background gradient soft */}
      <motion.div
        style={{ y, opacity }}
        className="absolute inset-0 w-full h-full"
      >
        <Image
          src="/image/hero2.png"
          alt="KOJE24 Background"
          fill
          priority
          quality={95}
          className={`object-cover object-center transition-all duration-[1500ms] ${
            loaded ? "scale-100 opacity-100" : "scale-110 opacity-0"
          }`}
          onLoadingComplete={() => setLoaded(true)}
        />
      </motion.div>

      {/* Layer gelap ke kiri biar teks terbaca */}
      <div className="absolute inset-0 bg-gradient-to-r from-black/85 via-black/60 to-black/0 pointer-events-none" />

      {/* Glow premium Kanan */}
      <div className="absolute top-1/3 right-10 h-72 w-72 rounded-full bg-teal-400/20 blur-[120px]" />
      <div className="absolute bottom-10 right-32 h-56 w-56 rounded-full bg-emerald-400/20 blur-[90px]" />

      {/* CONTENT WRAPPER */}
      <div className="relative z-20 flex w-full flex-col md:flex-row items-center justify-between px-8 md:px-20 lg:px-32 pt-10">

        {/* LEFT TEXT BLOCK */}
        <div className="max-w-xl space-y-6">
          <motion.h1
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1.2, ease: "easeOut" }}
            className="font-playfair text-[2.7rem] sm:text-[3.1rem] md:text-[4rem] font-semibold leading-[1.05] text-white drop-shadow-[0_4px_20px_rgba(0,0,0,0.55)]"
          >
            <span className="block">Explore the Taste,</span>
            <span className="block text-[#CFF8F8]">Explore the World</span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 1 }}
            className="text-white/85 font-inter text-[1rem] sm:text-lg leading-relaxed max-w-md"
          >
            KOJE24 dibuat dari bahan alami tanpa gula tambahan & tanpa pengawet.
            Cold-pressed setiap hari untuk menjaga nutrisi tetap utuh.
          </motion.p>

          {/* Selling Points Premium */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
            {[
              { title: "Tanpa Gula", sub: "Manis alami buah" },
              { title: "Cold-Pressed", sub: "Nutrisi tetap utuh" },
              { title: "Fresh Daily", sub: "Diproduksi harian" },
            ].map((item, idx) => (
              <div
                key={idx}
                className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 backdrop-blur-sm"
              >
                <p className="text-teal-200 text-[0.85rem] font-semibold">
                  {item.title}
                </p>
                <p className="text-gray-300/80 text-[11px] mt-1">{item.sub}</p>
              </div>
            ))}
          </div>

          {/* CTA */}
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 1 }}
            className="pt-4"
          >
            <a
              href="#produk"
              className="inline-block bg-[#0FA3A8] hover:bg-[#0B4B50] text-white font-semibold px-8 py-3 rounded-full shadow-lg shadow-[#0FA3A8]/40 backdrop-blur-sm transition-all duration-500 hover:scale-105 active:scale-95 focus:ring-2 focus:ring-[#0FA3A8]/60"
            >
              Lihat 6 Varian KOJE24
            </a>
          </motion.div>
        </div>

        {/* RIGHT PRODUCT VISUAL */}
        <motion.div
          initial={{ opacity: 0, y: 25 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7, duration: 1 }}
          className="relative w-[260px] sm:w-[320px] md:w-[380px] mt-12 md:mt-0 px-6"
        >
          {/* Glow belakang botol */}
          <div className="absolute inset-0 -z-10 blur-[80px] bg-teal-300/30 rounded-full" />

          {/* BOTOL */}
          <Image
            src="/image/botol-demo.png" 
            alt="KOJE24 Bottle"
            width={600}
            height={600}
            className="drop-shadow-[0_30px_60px_rgba(0,0,0,0.75)] object-contain"
            priority
          />
        </motion.div>
      </div>

      {/* Fade bawaan ke putih section berikut */}
      <div className="absolute bottom-0 left-0 w-full h-28 bg-gradient-to-t from-[#f8fcfc] via-[#f8fcfc]/70 to-transparent pointer-events-none" />
    </section>
  )
}
