// app/(public)/manfaat/page.tsx

"use client"

import Link from "next/link"
import { motion } from "framer-motion"

const BENEFITS = [
  {
    title: "Imun Tubuh Lebih Kuat",
    desc: "Kombinasi jeruk, nanas, kunyit, jahe, dan rempah lain membantu tubuh melawan radikal bebas dan mendukung sistem imun harian.",
    tag: "Daily Immune Support",
  },
  {
    title: "Detox Ringan Setiap Hari",
    desc: "Sayur dan buah tinggi serat seperti bayam, bit, dan seledri membantu proses pembuangan racun alami tanpa perlu diet ekstrem.",
    tag: "Gentle Daily Detox",
  },
  {
    title: "Pencernaan Lebih Lancar",
    desc: "Enzim alami dari buah segar mendukung kerja lambung & usus, sehingga perut terasa lebih nyaman dan tidak mudah begah.",
    tag: "Better Digestion",
  },
  {
    title: "Energi Stabil Tanpa Sugar Crash",
    desc: "Tanpa gula tambahan dan tanpa pemanis buatan, energi terasa lebih stabil — tidak naik turun seperti minuman manis biasa.",
    tag: "Clean Energy",
  },
  {
    title: "Support Kulit & Regenerasi Sel",
    desc: "Antioksidan dari bit, wortel, jeruk, dan apel membantu merawat kulit dari dalam serta mendukung regenerasi sel tubuh.",
    tag: "Skin & Cell Support",
  },
  {
    title: "Hydration & Mood Booster",
    desc: "Kandungan cairan dan vitamin yang seimbang membantu menjaga hidrasi sekaligus memberi efek fresh yang baik untuk mood.",
    tag: "Hydration & Mood",
  },
]

const WHY = [
  {
    title: "Proses Cold-Pressed",
    points: [
      "Tanpa panas tinggi, nutrisi lebih terjaga.",
      "Enzim alami buah & sayur tetap aktif.",
      "Rasa lebih murni dan tidak terlalu manis.",
    ],
  },
  {
    title: "Tanpa Tambahan “Nakalin”",
    points: [
      "Tanpa gula rafinasi, tanpa pewarna.",
      "Tanpa pengawet & tanpa pemanis buatan.",
      "Tidak ada campuran air berlebihan.",
    ],
  },
  {
    title: "Racikan Harian yang Terukur",
    points: [
      "Setiap varian disusun untuk fungsi tertentu.",
      "Bisa dipadukan jadi ritual sehat harian.",
      "Mudah dimasukkan ke gaya hidup modern.",
    ],
  },
]

const MOMENTS = [
  {
    title: "Pagi Hari — Setel Ulang Tubuh",
    desc: "Sebelum sarapan atau 30 menit setelah bangun untuk membantu hidrasi, pencernaan, dan energi awal hari.",
    hint: "Rekomendasi: Detox / Sunrise / Yellow Immunity",
  },
  {
    title: "Menjelang Siang — Anti Lemes",
    desc: "Saat mulai terasa berat atau ngantuk, jus segar membantu jaga fokus tanpa rasa deg-degan seperti kopi berlebihan.",
    hint: "Rekomendasi: Red Series / Sunrise+",
  },
  {
    title: "Sore / Malam — Recovery Ringan",
    desc: "Setelah seharian beraktivitas, bantu tubuh recovery dengan asupan vitamin & antioksidan dari buah dan sayur.",
    hint: "Rekomendasi: Beetroot Power / Detox",
  },
  {
    title: "Sebelum / Setelah Olahraga",
    desc: "Membantu hidrasi, mengganti mineral, dan memberi energi bersih sebelum latihan atau recovery setelah olahraga.",
    hint: "Rekomendasi: Yellow Immunity / Red Series",
  },
]

const FUNCTION_TAGS = [
  "Detox Harian",
  "Imun & Antioksidan",
  "Pencernaan Sehat",
  "Energy Booster",
  "Skin Glow Support",
  "Hydration & Mood",
]

export default function ManfaatPage() {
  return (
    <main className="min-h-screen bg-gradient-to-b from-[#f8fcfc] via-[#f2f9f9] to-[#e0f0f0] text-[#0B4B50] relative pt-24">
      {/* Aura Background */}
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute -top-32 -left-10 w-72 h-72 bg-[#0FA3A8]/12 blur-3xl rounded-full" />
        <div className="absolute -bottom-40 right-[-60px] w-80 h-80 bg-[#E8C46B]/16 blur-3xl rounded-full" />
      </div>

      <div className="relative max-w-6xl mx-auto px-6 md:px-10 lg:px-16 py-12 space-y-16 md:space-y-20">
        {/* BREADCRUMB */}
        <div className="text-sm text-gray-500">
          <Link href="/" className="hover:text-[#0FA3A8] transition">Beranda</Link>
          <span className="mx-2">/</span>
          <span className="text-[#0FA3A8]">Manfaat KOJE24</span>
        </div>

        {/* ... semua konten lainnya sama persis ... */}
      </div>
    </main>
  )
}
