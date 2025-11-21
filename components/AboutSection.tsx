"use client"

import Image from "next/image"
import { motion } from "framer-motion"
import Link from "next/link"

export default function AboutSection() {
  return (
    <section
      // ❌ id="about" dihapus supaya nggak double sama wrapper di page.tsx
      className="relative bg-gradient-to-b from-[#f8fcfc] to-[#eef7f7] py-24 md:py-32 overflow-hidden"
    >
      {/* 🔹 Background efek */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(15,163,168,0.08),transparent_60%)] pointer-events-none" />

      <div className="max-w-7xl mx-auto grid md:grid-cols-2 gap-14 items-center px-6 md:px-14 lg:px-24 relative z-10">
        {/* 🔹 Kolom teks */}
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
            <b>Cold-pressed fresh</b> — tanpa gula tambahan, tanpa pengawet, dan tanpa bahan kimia buatan.  
            Setiap tetes KOJE24 lahir dari <b>komitmen kami terhadap kemurnian alam</b>, menghadirkan kesegaran sejati
            yang menjaga keseimbangan tubuh dan pikiran.
          </p>

          <p className="font-inter text-gray-600 leading-relaxed text-base md:text-lg mb-8">
            Kami fokus pada <b>manfaat nyata harian</b>: meningkatkan imun, memperbaiki pencernaan, menstabilkan metabolisme, 
            dan membantu menutrisi kulit dari dalam.  
            <br />Dengan KOJE24, Anda tidak hanya minum jus — Anda menikmati <b>ritual sehat alami</b> 🍃  
            yang menjadi bagian dari gaya hidup modern yang peduli kesehatan.
          </p>

          {/* 🔹 Tombol Aksi */}
          <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.96 }}>
            <Link
              href="/manfaat"
              aria-label="Lihat manfaat KOJE24"
              className="bg-[#0FA3A8] text-white font-semibold px-10 py-3 rounded-full hover:bg-[#0DC1C7] transition-all duration-300 shadow-[0_4px_15px_rgba(15,163,168,0.4)] hover:shadow-[0_6px_25px_rgba(15,163,168,0.5)] active:scale-[0.98] focus:ring-2 focus:ring-[#0FA3A8]/50"
            >
              Lihat Manfaatnya
            </Link>
          </motion.div>
        </motion.div>

        {/* 🔹 Gambar */}
        <motion.div
          initial={{ opacity: 0, x: 40 }}
          whileInView={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8, ease: "easeOut", delay: 0.2 }}
          viewport={{ once: true }}
          className="relative order-1 md:order-2 h-[340px] md:h-[460px] rounded-3xl overflow-hidden shadow-[0_15px_50px_rgba(15,163,168,0.2)]"
        >
          <Image
            src="/image/koje.png"
            alt="KOJE24 Cold-Pressed Juice Premium"
            fill
            priority
            className="object-cover scale-[1.05] hover:scale-[1.08] transition-transform duration-[1500ms] ease-out"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent" />
        </motion.div>
      </div>
    </section>
  )
}
