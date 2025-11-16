"use client"
import Image from "next/image"
import { motion, useScroll, useTransform } from "framer-motion"
import { useState } from "react"

export default function Hero() {
  const { scrollY } = useScroll()
  const y = useTransform(scrollY, [0, 400], [0, 120])
  const opacity = useTransform(scrollY, [0, 250], [1, 0.85])
  const ctaOpacity = useTransform(scrollY, [0, 150, 300], [0, 1, 0])
  const ctaY = useTransform(scrollY, [0, 150], [20, 0])

  const [loaded, setLoaded] = useState(false)

  return (
    <section className="relative min-h-screen w-full overflow-hidden flex items-center justify-start bg-black">

      {/* Background Image Parallax */}
      <motion.div style={{ y, opacity }} className="absolute inset-0 w-full h-full">
        <Image
          src="/image/hero2.png"
          alt="KOJE24 Natural Cold-Pressed Juice"
          fill
          priority
          quality={95}
          className={`object-cover object-center transition-all duration-[1800ms] ease-[cubic-bezier(0.45,0,0.55,1)]
            ${loaded ? "scale-100 opacity-100" : "scale-110 opacity-0"}
          `}
          onLoadingComplete={() => setLoaded(true)}
        />
      </motion.div>

      {/* Premium Gradient / Vignette */}
      <div className="absolute inset-0 bg-gradient-to-br from-black/90 via-black/60 to-black/20 pointer-events-none" />
      <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/30 to-transparent pointer-events-none" />
            {/* Mobile & Tablet Product Highlight */}
      <div className="absolute inset-0 md:hidden bg-gradient-to-t from-black/10 via-transparent to-transparent pointer-events-none" />

      {/* Soft Glow bawah botol (mobile-first) */}
      <div className="absolute bottom-[18%] right-[28%] md:hidden w-60 h-60 bg-teal-200/25 blur-[110px] rounded-full pointer-events-none" />

      {/* Highlight label agar terbaca (mobile + small desktop) */}
      <div className="absolute top-[35%] right-0 w-1/2 h-1/3 
        bg-gradient-to-l from-black/30 via-transparent to-transparent 
        md:bg-gradient-to-l md:from-black/40 md:via-transparent md:to-transparent
        pointer-events-none" />

      {/* Premium Glow */}
      <div className="absolute top-1/4 right-10 w-60 h-60 bg-teal-300/20 blur-[120px] rounded-full" />
      <div className="absolute bottom-20 left-0 w-48 h-48 bg-emerald-400/10 blur-[100px] rounded-full" />
      {/* Vignette Right Extra Depth */}
<div className="absolute inset-y-0 right-0 w-1/3 bg-gradient-to-l from-black/60 to-transparent pointer-events-none" />

      {/* Content */}
      <div className="relative z-10 w-full px-6 md:px-20 lg:px-32 pt-24 md:pt-0">
        <div className="max-w-[46rem]">

          {/* Label Natural */}
          <motion.p
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1, duration: 0.8 }}
            className="text-teal-200/80 text-sm sm:text-base tracking-[0.25em] mb-4 uppercase"
          >
            Natural • Cold-Pressed
          </motion.p>

          {/* Title */}
          <motion.h1
            initial={{ opacity: 0, y: 35 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1.1, ease: "easeOut" }}
            className="font-playfair text-[2.5rem] sm:text-[3.3rem] md:text-[4.6rem] font-semibold text-white leading-[1.05] drop-shadow-[0_4px_20px_rgba(0,0,0,0.6)]"
          >
            Explore the Taste,
            <span className="block text-[#D9FDFE]">Explore the World</span>
          </motion.h1>

          {/* Subtitle */}
          <motion.p
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.25, duration: 0.9 }}
            className="font-inter text-white/90 text-[1rem] sm:text-[1.15rem] max-w-xl leading-relaxed mt-6"
          >
            KOJE24 — cold-pressed juice yang dibuat harian dari bahan lokal terbaik.
            Tanpa gula tambahan, tanpa pengawet. Nutrisi & rasa tetap maksimal.
          </motion.p>

          {/* CTA */}
          <motion.div style={{ opacity: ctaOpacity, y: ctaY }} className="mt-10">
            <a
              href="#produk"
              className="inline-block bg-gradient-to-r from-[#0FA3A8] to-[#0DB0A7] hover:from-[#0B4B50] hover:to-[#0D615C]
                text-white font-semibold px-10 py-4 rounded-full shadow-xl backdrop-blur-md
                transition-all duration-500 hover:scale-[1.07] active:scale-95"
            >
              Coba Sekarang
            </a>
          </motion.div>
        </div>
      </div>

      {/* Soft bottom fade */}
      <div className="absolute bottom-0 left-0 w-full h-24 bg-gradient-to-t from-[#f8fcfc]/95 via-[#f8fcfc]/50 to-transparent pointer-events-none" />
    </section>
  )
}
