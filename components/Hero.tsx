"use client"

import Image from "next/image"
import { motion } from "framer-motion"

export default function Hero() {
  return (
    <section className="relative w-full min-h-[90vh] md:min-h-[100vh] overflow-hidden bg-[#020607] flex items-center">

      {/* BACKGROUND GRADIENT PREMIUM */}
      <div className="absolute inset-0 bg-gradient-to-br from-black via-[#041314] to-[#072D2F]" />

      {/* PREMIUM GLOW LEFT */}
      <div className="absolute -top-20 -left-20 h-72 w-72 rounded-full bg-teal-400/20 blur-[110px]" />
      <div className="absolute top-1/4 left-10 h-40 w-40 rounded-full bg-emerald-300/15 blur-[90px]" />

      {/* PREMIUM GLOW RIGHT */}
      <div className="absolute bottom-20 right-20 h-72 w-72 rounded-full bg-teal-300/20 blur-[140px]" />
      <div className="absolute top-40 right-0 h-40 w-40 rounded-full bg-cyan-200/10 blur-[80px]" />

      <div className="relative z-20 grid grid-cols-1 md:grid-cols-2 w-full px-8 md:px-16 lg:px-28 gap-12 items-center">

        {/* ===================== LEFT TEXT ===================== */}
        <div className="flex flex-col gap-6 md:gap-8 lg:gap-10">
          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1.1, ease: "easeOut" }}
            className="font-playfair text-[2.6rem] sm:text-[3rem] md:text-[4rem] lg:text-[4.4rem] font-semibold leading-[1.05] text-white drop-shadow-[0_4px_20px_rgba(0,0,0,0.55)]"
          >
            Explore the Taste,
            <span className="block text-[#CFF8F8]">Explore the World</span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 1 }}
            className="font-inter text-white/85 text-[1rem] sm:text-lg max-w-md leading-relaxed"
          >
            KOJE24 dibuat dari bahan alami tanpa gula tambahan & tanpa pengawet.
            Diproses dengan metode cold-pressed untuk menjaga nutrisi tetap utuh.
          </motion.p>

          {/* SELLING POINTS */}
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.9 }}
            className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2"
          >
            {[
              { title: "Tanpa Gula", sub: "Manis alami buah" },
              { title: "Cold-Pressed", sub: "Nutrisi tetap utuh" },
              { title: "Fresh Daily", sub: "Diproduksi harian" },
            ].map((item, idx) => (
              <div
                key={idx}
                className="rounded-2xl border border-white/10 bg-white/5 px-5 py-4 backdrop-blur-md shadow-[0_0_25px_rgba(0,0,0,0.15)]"
              >
                <p className="text-teal-200 text-[0.9rem] font-semibold">{item.title}</p>
                <p className="text-gray-300/75 text-[12px] mt-1">{item.sub}</p>
              </div>
            ))}
          </motion.div>

          {/* CTA BUTTON */}
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.45, duration: 0.9 }}
          >
            <a
              href="#produk"
              className="inline-block bg-[#0FA3A8] hover:bg-[#0B4B50] transition-all duration-400 text-white font-semibold px-8 py-3 rounded-full shadow-lg shadow-[#0FA3A8]/40 hover:scale-[1.05] active:scale-95"
            >
              Lihat 6 Varian KOJE24
            </a>
          </motion.div>
        </div>

        {/* ===================== RIGHT BOTTLE ===================== */}
        <motion.div
          initial={{ opacity: 0, y: 25 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6, duration: 1 }}
          className="relative flex justify-center md:justify-end"
        >
          {/* GLOW BEHIND BOTTLE */}
          <div className="absolute inset-0 -z-10 blur-[120px] bg-teal-200/20 rounded-full w-[260px] h-[260px] mx-auto md:mx-0" />

          {/* BOTTLE IMAGE */}
          <Image
            src="/image/koje.png" // ganti ke foto botol kamu
            alt="koje"
            width={420}
            height={420}
            className="object-contain drop-shadow-[0_25px_60px_rgba(0,0,0,0.6)]"
            priority
          />
        </motion.div>
      </div>

      {/* TRANSITION KE SECTION BERIKUT */}
      <div className="absolute bottom-0 left-0 w-full h-24 bg-gradient-to-t from-[#f8fcfc] to-transparent" />
    </section>
  )
}
