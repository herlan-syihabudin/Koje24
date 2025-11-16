"use client"

import { useEffect, useState } from "react"
import Image from "next/image"
import { motion } from "framer-motion"

export default function HeroLuxury() {
  const [showCTA, setShowCTA] = useState(false)

  useEffect(() => {
    const handler = () => {
      if (window.scrollY > 80) setShowCTA(true)
      else setShowCTA(false)
    }
    window.addEventListener("scroll", handler)
    return () => window.removeEventListener("scroll", handler)
  }, [])

  return (
    <header className="relative w-full h-screen min-h-[100vh] overflow-hidden">
      {/* FULLSCREEN IMAGE */}
      <Image
        src="/image/hero-botol.jpg"
        alt="KOJE24 Hero"
        fill
        priority
        className="object-cover object-center"
      />

      {/* PREMIUM GRADIENT OVERLAY */}
      <div className="absolute inset-0 bg-gradient-to-b from-black/70 via-black/30 to-black/80" />

      {/* CENTER CONTENT */}
      <div className="relative z-20 h-full flex flex-col justify-center items-center text-center px-8">
        <motion.h1
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1.1 }}
          className="font-playfair text-white font-bold text-[2.3rem] sm:text-[3rem] md:text-[4rem] leading-tight"
        >
          Wellness, Elevated.
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 0.3 }}
          className="text-gray-300 mt-4 text-base sm:text-lg max-w-md"
        >
          Cold–Pressed Luxury • Crafted Daily
        </motion.p>
      </div>

      {/* CTA muncul saat scrol */}
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={showCTA ? { opacity: 1, y: 0 } : { opacity: 0, y: 24 }}
        transition={{ duration: 0.7 }}
        className="fixed bottom-10 left-1/2 -translate-x-1/2 z-30"
      >
        <a
          href="#produk"
          className="px-7 py-3 rounded-full bg-white text-black font-semibold text-sm sm:text-base
          shadow-[0_10px_35px_rgba(255,255,255,0.25)]
          hover:bg-[#E5FFF8] transition-all duration-300"
        >
          Discover Products →
        </a>
      </motion.div>

      {/* Scroll indicator */}
      <motion.div
        animate={{ y: [0, 8, 0], opacity: [0.4, 1, 0.4] }}
        transition={{ duration: 1.8, repeat: Infinity }}
        className="absolute bottom-6 left-1/2 -translate-x-1/2 text-gray-300 text-xs"
      >
        Scroll
      </motion.div>

    </header>
  )
}
