"use client"

import Image from "next/image"
import { motion } from "framer-motion"
import Link from "next/link"
import { useState, useEffect } from "react"

// Constants
const COLORS = {
  primary: "#0FA3A8",
  primaryHover: "#0DC1C7",
  secondary: "#0B4B50",
}

export default function AboutSection() {
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false)

  // Check user motion preference
  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)')
    setPrefersReducedMotion(mediaQuery.matches)
    
    const handler = (e: MediaQueryListEvent) => setPrefersReducedMotion(e.matches)
    mediaQuery.addEventListener('change', handler)
    return () => mediaQuery.removeEventListener('change', handler)
  }, [])

  // Animation variants - lebih smooth
  const textVariants = {
    hidden: { opacity: 0, x: -30 },
    visible: { 
      opacity: 1, 
      x: 0,
      transition: { duration: prefersReducedMotion ? 0 : 0.7, ease: "easeOut" }
    }
  }

  const imageVariants = {
    hidden: { opacity: 0, x: 30 },
    visible: { 
      opacity: 1, 
      x: 0,
      transition: { duration: prefersReducedMotion ? 0 : 0.7, ease: "easeOut", delay: 0.1 }
    }
  }

  return (
    <section className="relative bg-gradient-to-b from-[#f8fcfc] to-[#eef7f7] py-24 md:py-32 overflow-hidden">

      {/* Background Aura */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(15,163,168,0.08),transparent_60%)] pointer-events-none" />

      <div className="max-w-7xl mx-auto grid md:grid-cols-2 gap-14 items-center px-6 md:px-14 lg:px-24 relative z-10">

        {/* TEKS COLUMN */}
        <motion.div
          variants={textVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.3 }}
          className="order-2 md:order-1"
        >
          <h2 className="font-playfair text-4xl md:text-5xl font-semibold text-[#0B4B50] mb-5">
            Kenapa <span className="text-[#0FA3A8]">KOJE24?</span>
          </h2>

          <p className="font-inter text-gray-700 leading-relaxed text-base md:text-lg mb-5">
            KOJE24 adalah <b>premium cold-pressed juice Jakarta</b> untuk mereka yang ingin
            menjaga tubuh tetap fit, segar, dan seimbang — tanpa ribet.
            Dibuat dari buah & sayuran segar pilihan dengan teknologi cold-pressed
            agar nutrisi tetap utuh dan maksimal terserap tubuh.
          </p>

          <p className="font-inter text-gray-600 leading-relaxed text-base md:text-lg mb-8">
            Kami menggabungkan <b>bahan alami</b> dan <b>manfaat nyata</b> seperti imun lebih kuat,
            metabolisme lebih stabil, pencernaan lebih nyaman, dan tubuh terasa lebih ringan.
            <br className="hidden md:block" />
            Ini bukan sekadar jus — ini adalah <b>pengalaman hidup sehat premium</b> 🍃.
          </p>

          {/* BUTTONS */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6 mt-3 mb-5">
            {/* Baca Selengkapnya */}
            <motion.div
              whileHover={prefersReducedMotion ? {} : { scale: 1.05 }}
              whileTap={prefersReducedMotion ? {} : { scale: 0.96 }}
            >
              <Link
                href="/tentang-koje24"
                className="inline-flex items-center gap-2 
                           text-[#0FA3A8] font-semibold text-base md:text-lg 
                           hover:text-[#0DC1C7] transition-colors
                           focus:outline-none focus:ring-2 focus:ring-[#0FA3A8]/50 focus:ring-offset-2 focus:ring-offset-[#f8fcfc] rounded-lg"
                aria-label="Baca selengkapnya tentang KOJE24"
              >
                Baca Selengkapnya
                <span className="text-xl" aria-hidden="true">→</span>
              </Link>
            </motion.div>

            {/* Lihat Manfaat - FIXED LINK */}
            <motion.div
              whileHover={prefersReducedMotion ? {} : { scale: 1.05 }}
              whileTap={prefersReducedMotion ? {} : { scale: 0.96 }}
            >
              <Link
                href="/#manfaat" // Link ke section di homepage
                scroll={false}
                onClick={(e) => {
                  e.preventDefault()
                  const element = document.getElementById('manfaat')
                  if (element) {
                    element.scrollIntoView({ 
                      behavior: prefersReducedMotion ? 'auto' : 'smooth',
                      block: 'start'
                    })
                  }
                }}
                className="bg-[#0FA3A8] text-white font-semibold px-8 py-3 rounded-full 
                           hover:bg-[#0DC1C7] transition-all duration-300 
                           shadow-[0_4px_15px_rgba(15,163,168,0.4)] 
                           hover:shadow-[0_6px_25px_rgba(15,163,168,0.5)] 
                           active:scale-[0.98] 
                           focus:outline-none focus:ring-2 focus:ring-[#0FA3A8]/50 focus:ring-offset-2 focus:ring-offset-[#f8fcfc]
                           inline-block text-center"
            aria-label="Lihat manfaat kesehatan dari KOJE24"
          >
            Lihat Manfaatnya
          </Link>
            </motion.div>
          </div>

          {/* Trust badges - TAMBAHAN */}
          <div className="flex flex-wrap gap-4 mt-8 text-sm text-gray-500">
            <span className="flex items-center gap-1">
              <svg className="w-4 h-4 text-[#0FA3A8]" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              100% Natural
            </span>
            <span className="flex items-center gap-1">
              <svg className="w-4 h-4 text-[#0FA3A8]" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              No Sugar Added
            </span>
            <span className="flex items-center gap-1">
              <svg className="w-4 h-4 text-[#0FA3A8]" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              Fresh Daily
            </span>
          </div>
        </motion.div>

        {/* IMAGE COLUMN */}
        <motion.div
          variants={imageVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.3 }}
          className="relative order-1 md:order-2 h-[340px] md:h-[460px] 
                     rounded-3xl overflow-hidden 
                     shadow-[0_15px_50px_rgba(15,163,168,0.2)]"
        >
          {/* Pake picture element untuk WebP support */}
          <Image
  src="/image/koje.png"
  alt="KOJE24 Cold-Pressed Juice Premium Jakarta"
  fill
  sizes="(max-width: 768px) 100vw, 50vw"
  loading="lazy"
  quality={70}
  placeholder="blur"
  blurDataURL="/image/koje-blur.jpg"
  className="object-cover scale-[1.05] transition-transform duration-700 ease-out hover:scale-[1.08]"
/>
          
          {/* Gradient overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent 
                          group-hover:from-black/30 transition-all duration-700" 
          />
          
          {/* Decorative badge - TAMBAHAN */}
          <div className="absolute bottom-4 left-4 bg-white/90 backdrop-blur-sm px-4 py-2 rounded-full 
                          shadow-lg text-sm font-medium text-[#0B4B50]">
            ⭐ 100% Natural
          </div>
        </motion.div>
      </div>

      {/* Decorative elements - TAMBAHAN */}
      <div className="absolute bottom-0 right-0 w-64 h-64 bg-[#0FA3A8]/5 rounded-full blur-3xl" />
      <div className="absolute top-20 left-10 w-32 h-32 bg-[#E8C46B]/10 rounded-full blur-2xl" />
    </section>
  )
}
