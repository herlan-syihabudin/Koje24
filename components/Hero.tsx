"use client"
import Image from "next/image"
import { motion, useScroll, useTransform } from "framer-motion"
import { useState } from "react"

export default function Hero() {
  const { scrollY } = useScroll()

  const y = useTransform(scrollY, [0, 400], [0, 110])
  const opacity = useTransform(scrollY, [0, 200], [1, 0.85])
  const ctaOpacity = useTransform(scrollY, [0, 120], [1, 0])
  const [loaded, setLoaded] = useState(false)

  return (
    <section className="relative min-h-screen w-full flex items-center bg-[#020507] overflow-hidden">

      {/* BG IMAGE PARALLAX */}
      <motion.div style={{ y, opacity }} className="absolute inset-0">
        <Image
          src="/image/hero2.png"
          alt="KOJE24 Premium Juice"
          fill
          priority
          quality={90}
          className="object-cover object-center"
          onLoadingComplete={() => setLoaded(true)}
        />
        <motion.div
          initial={{ opacity: 0.3, scale: 1.08 }}
          animate={loaded ? { opacity: 1, scale: 1 } : {}}
          transition={{ duration: 1.4, ease: "easeOut" }}
          className="absolute inset-0"
        />
      </motion.div>

      {/* DARK VIGNETTE PREMIUM */}
      <div className="absolute inset-0 bg-gradient-to-br from-black/75 via-black/40 to-transparent pointer-events-none" />

      {/* CONTENT */}
      <div className="relative z-10 px-6 md:px-20 lg:px-32 w-full">
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-[#0FA3A8] text-sm tracking-[0.28em] uppercase mb-4"
        >
          NATURAL • COLD-PRESSED
        </motion.p>

        <motion.h1
          initial={{ opacity: 0, y: 35 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1.1 }}
          className="font-playfair text-white font-semibold leading-[1.05]
          text-[2.7rem] sm:text-[3.4rem] md:text-[4.3rem] drop-shadow-xl"
        >
          Explore the Taste,
          <span className="block text-[#0FA3A8]">Explore the World</span>
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 0.15 }}
          className="font-inter text-white/80 max-w-xl text-[1rem] sm:text-[1.2rem] mt-6 leading-relaxed"
        >
          Cold-pressed juice harian dari bahan alami terbaik. Tanpa gula tambahan
          dan tanpa pengawet. Nutrisi tetap maksimal.
        </motion.p>

        <motion.div style={{ opacity: ctaOpacity }} className="mt-10">
          <a
            href="#produk"
            className="inline-block bg-[#0FA3A8] hover:bg-[#0DC1C7]
            text-white font-semibold px-10 py-4 rounded-full shadow-2xl
            transition-all duration-300 hover:scale-[1.05]"
          >
            Coba Sekarang
          </a>
        </motion.div>
      </div>

      {/* ULTRA SOFT PREMIUM BOTTOM FADE */}
<div className="
  absolute bottom-0 left-0 w-full h-32
  bg-gradient-to-t
  from-[#f8fcfc]/80 via-transparent to-transparent
  opacity-90
  pointer-events-none
" />
    </section>
  )
}
