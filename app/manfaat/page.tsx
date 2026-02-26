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
    <main className="min-h-screen bg-gradient-to-b from-[#f8fcfc] via-[#f2f9f9] to-[#e0f0f0] text-[#0B4B50] relative">
      {/* Aura Background */}
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute -top-32 -left-10 w-72 h-72 bg-[#0FA3A8]/12 blur-3xl rounded-full" />
        <div className="absolute -bottom-40 right-[-60px] w-80 h-80 bg-[#E8C46B]/16 blur-3xl rounded-full" />
      </div>

      <div className="relative max-w-6xl mx-auto px-6 md:px-10 lg:px-16 py-16 md:py-20 space-y-16 md:space-y-20">
        {/* HERO UPGRADED PREMIUM */}
<motion.section
  initial={{ opacity: 0, y: 26 }}
  animate={{ opacity: 1, y: 0 }}
  transition={{ duration: 0.7, ease: "easeOut" }}
  className="mb-4"
>
  {/* KARTU HERO BESAR + AURA */}
  <div className="relative overflow-hidden rounded-[32px] bg-white/70 border border-white/70 shadow-[0_18px_55px_rgba(11,75,80,0.18)] px-5 py-6 md:px-8 md:py-8 lg:px-10 lg:py-9">
    {/* Aura dalam hero */}
    <div className="pointer-events-none absolute inset-0">
      <div className="absolute -top-24 left-16 w-64 h-64 bg-[#0FA3A8]/15 blur-3xl rounded-full" />
      <div className="absolute -bottom-24 right-10 w-72 h-72 bg-[#E8C46B]/18 blur-3xl rounded-full" />
      <div className="absolute top-1/2 -left-10 w-40 h-40 bg-[#0B4B50]/8 blur-2xl rounded-full" />
    </div>

    <div className="relative grid md:grid-cols-[1.4fr_1fr] gap-8 md:gap-10 items-center">
      {/* SIDE TEKS */}
      <div>
        {/* Badge */}
        <div className="inline-flex items-center gap-2 rounded-full bg-white/80 border border-[#d7ecec] px-4 py-1 text-xs font-medium text-[#0FA3A8] shadow-[0_4px_14px_rgba(0,0,0,0.06)] mb-4">
          <span className="w-1.5 h-1.5 rounded-full bg-[#0FA3A8]" />
          Manfaat minum KOJE24 setiap hari
        </div>

        {/* Judul + highlight glow */}
        <div className="relative mb-4">
          <h1 className="font-playfair text-3xl md:text-4xl lg:text-5xl font-semibold leading-tight">
            Bukan sekadar jus —{" "}
            <span className="text-[#0FA3A8]">
              ritual kecil untuk tubuh yang lebih seimbang.
            </span>
          </h1>
          <div className="absolute -inset-2 rounded-[28px] bg-[#0FA3A8]/4 blur-xl -z-10" />
        </div>

        {/* Paragraf */}
        <p className="font-inter text-sm md:text-base text-gray-600 leading-relaxed mb-6 max-w-xl">
          KOJE24 diracik dari perpaduan sayur, buah, dan rempah alami.
          Tanpa gula tambahan, tanpa pengawet, dan tanpa bahan kimia
          yang tidak perlu — supaya yang masuk ke tubuh kamu benar-benar
          sesuatu yang bisa bekerja <b>mendukung kesehatan jangka panjang</b>.
        </p>

        {/* Chips fitur */}
        <div className="flex flex-wrap gap-3 mb-6">
          {[
            "🍃 Cold-pressed, bukan sekadar diblender",
            "💧 Tanpa gula & pengawet",
            "🌗 Cocok untuk morning & night routine",
          ].map((item) => (
            <span
              key={item}
              className="px-4 py-2 rounded-full bg-white/90 border border-[#dbeeee] text-xs md:text-sm text-[#0B4B50] shadow-[0_4px_14px_rgba(15,163,168,0.08)] backdrop-blur-sm"
            >
              {item}
            </span>
          ))}
        </div>

        {/* CTA + mini-info */}
        <div className="flex flex-wrap items-center gap-3">
          <Link
            href="/#produk"
            className="inline-flex items-center justify-center px-7 py-3.5 rounded-full bg-[#0FA3A8] text-white text-sm md:text-base font-semibold shadow-[0_10px_32px_rgba(15,163,168,0.5)] hover:bg-[#0DC1C7] hover:shadow-[0_14px_42px_rgba(15,163,168,0.6)] active:scale-[0.97] transition-all duration-300"
          >
            Lihat Varian KOJE24
          </Link>
          <p className="text-xs md:text-sm text-gray-500">
            Atur ritme sehat mulai dari 1 botol per hari.
          </p>
        </div>

        {/* Mini trust row */}
        <div className="mt-4 flex flex-wrap gap-4 text-[11px] md:text-xs text-gray-500">
          <div className="flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-[#0FA3A8]" />
            100% bahan segar harian
          </div>
          <div className="flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-[#0FA3A8]" />
            Dibuat dalam batch kecil, bukan massal
          </div>
        </div>
      </div>

      {/* SNAPSHOT CARD SIDE */}
      <motion.div
        initial={{ opacity: 0, x: 25 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.7, ease: "easeOut", delay: 0.1 }}
        className="relative"
      >
        {/* Glow belakang kartu */}
        <div className="absolute -top-8 -right-6 w-32 h-32 bg-[#0FA3A8]/18 blur-3xl rounded-full pointer-events-none" />
        <div className="absolute bottom-[-18px] -left-4 w-28 h-28 bg-[#E8C46B]/30 blur-3xl rounded-full pointer-events-none" />

        <div className="relative rounded-3xl bg-white/70 backdrop-blur-xl border border-white/80 shadow-[0_18px_45px_rgba(0,0,0,0.12)] p-5 md:p-6 flex flex-col gap-3">
          <div className="text-xs font-semibold uppercase tracking-[0.18em] text-[#0FA3A8] mb-1">
            QUICK SNAPSHOT
          </div>
          <p className="text-sm text-gray-600">
            Dengan pola konsumsi yang konsisten, banyak pelanggan
            merasakan:
          </p>

          <ul className="mt-1 space-y-1.5 text-sm text-[#0B4B50]">
            <li>• Bangun tidur lebih enteng dan tidak terlalu &quot;berat&quot;.</li>
            <li>• Tidak mudah pilek / flu pada perubahan cuaca.</li>
            <li>• BAB lebih teratur dan pencernaan terasa lebih nyaman.</li>
            <li>• Kulit terlihat lebih cerah dan lembap dari dalam.</li>
          </ul>

          <div className="h-px bg-gradient-to-r from-transparent via-[#0FA3A8]/30 to-transparent my-2" />

          <p className="text-[11px] text-gray-500 leading-relaxed">
            Catatan: KOJE24 bukan obat dan tidak menggantikan konsultasi
            profesional medis. Ini adalah <b>supportive habit</b> untuk
            gaya hidup sehat kamu.
          </p>
        </div>
      </motion.div>
    </div>
  </div>
</motion.section>

        {/* FUNCTION TAG STRIP */}
        <motion.section
          initial={{ opacity: 0, y: 18 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          className="rounded-3xl bg-white/80 border border-[#dfeeee] shadow-[0_10px_30px_rgba(11,75,80,0.06)] px-4 py-4 md:px-6 md:py-4 flex flex-wrap gap-2 md:gap-3 items-center"
        >
          <span className="text-xs md:text-sm font-semibold text-[#0FA3A8] whitespace-nowrap">
            Fokus manfaat KOJE24:
          </span>
          <div className="flex flex-wrap gap-2 md:gap-3">
            {FUNCTION_TAGS.map((t) => (
              <span
                key={t}
                className="px-3 py-1 rounded-full bg-[#f4faf9] border border-[#d7ecec] text-[11px] md:text-xs text-[#0B4B50]"
              >
                {t}
              </span>
            ))}
          </div>
        </motion.section>

        {/* BENEFIT GRID */}
        <motion.section
          initial={{ opacity: 0, y: 22 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.7, ease: "easeOut" }}
          className="space-y-6 md:space-y-8"
        >
          <div>
            <h2 className="font-playfair text-2xl md:text-3xl font-semibold mb-3">
              Manfaat utama ketika kamu rutin minum{" "}
              <span className="text-[#0FA3A8]">KOJE24</span>
            </h2>
            <p className="font-inter text-sm md:text-base text-gray-600 mb-4 md:mb-2 max-w-2xl">
              Kamu bisa mulai dari 1–2 botol per hari, lalu sesuaikan dengan
              kebutuhan tubuh. Setiap varian punya fungsi, tapi garis besarnya
              kurang lebih seperti ini:
            </p>
          </div>

          <div className="grid gap-6 md:gap-7 md:grid-cols-2">
            {BENEFITS.map((b, idx) => (
              <motion.div
                key={b.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-60px" }}
                transition={{ duration: 0.5, delay: idx * 0.05 }}
                className="relative overflow-hidden rounded-3xl bg-white/90 border border-[#e0f1f1] shadow-[0_8px_28px_rgba(11,75,80,0.07)] p-5 md:p-6"
              >
                <div className="absolute -top-6 -right-10 w-24 h-24 bg-[#0FA3A8]/7 blur-2xl rounded-full" />
                <div className="relative">
                  <p className="inline-flex items-center px-3 py-1 rounded-full bg-[#f4faf9] text-[11px] font-semibold text-[#0FA3A8] mb-3 border border-[#d7ecec]">
                    {b.tag}
                  </p>
                  <h3 className="font-playfair text-lg md:text-xl font-semibold mb-2">
                    {b.title}
                  </h3>
                  <p className="text-sm md:text-[15px] text-gray-600 leading-relaxed">
                    {b.desc}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.section>

        {/* NUTRIENT SNAPSHOT MINI PANEL */}
        <motion.section
          initial={{ opacity: 0, y: 18 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-60px" }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          className="rounded-3xl bg-[#0B4B50] text-white px-5 py-5 md:px-7 md:py-6 shadow-[0_12px_40px_rgba(0,0,0,0.35)] border border-white/15"
        >
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <p className="text-[11px] uppercase tracking-[0.2em] text-teal-100/80 mb-1">
                Nutrient snapshot
              </p>
              <h3 className="font-playfair text-xl md:text-2xl font-semibold">
                Apa yang kamu dapat dari 1–2 botol KOJE24 per hari?
              </h3>
              <p className="mt-1 text-xs md:text-sm text-teal-50/80 max-w-xl">
                Bukan angka pasti seperti label suplemen, tapi gambaran umum
                dari pola konsumsi pelanggan kami yang rutin.
              </p>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 md:gap-4 text-xs md:text-sm">
              <div className="bg-white/10 rounded-2xl px-3 py-2 border border-white/15">
                <p className="text-[11px] uppercase tracking-wide text-teal-100/80">
                  Vitamin Strength
                </p>
                <p className="font-semibold text-white">High</p>
              </div>
              <div className="bg-white/10 rounded-2xl px-3 py-2 border border-white/15">
                <p className="text-[11px] uppercase tracking-wide text-teal-100/80">
                  Antioxidant Level
                </p>
                <p className="font-semibold text-white">High</p>
              </div>
              <div className="bg-white/10 rounded-2xl px-3 py-2 border border-white/15">
                <p className="text-[11px] uppercase tracking-wide text-teal-100/80">
                  Fiber Support
                </p>
                <p className="font-semibold text-white">Medium</p>
              </div>
              <div className="bg-white/10 rounded-2xl px-3 py-2 border border-white/15">
                <p className="text-[11px] uppercase tracking-wide text-teal-100/80">
                  Hydration Score
                </p>
                <p className="font-semibold text-white">High</p>
              </div>
            </div>
          </div>
        </motion.section>

        {/* WHY COLD PRESSED */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.7, ease: "easeOut" }}
        >
          <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4 mb-7">
            <div>
              <h2 className="font-playfair text-2xl md:text-3xl font-semibold mb-2">
                Kenapa <span className="text-[#0FA3A8]">cold-pressed</span> dan
                bukan jus biasa?
              </h2>
              <p className="font-inter text-sm md:text-base text-gray-600 max-w-xl">
                KOJE24 menggunakan pendekatan yang menjaga nutrisi tetap
                maksimal. Bukan sekadar rasanya enak, tapi cara pembuatannya
                juga kami jaga.
              </p>
            </div>
            <p className="text-xs md:text-sm text-gray-500 max-w-sm">
              Dengan gaya hidup yang padat, kamu butuh sesuatu yang{" "}
              <b>praktis tapi tetap sehat</b>. Itu alasan kenapa kami memilih
              format cold-pressed juice.
            </p>
          </div>

          <div className="grid gap-6 md:grid-cols-3">
            {WHY.map((w) => (
              <div
                key={w.title}
                className="rounded-3xl bg-white/90 border border-[#deeeee] p-5 shadow-[0_6px_24px_rgba(0,0,0,0.04)]"
              >
                <h3 className="font-playfair text-lg font-semibold mb-3 text-[#0B4B50]">
                  {w.title}
                </h3>
                <ul className="space-y-1.5 text-sm text-gray-600">
                  {w.points.map((p) => (
                    <li key={p}>• {p}</li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </motion.section>

        {/* TIMING / RITUAL */}
        <motion.section
          initial={{ opacity: 0, y: 22 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.7, ease: "easeOut" }}
        >
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-7">
            <div>
              <h2 className="font-playfair text-2xl md:text-3xl font-semibold mb-2">
                Waktu terbaik untuk menjadikan{" "}
                <span className="text-[#0FA3A8]">KOJE24</span> sebagai ritual.
              </h2>
              <p className="font-inter text-sm md:text-base text-gray-600 max-w-xl">
                Tidak ada aturan kaku, tapi ada beberapa momen yang membuat
                manfaatnya terasa lebih maksimal.
              </p>
            </div>
          </div>

          <div className="relative border-l border-dashed border-[#c8e1e1] pl-5 ml-1 space-y-6">
            {MOMENTS.map((m, idx) => (
              <div key={m.title} className="relative">
                <div className="absolute -left-[9px] top-1 w-4 h-4 rounded-full bg-white border-2 border-[#0FA3A8] shadow-sm" />
                <div className="bg-white/95 border border-[#e1f0f0] rounded-2xl p-4 shadow-[0_4px_18px_rgba(0,0,0,0.03)]">
                  <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-2 mb-1">
                    <h3 className="font-semibold text-sm md:text-base text-[#0B4B50]">
                      {idx + 1}. {m.title}
                    </h3>
                    <span className="text-[11px] md:text-xs px-3 py-1 rounded-full bg-[#f3fbfb] border border-[#d6ecec] text-[#0FA3A8] font-medium">
                      {m.hint}
                    </span>
                  </div>
                  <p className="text-sm text-gray-600 leading-relaxed">
                    {m.desc}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </motion.section>

        {/* CTA FINAL */}
        <motion.section
          initial={{ opacity: 0, y: 25 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.7, ease: "easeOut" }}
          className="mt-4 md:mt-6"
        >
          <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-[#0B4B50] via-[#0C6C72] to-[#0FA3A8] text-white p-6 md:p-8 shadow-[0_14px_45px_rgba(0,0,0,0.25)]">
            <div className="absolute inset-y-0 right-[-80px] w-64 bg-white/10 blur-3xl pointer-events-none" />
            <div className="relative flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div>
                <h2 className="font-playfair text-2xl md:text-3xl font-semibold mb-2">
                  Siap mulai rutinitas sehat versi kamu?
                </h2>
                <p className="font-inter text-sm md:text-base text-white/85 max-w-xl">
                  Pilih varian yang paling cocok dengan kebutuhan hidup harianmu
                  — untuk energi, imun, detox, atau sekadar ingin merasa lebih
                  “ringan” setiap hari.
                </p>
              </div>

              <div className="flex flex-col items-start gap-3 md:items-end">
                <Link
                  href="/#produk"
                  className="inline-flex items-center justify-center px-6 py-3 rounded-full bg-white text-[#0B4B50] font-semibold text-sm md:text-base shadow-md hover:bg-[#f3faf9] active:scale-[0.97] transition-transform"
                >
                  Lihat & Pilih Varian KOJE24
                </Link>
                <a
                  href="https://wa.me/6282213139580?text=Halo%20KOJE24%2C%20aku%20ingin%20konsultasi%20varian%20yang%20cocok%20untuk%20aku."
                  target="_blank"
                  rel="noreferrer"
                  className="text-xs md:text-sm text-white/80 hover:text-white underline-offset-2 hover:underline"
                >
                  Atau tanya dulu via WhatsApp sebelum order →
                </a>
              </div>
            </div>
          </div>
        </motion.section>
      </div>
    </main>
  )
}
