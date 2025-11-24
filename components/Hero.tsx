"use client"
import Image from "next/image"
import { motion, useScroll, useTransform } from "framer-motion"
import { useState, useEffect } from "react"

export default function Hero() {
  const { scrollY } = useScroll()
  const [loaded, setLoaded] = useState(false)

  // Disable parallax for mobile
  const [isMobile, setIsMobile] = useState(false)
  useEffect(() => {
    setIsMobile(window.innerWidth < 768)
  }, [])

  const y = useTransform(scrollY, [0, 400], [0, isMobile ? 0 : 110])
  const glowY = useTransform(scrollY, [0, 350], [0, isMobile ? 0 : 60])
  const opacity = useTransform(scrollY, [0, 200], [1, 0.88])

  return (
    <section className="relative min-h-screen w-full flex items-center bg-[#020507] overflow-hidden">

      {/* ==== BACKGROUND IMAGE ==== */}
      <motion.div style={{ y, opacity }} className="absolute inset-0">
        <Image
          src="/image/hero2.png"
          alt="KOJE24 Premium Juice"
          fill
          priority
          quality={95}
          className="object-cover object-right md:object-right object-center"
          onLoadingComplete={() => setLoaded(true)}
        />

        {/* Fade-in smoothing */}
        <motion.div
          initial={{ opacity: 0.4, scale: 1.06 }}
          animate={loaded ? { opacity: 1, scale: 1 } : {}}
          transition={{ duration: 1.4, ease: "easeOut" }}
          className="absolute inset-0"
        />
      </motion.div>

      {/* ==== PREMIUM DARK GRADIENT ==== */}
      <div className="
        absolute inset-0 
        bg-gradient-to-br 
        from-black/85 
        via-black/60 
        to-transparent
        pointer-events-none
      " />

      {/* ==== LIGHT SWEEP (subtle) ==== */}
      <motion.div
        style={{ y: glowY }}
        className="
          absolute inset-0
          bg-gradient-to-r 
          from-transparent 
          via-white/10 
          to-transparent
          blur-[120px]
          opacity-20
          pointer-events-none
        "
      />

      {/* ==== NOISE ==== */}
      <div className="
        absolute inset-0 
        opacity-[0.06]
        bg-[url('/noise.png')] 
        mix-blend-overlay
        pointer-events-none
      " />

      {/* ==== CONTENT ==== */}
      <div className="relative z-10 px-6 md:px-20 lg:px-32 w-full max-w-5xl">

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
          className="
            font-playfair font-semibold text-white leading-[1.05]
            text-[2.7rem] sm:text-[3.4rem] md:text-[4.3rem]
            drop-shadow-[0_8px_25px_rgba(0,0,0,0.8)]
          "
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

        {/* ==== CTA HERO (Fade/Blur Saat Scroll) ==== */}
        <motion.div
          style={{
            opacity: useTransform(scrollY, [0, 120], [1, 0]),
            y: useTransform(scrollY, [0, 120], [0, -20]),
            filter: useTransform(scrollY, [0, 120], ["blur(0px)", "blur(6px)"]),
          }}
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.9, delay: 0.25 }}
          className="mt-10"
        >
          <a
            href="#produk"
            className="
              inline-block bg-[#0FA3A8] hover:bg-[#0DC1C7]
              text-white font-semibold px-10 py-4 rounded-full 
              shadow-xl transition-all duration-300 hover:scale-[1.05]
            "
          >
            Coba Sekarang
          </a>
        </motion.div>

      </div>

      {/* Bottom fade */}
      <div className="
        absolute bottom-0 left-0 w-full h-28
        bg-gradient-to-t from-[#f8fcfc]/75 to-transparent 
        pointer-events-none
      " />
    </section>
  )
}
