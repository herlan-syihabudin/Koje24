import Image from "next/image"
import { motion, useScroll, useTransform } from "framer-motion"
import { useState } from "react"
import { useMediaQuery } from "@/hooks/useMediaQuery"

const COLORS = {
  primary: "#0FA3A8",
  primaryHover: "#0DC1C7",
  dark: "#020507"
}

export default function Hero() {
  const [loaded, setLoaded] = useState(false)
  const { scrollY } = useScroll()
  const isMobile = useMediaQuery("(max-width: 768px)")

  // ✅ SEMUA useTransform DIPANGGIL DI TOP LEVEL (BENAR)
  const yDesktop = useTransform(scrollY, [0, 400], [0, 110])
  const glowYDesktop = useTransform(scrollY, [0, 350], [0, 60])
  const opacity = useTransform(scrollY, [0, 200], [1, 0.88])
  
  // CTA transforms - pakai range yang berbeda untuk mobile/desktop
  const ctaOpacity = useTransform(
    scrollY, 
    [0, isMobile ? 60 : 100], 
    [1, 0]
  )
  const ctaY = useTransform(
    scrollY, 
    [0, isMobile ? 60 : 100], 
    [0, -24]
  )
  const ctaBlur = useTransform(
    scrollY, 
    [0, isMobile ? 60 : 100], 
    ["blur(0px)", "blur(10px)"]
  )

  // ✅ Conditional values (ini aman karena bukan hook)
  const y = isMobile ? 0 : yDesktop
  const glowY = isMobile ? 0 : glowYDesktop

  // ✅ Content animation variants (ini object biasa, bukan hook)
  const contentVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: (custom = 0) => ({
      opacity: 1,
      y: 0,
      transition: { duration: 0.6, delay: custom * 0.1 }
    })
  }

  return (
    <section className="relative min-h-screen w-full flex items-center bg-[#020507] overflow-hidden">
      
      {/* SEO H1 */}
      <h1 className="sr-only">
        Cold-Pressed Healthy Juice untuk Detox, Imunitas, dan Energi Harian | KOJE24 Jakarta
      </h1>

      {/* BACKGROUND IMAGE */}
      <motion.div 
        style={{ y, opacity }} 
        className="absolute inset-0"
      >
        <picture>
          <source srcSet="/image/hero2.webp" type="image/webp" />
          <Image
            src="/image/hero2.png"
            alt="KOJE24 Cold Pressed Healthy Juice - 100% natural cold-pressed juice for detox and immunity"
            fill
            priority
            quality={75}
            sizes="100vw"
            className="object-cover object-center md:object-right"
            onLoad={() => setLoaded(true)}
          />
        </picture>

        {/* Fade-in overlay */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={loaded ? { opacity: 1 } : {}}
          transition={{ duration: 0.8 }}
          className="absolute inset-0 bg-gradient-to-br from-black/85 via-black/60 to-transparent"
        />
      </motion.div>
      
      {/* LIGHT EFFECTS */}
      <motion.div
        style={{ y: glowY }}
        className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent blur-[100px] opacity-20 pointer-events-none"
      />

      {/* NOISE TEXTURE */}
      <div className="absolute inset-0 opacity-[0.04] bg-[url('/noise.png')] mix-blend-overlay pointer-events-none" />

      {/* CONTENT */}
      <motion.div 
        initial="hidden"
        animate="visible"
        variants={contentVariants} // ✅ Pake variants di parent
        className="relative z-10 px-6 md:px-20 lg:px-32 w-full max-w-5xl"
      >
        {/* BADGE - PAKE VARIANTS DARI PARENT */}
        <motion.p 
          variants={contentVariants}
          custom={0}
          className="text-[#0FA3A8] text-sm tracking-[0.28em] uppercase mb-4 font-medium"
        >
          ⚡ 100% NATURAL • COLD-PRESSED
        </motion.p>

        {/* HEADLINE */}
        <motion.h2
          variants={contentVariants}
          custom={1}
          className="font-playfair font-semibold text-white leading-[1.05] text-[2.7rem] sm:text-[3.4rem] md:text-[4.3rem] drop-shadow-[0_10px_30px_rgba(0,0,0,0.85)]"
        >
          Explore the Taste,
          <span className="block text-[#0FA3A8]">Explore the World</span>
        </motion.h2>

        {/* DESCRIPTION */}
        <motion.p
          variants={contentVariants}
          custom={2}
          className="font-inter text-white/80 max-w-xl text-[1rem] sm:text-[1.2rem] mt-6 leading-relaxed"
        >
          Cold-pressed juice harian dari bahan alami terbaik untuk detox,
          daya tahan tubuh, dan energi. <strong className="text-white">Tanpa gula, tanpa pengawet.</strong> 
          Dibuat fresh setiap hari oleh KOJE24 di Jakarta & Tangerang.
        </motion.p>

        {/* STATS */}
        <motion.div
          variants={contentVariants}
          custom={3}
          className="flex flex-wrap gap-4 md:gap-6 mt-4 text-white/60 text-sm"
        >
          <span className="flex items-center gap-1">✓ 100% Natural</span>
          <span className="flex items-center gap-1">✓ No Sugar Added</span>
          <span className="flex items-center gap-1">✓ Fresh Daily</span>
        </motion.div>

        {/* CTA */}
        <motion.div
          style={{
            opacity: ctaOpacity,
            y: ctaY,
            filter: ctaBlur,
          }}
          variants={contentVariants}
          custom={4}
          className="mt-8"
        >
          <a
            href="#produk"
            className="inline-block bg-[#0FA3A8] hover:bg-[#0DC1C7] text-white font-semibold px-8 md:px-10 py-3 md:py-4 rounded-full shadow-xl transition-all duration-300 hover:scale-105 active:scale-95 focus:ring-4 focus:ring-[#0FA3A8]/50"
            aria-label="Lihat produk cold-pressed juice KOJE24"
          >
            Coba Sekarang
          </a>
        </motion.div>
      </motion.div>

      {/* BOTTOM FADE */}
      <div className="absolute bottom-0 left-0 w-full h-20 bg-gradient-to-t from-[#f8fcfc]/30 to-transparent pointer-events-none" />
    </section>
  )
}
