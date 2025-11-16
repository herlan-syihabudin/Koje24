"use client"

import Image from "next/image"
import { motion, useScroll, useTransform } from "framer-motion"
import { useEffect, useState } from "react"

export default function HeroSupreme() {
  const { scrollY } = useScroll()
  const bgY = useTransform(scrollY, [0, 800], ["0%", "10%"])
  const bottleY = useTransform(scrollY, [0, 800], ["0px", "50px"])
  const [mounted, setMounted] = useState(false)
  useEffect(() => setMounted(true), [])

  return (
    <header className="relative w-full min-h-[95vh] md:min-h-[100vh] overflow-hidden bg-[#010403] text-white">
      {/* BACKGROUND */}
      <motion.div style={{ y: bgY }} className="absolute inset-0 -z-30">
        {/* Deep premium gradient */}
        <div className="absolute inset-0 bg-gradient-to-br from-black via-[#031417] to-[#0A2C2D]" />
        {/* Branded texture */}
        <div
          className="absolute inset-0 opacity-[0.06]"
          style={{
            backgroundImage: "url('/image/pattern-koje.svg')",
            backgroundSize: "400px",
            backgroundPosition: "center",
            mixBlendMode: "overlay",
          }}
        />
      </motion.div>

      {/* Premium Top Halo Glow */}
      <div className="absolute top-[-20%] left-1/2 -translate-x-1/2 w-[120vw] h-[100vh] bg-[#07E3DA]/10 blur-[160px] -z-20" />

      <div className="relative max-w-[1300px] mx-auto px-7 md:px-12 lg:px-20 pt-24 md:pt-32 z-10">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
          {/* LEFT TEXT */}
          <div className="flex flex-col gap-6 md:gap-9">
            <motion.p
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.9 }}
              className="tracking-[0.25em] text-teal-200/80 text-xs font-semibold"
            >
              THE ART OF NATURAL JUICE
            </motion.p>

            <motion.h1
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 1.1, delay: 0.05 }}
              className="font-playfair font-bold text-[2.7rem] sm:text-[3.5rem] md:text-[4.6rem] leading-[1.02]"
            >
              Taste the Luxury of
              <span className="block bg-gradient-to-r from-white to-[#B6FFFE] bg-clip-text text-transparent">
                Real Freshness
              </span>
            </motion.h1>

            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.9, delay: 0.3 }}
              className="text-white/80 text-base sm:text-lg md:text-xl leading-relaxed max-w-md"
            >
              Premium cold-pressed juice crafted daily — delivering pure wellness,
              elegance in every sip, and the finest nutrients nature can offer.
            </motion.p>

            {/* CTA */}
            <div className="flex flex-col sm:flex-row gap-4 mt-4">
              <motion.a
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.45 }}
                href="#produk"
                className="group inline-flex items-center justify-center px-8 py-4 rounded-full font-semibold text-base
                bg-white text-black hover:text-[#007F81]
                transition-all duration-500
                shadow-[0_15px_40px_rgba(255,255,255,0.12)]
                hover:shadow-[0_20px_50px_rgba(0,200,200,0.25)]
                active:scale-[0.98]"
              >
                Shop Premium
                <span className="ml-2 group-hover:translate-x-1 transition-transform">→</span>
              </motion.a>

              <motion.a
                href="#about"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.55 }}
                className="px-6 py-3 rounded-full border border-white/25 text-white/80 hover:border-[#08C9D0] hover:text-white transition-all backdrop-blur-sm"
              >
                About Us
              </motion.a>
            </div>
          </div>

          {/* RIGHT VISUAL */}
          <motion.div
            style={{ y: bottleY }}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1, delay: 0.25 }}
            className="flex justify-center md:justify-end"
          >
            <div className="relative w-full max-w-[420px]">
              {/* BACK LIGHT RIM */}
              <div className="absolute inset-0 scale-[1.3] bg-[#0afdf5]/10 blur-[90px] -z-10" />

              {/* Bottle */}
              <motion.div
                animate={
                  mounted
                    ? { y: [0, -10, 0] }
                    : {}
                }
                transition={{ duration: 7, repeat: Infinity, ease: "easeInOut" }}
                whileHover={{ scale: 1.04 }}
                className="relative"
              >
                <Image
                  src="/image/botol-premium.png"
                  alt="KOJE24 Premium Bottle"
                  width={550}
                  height={550}
                  className="object-contain drop-shadow-[0_30px_80px_rgba(0,0,0,0.7)]"
                  priority
                />

                {/* Premium Badge */}
                <div className="absolute -right-6 bottom-6 bg-[#ffffff16] border border-white/20 backdrop-blur-xl rounded-full px-4 py-2 text-xs tracking-wide text-teal-100 font-semibold shadow-[0_0_20px_rgba(0,255,255,0.2)]">
                  ✦ Luxury Bestseller
                </div>
              </motion.div>
            </div>
          </motion.div>
        </div>
      </div>
    </header>
  )
}
