"use client"
import Image from "next/image"
import { motion, useScroll, useTransform } from "framer-motion"
import { useState } from "react"
// Import custom colors (optional, tapi membuat kode lebih rapi)
// import { KojeColors } from '@/lib/constants' 

export default function Hero() {
  const { scrollY } = useScroll()
  
  // UPGRADE: Tambahkan sedikit offset pada [0, 500] untuk parallax lebih panjang
  const y = useTransform(scrollY, [0, 500], [0, 150]) // Naikkan dari 120 ke 150
  const opacity = useTransform(scrollY, [0, 250], [1, 0.8]) // Lebih cepat fade
  
  // UPGRADE: CTA Animasi lebih responsif saat scroll down
  const ctaOpacity = useTransform(scrollY, [0, 100, 250], [1, 1, 0]) // Muncul cepat, hilang di 250
  const ctaY = useTransform(scrollY, [0, 100, 250], [0, 0, -50]) // Tetap di 0 lalu naik (hilang)
  // Perhatikan: Mengatur [0, 100] untuk Y dari 20 ke 0 tidak lagi diperlukan karena sudah 0.

  const [loaded, setLoaded] = useState(false)

  return (
    <section className="relative min-h-screen w-full overflow-hidden flex items-center justify-start bg-koje-dark"> {/* UPGRADE: Pakai Custom Color */}

      {/* Background Image Parallax */}
      <motion.div style={{ y, opacity }} className="absolute inset-0 w-full h-full">
        <Image
          src="/image/hero2.png"
          alt="KOJE24 Natural Cold-Pressed Juice"
          fill
          priority
          quality={85} // UPGRADE: Turunkan sedikit dari 95 ke 85 (masih bagus, tapi file lebih kecil)
          
          // UPGRADE: Pindahkan logic loading ke Framer Motion untuk transisi yang lebih halus
          className={`object-cover object-center`}
          onLoadingComplete={() => setLoaded(true)}
        />
        {/* UPGRADE: Gunakan Framer Motion untuk Fade/Scale In */}
        <motion.div 
            initial={{ opacity: 0, scale: 1.1 }}
            animate={loaded ? { opacity: 1, scale: 1 } : {}}
            transition={{ duration: 1.8, ease: [0.45, 0, 0.55, 1] }}
            className="absolute inset-0"
        />
      </motion.div>

      {/* Premium Gradient / Vignette */}
      {/* UPGRADE: Ganti warna manual menjadi custom color untuk konsistensi */}
      <div className="absolute inset-0 bg-gradient-to-br from-koje-dark/90 via-koje-dark/60 to-black/20 pointer-events-none" />
      <div className="absolute inset-0 bg-gradient-to-r from-koje-dark/80 via-koje-dark/30 to-transparent pointer-events-none" />
      
      {/* Soft Glow bawah botol (mobile-first) - Tingkatkan visibility dengan custom color */}
      <div className="absolute bottom-[18%] right-[28%] md:hidden w-60 h-60 bg-koje-primary/25 blur-[110px] rounded-full pointer-events-none" />

      {/* Premium Glow */}
      <div className="absolute top-1/4 right-10 w-60 h-60 bg-koje-primary/20 blur-[120px] rounded-full" />
      <div className="absolute bottom-20 left-0 w-48 h-48 bg-koje-primary/10 blur-[100px] rounded-full" />
      <div className="absolute inset-y-0 right-0 w-1/3 bg-gradient-to-l from-koje-dark/60 to-transparent pointer-events-none" />

      {/* Content */}
      <div className="relative z-10 w-full px-6 md:px-20 lg:px-32 pt-24 md:pt-0">
        <div className="max-w-[46rem]">

          {/* Label Natural */}
          <motion.p
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1, duration: 0.8 }}
            // UPGRADE: Ganti warna hardcode dengan custom color
            className="text-koje-primary/80 text-sm sm:text-base tracking-[0.25em] mb-4 uppercase"
          >
            Natural • Cold-Pressed
          </motion.p>

          {/* Title */}
          <motion.h1
            initial={{ opacity: 0, y: 35 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1.1, ease: "easeOut" }}
            // UPGRADE: Gunakan font-playfair dari CSS Variable
            className="font-playfair text-[2.5rem] sm:text-[3.3rem] md:text-[4.6rem] font-semibold text-white leading-[1.05] drop-shadow-[0_4px_20px_rgba(0,0,0,0.6)]"
          >
            Explore the Taste,
            {/* UPGRADE: Ganti warna hardcode dengan custom color (jika ada yang mendekati) */}
            <span className="block text-koje-primary">Explore the World</span> 
          </motion.h1>

          {/* Subtitle */}
          <motion.p
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.25, duration: 0.9 }}
            // UPGRADE: Gunakan font-sans dari CSS Variable
            className="font-sans text-white/90 text-[1rem] sm:text-[1.15rem] max-w-xl leading-relaxed mt-6"
          >
            KOJE24 — cold-pressed juice yang dibuat harian dari bahan lokal terbaik.
            Tanpa gula tambahan, tanpa pengawet. Nutrisi & rasa tetap maksimal.
          </motion.p>

          {/* CTA */}
          <motion.div style={{ opacity: ctaOpacity, y: ctaY }} className="mt-10">
            <a
              href="#produk"
              // UPGRADE: Ganti hardcode warna gradasi dengan custom color
              className="inline-block bg-gradient-to-r from-koje-primary to-koje-primary/80 hover:from-koje-dark hover:to-koje-dark/90
                text-white font-semibold px-10 py-4 rounded-full shadow-xl backdrop-blur-md
                transition-all duration-500 hover:scale-[1.07] active:scale-95"
            >
              Coba Sekarang
            </a>
          </motion.div>
        </div>
      </div>

      {/* Soft bottom fade */}
      {/* UPGRADE: Gunakan custom color untuk fade out agar match background section berikutnya */}
      <div className="absolute bottom-0 left-0 w-full h-24 bg-gradient-to-t from-white/95 via-white/50 to-transparent pointer-events-none" />
    </section>
  )
}
