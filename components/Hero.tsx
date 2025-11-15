"use client"

import Image from "next/image"
import { motion } from "framer-motion"

export default function Hero() {
  return (
    <section className="
      relative w-full min-h-[95vh] md:min-h-[100vh] 
      overflow-hidden bg-[#020607] 
      flex items-center pt-24 md:pt-0
    ">

      {/* BACKGROUND GRADIENT */}
      <div className="absolute inset-0 bg-gradient-to-br from-black via-[#041314] to-[#072D2F]" />

      {/* GLOW ADJUSTED FOR MOBILE */}
      <div className="absolute -top-10 -left-10 h-52 w-52 md:h-72 md:w-72 rounded-full bg-teal-400/20 blur-[90px] md:blur-[120px]" />
      <div className="absolute bottom-20 right-5 h-52 w-52 md:h-72 md:w-72 rounded-full bg-cyan-300/15 blur-[90px] md:blur-[150px]" />

      {/* GRID WRAPPER */}
      <div className="relative z-20 grid grid-cols-1 md:grid-cols-2 w-full 
        px-6 sm:px-10 md:px-16 lg:px-28 gap-10 md:gap-14 
        items-center">

        {/* ===================== LEFT TEXT ===================== */}
        <div className="flex flex-col gap-6 sm:gap-7 lg:gap-9">

          {/* TITLE */}
          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1 }}
            className="
              font-playfair font-semibold 
              text-[2.2rem] sm:text-[2.8rem] md:text-[3.8rem] lg:text-[4.3rem] 
              leading-[1.1] text-white tracking-tight
            "
          >
            Explore the Taste,
            <span className="block text-[#CFF8F8]">Explore the World</span>
          </motion.h1>

          {/* SUBTEXT */}
          <motion.p
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15, duration: 0.9 }}
            className="font-inter text-white/85 text-base sm:text-lg max-w-md leading-relaxed"
          >
            KOJE24 dibuat dari bahan alami tanpa gula tambahan & tanpa pengawet.
            Diproses dengan metode cold-pressed untuk menjaga nutrisi tetap utuh.
          </motion.p>

          {/* SELLING POINT */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.25, duration: 0.9 }}
            className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1"
          >
            {[
              { title: "Tanpa Gula", sub: "Manis alami buah" },
              { title: "Cold-Pressed", sub: "Nutrisi tetap utuh" },
              { title: "Fresh Daily", sub: "Diproduksi harian" },
            ].map((item, idx) => (
              <div
                key={idx}
                className="
                  rounded-2xl border border-white/10 bg-white/5 
                  px-5 py-4 backdrop-blur-md
                  shadow-[0_0_25px_rgba(0,0,0,0.15)]
                "
              >
                <p className="text-teal-200 text-[0.9rem] font-semibold">{item.title}</p>
                <p className="text-gray-300/75 text-xs mt-1">{item.sub}</p>
              </div>
            ))}
          </motion.div>

          {/* CTA BUTTON */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.35, duration: 0.9 }}
          >
            <a
              href="#produk"
              className="
                inline-block bg-[#0FA3A8] hover:bg-[#0B4B50] 
                transition-all duration-400 
                text-white font-semibold px-8 py-3 
                rounded-full shadow-lg shadow-[#0FA3A8]/40 
                hover:scale-[1.05] active:scale-95
              "
            >
              Coba Sekarang
            </a>
          </motion.div>

        </div>

        {/* ===================== RIGHT BOTTLE ===================== */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, duration: 1 }}
          className="relative flex justify-center md:justify-end mt-4 md:mt-0"
        >
          {/* Glow */}
          <div className="absolute inset-0 -z-10 
            blur-[90px] md:blur-[130px] 
            bg-teal-200/20 rounded-full 
            w-[220px] h-[220px] sm:w-[260px] sm:h-[260px] 
            mx-auto md:mx-0"
          />

          <Image
            src="/image/koje.png"
            alt="koje"
            width={360}
            height={360}
            className="
              object-contain 
              drop-shadow-[0_18px_45px_rgba(0,0,0,0.55)]
              max-w-[260px] sm:max-w-[300px] md:max-w-[380px] lg:max-w-[420px]
            "
            priority
          />
        </motion.div>

      </div>

      {/* TRANSITION */}
      <div className="absolute bottom-0 left-0 w-full h-24 bg-gradient-to-t from-[#f8fcfc] to-transparent" />
    </section>
  )
}
