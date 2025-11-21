"use client"

import Image from "next/image"
import { motion } from "framer-motion"
import Link from "next/link"

export default function AboutSection() {
  return (
    <section className="relative bg-gradient-to-b from-[#f8fcfc] to-[#eef7f7] py-24 md:py-32 overflow-hidden">
      
      {/* 🔹 Background efek aura */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(15,163,168,0.08),transparent_60%)] pointer-events-none" />

      <div className="max-w-7xl mx-auto grid md:grid-cols-2 gap-14 items-center px-6 md:px-14 lg:px-24 relative z-10">

        {/* =======================================
            🟩 Kolom Teks
        ======================================== */}
        <motion.div
          initial={{ opacity: 0, x: -40 }}
          whileInView={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8, ease: "easeOut", delay: 0.1 }}
          viewport={{ once: true }}
          className="order-2 md:order-1"
        >
          <h2 className="font-playfair text-4xl md:text-5xl font-semibold text-[#0B4B50] mb-5">
            Kenapa <span className="text-[#0FA3A8]">KOJE24?</span>
          </h2>

          <p className="font-inter text-gray-700 leading-relaxed text-base md:text-lg mb-5">
            KOJE24 adalah <b>premium cold-pressed juice</b> yang diciptakan untuk mereka 
            yang ingin menjaga tubuh tetap fit, segar, dan seimbang — tanpa ribet.
            Setiap botol dibuat dari buah & sayuran segar pilihan menggunakan teknologi 
            cold-pressed agar nutrisi tetap utuh dan maksimal terserap tubuh.
          </p>

          <p className="font-inter text-gray-600 leading-relaxed text-base md:text-lg mb-8">
            Kami menggabungkan <b>rasa yang enak</b> dan <b>manfaat nyata</b>: mendukung imun, 
            metabolisme, dan detoks harian — membuat tubuh terasa lebih ringan, segar, 
            dan bertenaga.  
            <br />
            Ini bukan sekadar jus — ini adalah <b>pengalaman hidup sehat premium</b> 🍃 yang 
            bisa kamu nikmati setiap hari.
          </p>

          {/* =======================================
              🔘 Tombol 1 — Baca Selengkapnya
          ======================================== */}
          <motion.div
            className="mt-5"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.96 }}
          >
            <Link
              href="/tentang-koje24"
              className="inline-flex items-center gap-2 
                         text-[#0FA3A8] font-semibold text-base md:text-lg 
                         hover:text-[#0DC1C7] transition-colors"
            >
              Baca Selengkapnya
              <span className="text-xl">→</span>
            </Link>
          </motion.div>
        </motion.div>

          {/* =======================================
              🔘 Tombol 2 — Lihat Manfaat
          ======================================== */}
          <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.96 }}>
            <Link
              href="/manfaat"
              aria-label="Lihat manfaat KOJE24"
              className="bg-[#0FA3A8] text-white font-semibold px-10 py-3 rounded-full 
                         hover:bg-[#0DC1C7] transition-all duration-300 
                         shadow-[0_4px_15px_rgba(15,163,168,0.4)] 
                         hover:shadow-[0_6px_25px_rgba(15,163,168,0.5)] 
                         active:scale-[0.98] focus:ring-2 focus:ring-[#0FA3A8]/50"
            >
              Lihat Manfaatnya
            </Link>
          </motion.div>

        {/* =======================================
            🖼 Kolom Gambar
        ======================================== */}
        <motion.div
          initial={{ opacity: 0, x: 40 }}
          whileInView={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8, ease: "easeOut", delay: 0.2 }}
          viewport={{ once: true }}
          className="relative order-1 md:order-2 h-[340px] md:h-[460px] 
                     rounded-3xl overflow-hidden 
                     shadow-[0_15px_50px_rgba(15,163,168,0.2)]"
        >
          <Image
            src="/image/koje.png"
            alt="KOJE24 Cold-Pressed Juice Premium"
            fill
            priority
            className="object-cover scale-[1.05] hover:scale-[1.08] 
                       transition-transform duration-[1500ms] ease-out"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent" />
        </motion.div>
      </div>
    </section>
  )
}
