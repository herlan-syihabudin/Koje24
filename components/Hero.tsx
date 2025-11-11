"use client"
import Image from "next/image"
import { motion, useScroll, useTransform } from "framer-motion"
import { useState } from "react"

export default function Hero() {
  const { scrollY } = useScroll()

  const y = useTransform(scrollY, [0, 400], [0, 120])
  const opacity = useTransform(scrollY, [0, 250], [1, 0.85])
  const ctaOpacity = useTransform(scrollY, [0, 150, 300], [0, 1, 0])
  const ctaY = useTransform(scrollY, [0, 150], [30, 0])

  const [loaded, setLoaded] = useState(false)

  return (
    <section className="relative h-[90vh] md:h-[100vh] w-full overflow-hidden flex items-center justify-start bg-black">
      {/* Background Parallax */}
      <motion.div style={{ y, opacity }} className="absolute inset-0 w-full h-full">
        <Image
          src="/image/hero2.png"
          alt="KOJE24 Natural Cold-Pressed Juice"
          fill
          priority
          className={`object-cover object-center transition-transform duration-[1500ms] ease-[cubic-bezier(0.45,0,0.55,1)] ${
            loaded ? "scale-100 opacity-100" : "scale-110 opacity-0"
          }`}
          onLoadingComplete={() => setLoaded(true)}
        />
      </motion.div>

      {/* Overlay Gradient */}
      <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/50 to-transparent pointer-events-none" />

      {/* Konten Hero */}
<div className="relative z-10 flex flex-col justify-center text-left w-full px-8 md:px-20 lg:px-32">
  <div className="max-w-[46rem] translate-y-[6vh] md:translate-y-[4vh] lg:translate-y-[2vh] translate-x-[4vw] md:translate-x-[10vw]">
    <motion.h1
      initial={{ opacity: 0, y: 40 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 1.2, ease: "easeOut" }}
      className="font-playfair text-[2.8rem] md:text-[4.6rem] text-white font-semibold leading-[1.05] mb-6 drop-shadow-[0_3px_10px_rgba(0,0,0,0.4)]"
    >
      <span className="block">Explore the Taste,</span>
      <span className="block">Explore the World</span>
    </motion.h1>

    <motion.p
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.3, duration: 1 }}
      className="font-inter text-white/85 text-base md:text-lg leading-relaxed mb-10 max-w-[36rem]"
    >
      Minuman sehat alami tanpa pengawet — dibuat dari bahan segar untuk keseimbangan tubuh dan energi harian.
    </motion.p>

    <motion.div style={{ opacity: ctaOpacity, y: ctaY }}>
      <a
        href="#produk"
        className="inline-block bg-[#0FA3A8] hover:bg-[#0B4B50] text-white font-semibold px-8 py-3 rounded-full shadow-lg backdrop-blur-sm transition-all duration-500 hover:scale-105"
      >
        Lihat Produk
      </a>
    </motion.div>
  </div>
</div>

      {/* Fade bawah */}
      <div className="absolute bottom-0 left-0 w-full h-28 bg-gradient-to-t from-[#f8fcfc] to-transparent pointer-events-none" />
    </section>
  )
}
