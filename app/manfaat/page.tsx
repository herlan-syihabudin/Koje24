"use client"
import Image from "next/image"
import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { X } from "lucide-react"

const manfaatList = [
  {
    title: "Green Detox",
    desc: "Membersihkan racun tubuh dan memperbaiki pencernaan alami.",
    img: "/image/vector-detox.jpeg",
    kandungan: [
      "Bayam hijau — kaya klorofil untuk detoks alami",
      "Apel hijau — tinggi serat & vitamin A, C, E",
      "Lemon — menjaga keseimbangan pH tubuh",
      "Jahe — melancarkan metabolisme",
      "Timun — hidrasi & bantu peremajaan kulit",
    ],
  },
  {
    title: "Yellow Immunity",
    desc: "Menjaga daya tahan tubuh agar tetap fit sepanjang hari.",
    img: "/image/vector-lemonggras.jpeg",
    kandungan: [
      "Jeruk — vitamin C tinggi untuk imunitas",
      "Nanas — bromelain alami anti-radang",
      "Kunyit — kurkumin untuk kekebalan tubuh",
      "Madu — antibakteri alami & sumber energi",
      "Lemon — antioksidan kuat & menyegarkan",
    ],
  },
  {
    title: "Carrot Boost",
    desc: "Meningkatkan fungsi mata, kulit, dan kekuatan tulang.",
    img: "/image/vector-celery.jpeg",
    kandungan: [
      "Wortel — kaya beta-karoten untuk mata & kulit",
      "Jeruk — vitamin C alami",
      "Serai — membantu pencernaan & peredaran darah",
      "Jahe — meningkatkan metabolisme tubuh",
      "Apel merah — menambah rasa manis alami",
    ],
  },
  {
    title: "Sunrise Refresh",
    desc: "Memberi semangat pagi, meningkatkan fokus, dan stamina tubuh.",
    img: "/image/vector-yellow series.jpeg",
    kandungan: [
      "Jeruk Bali — menyegarkan & kaya vitamin C",
      "Lemon — antioksidan tinggi",
      "Madu — energi alami tanpa lonjakan gula",
      "Jahe — menghangatkan dan anti-inflamasi",
      "Nanas — memperlancar metabolisme lemak",
    ],
  },
  {
    title: "Purple Glow",
    desc: "Menjaga kecantikan kulit dan sirkulasi darah.",
    img: "/image/vector-beetroot.jpeg",
    kandungan: [
      "Bit merah — meningkatkan sirkulasi darah",
      "Anggur ungu — antioksidan & anti-aging",
      "Apel — menstabilkan kadar gula darah",
      "Jeruk — vitamin C untuk kulit cerah",
      "Lemon — membantu detoksifikasi kulit",
    ],
  },
  {
    title: "Ginger Energy",
    desc: "Memberikan energi alami dan memperkuat sistem imun tubuh.",
    img: "/image/vector-redseries.jpeg",
    kandungan: [
      "Jahe merah — meningkatkan energi & daya tahan",
      "Madu alami — mempercepat pemulihan tubuh",
      "Serai — melancarkan peredaran darah",
      "Lemon — menyegarkan & kaya vitamin C",
      "Apel hijau — serat tinggi & menyeimbangkan rasa",
    ],
  },
]

export default function ManfaatPage() {
  const [selected, setSelected] = useState<any>(null)

  // ✅ Lock scroll body saat popup aktif
  useEffect(() => {
    if (selected) {
      document.body.style.overflow = "hidden"
    } else {
      document.body.style.overflow = ""
    }
    return () => {
      document.body.style.overflow = ""
    }
  }, [selected])

  return (
    <main className="min-h-screen bg-gradient-to-b from-white via-[#f6fbfb] to-[#eaf7f7] text-[#0B4B50] relative">
      <section className="max-w-6xl mx-auto px-6 py-20">
        <h1 className="text-4xl md:text-5xl font-extrabold font-playfair text-center mb-4">
          Manfaat Mengonsumsi <span className="text-[#0FA3A8]">KOJE24</span>
        </h1>
        <p className="text-center text-lg text-[#446] max-w-2xl mx-auto mb-12">
          Klik salah satu varian untuk melihat kandungan alami dan manfaatnya 🍃
        </p>

        {/* Daftar manfaat */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-10">
          {manfaatList.map((item, i) => (
            <motion.div
              key={i}
              className="group bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-500 overflow-hidden cursor-pointer"
              whileHover={{ scale: 1.03 }}
              onClick={() => setSelected(item)}
            >
              <div className="relative h-52 w-full">
                <Image
                  src={item.img}
                  alt={item.title}
                  fill
                  className="object-cover group-hover:scale-105 transition-transform duration-700"
                />
              </div>
              <div className="p-6">
                <h3 className="text-xl font-bold mb-2 text-[#0B4B50] group-hover:text-[#0FA3A8] transition-colors">
                  {item.title}
                </h3>
                <p className="text-[#445] leading-relaxed">{item.desc}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* === POPUP DETAIL === */}
      <AnimatePresence>
        {selected && (
          <motion.div
            className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              className="bg-white rounded-3xl max-w-lg w-full mx-6 shadow-2xl relative p-8 overflow-y-auto max-h-[90vh]"
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              transition={{ duration: 0.3 }}
            >
              <button
                onClick={() => setSelected(null)}
                className="absolute top-4 right-4 text-gray-500 hover:text-[#0FA3A8]"
              >
                <X size={28} />
              </button>

              <div className="mb-5 flex justify-center">
                <Image
                  src={selected.img}
                  alt={selected.title}
                  width={200}
                  height={200}
                  className="rounded-xl shadow-md"
                />
              </div>

              <h2 className="text-2xl font-bold text-center text-[#0B4B50] mb-2">
                {selected.title}
              </h2>
              <p className="text-center text-[#444] mb-4">{selected.desc}</p>

              <ul className="list-disc text-[#0B4B50] pl-6 space-y-1">
                {selected.kandungan.map((k: string, idx: number) => (
                  <li key={idx}>{k}</li>
                ))}
              </ul>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </main>
  )
}

