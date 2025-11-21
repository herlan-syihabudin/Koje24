// app/manfaat/page.tsx

import Link from "next/link"

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

export default function ManfaatPage() {
  return (
    <main className="min-h-screen bg-gradient-to-b from-[#f8fcfc] via-[#f2f9f9] to-[#e6f3f3] text-[#0B4B50]">
      <div className="max-w-6xl mx-auto px-6 md:px-10 lg:px-16 py-16 md:py-20">
        {/* HERO */}
        <section className="mb-14 md:mb-16">
          <div className="inline-flex items-center gap-2 rounded-full bg-white/70 border border-[#d7ecec] px-4 py-1 text-xs font-medium text-[#0FA3A8] shadow-sm mb-4">
            <span className="w-1.5 h-1.5 rounded-full bg-[#0FA3A8]" />
            Manfaat minum KOJE24 setiap hari
          </div>

          <div className="grid md:grid-cols-[1.4fr_1fr] gap-8 md:gap-10 items-center">
            <div>
              <h1 className="font-playfair text-3xl md:text-4xl lg:text-5xl font-semibold leading-tight mb-4">
                Bukan sekadar jus —{" "}
                <span className="text-[#0FA3A8]">
                  ritual kecil untuk tubuh yang lebih seimbang.
                </span>
              </h1>

              <p className="font-inter text-sm md:text-base text-gray-600 leading-relaxed mb-6 max-w-xl">
                KOJE24 diracik dari perpaduan sayur, buah, dan rempah alami.
                Tanpa gula tambahan, tanpa pengawet, dan tanpa bahan kimia
                yang tidak perlu — supaya yang masuk ke tubuh kamu benar-benar
                sesuatu yang bisa bekerja <b>mendukung kesehatan jangka panjang</b>.
              </p>

              <div className="flex flex-wrap gap-3 mb-6">
                <span className="px-4 py-2 rounded-full bg-white border border-[#dbeeee] text-xs md:text-sm text-[#0B4B50] shadow-[0_4px_14px_rgba(15,163,168,0.08)]">
                  🍃 Cold-pressed, bukan sekadar diblender
                </span>
                <span className="px-4 py-2 rounded-full bg-white border border-[#dbeeee] text-xs md:text-sm text-[#0B4B50] shadow-[0_4px_14px_rgba(15,163,168,0.08)]">
                  💧 Tanpa gula & pengawet
                </span>
                <span className="px-4 py-2 rounded-full bg-white border border-[#dbeeee] text-xs md:text-sm text-[#0B4B50] shadow-[0_4px_14px_rgba(15,163,168,0.08)]">
                  🌗 Cocok untuk morning & night routine
                </span>
              </div>

              <div className="flex flex-wrap items-center gap-3">
                <Link
                  href="/#produk"
                  className="inline-flex items-center justify-center px-6 py-3 rounded-full bg-[#0FA3A8] text-white text-sm md:text-base font-semibold shadow-[0_6px_22px_rgba(15,163,168,0.45)] hover:bg-[#0DC1C7] active:scale-[0.97] transition-transform transition-colors"
                >
                  Lihat Varian KOJE24
                </Link>
                <p className="text-xs md:text-sm text-gray-500">
                  Atur ritme sehat mulai dari 1 botol per hari.
                </p>
              </div>
            </div>

            <div className="relative">
              <div className="absolute -top-6 -right-2 w-32 h-32 bg-[#0FA3A8]/15 blur-3xl rounded-full pointer-events-none" />
              <div className="absolute bottom-0 -left-4 w-28 h-28 bg-[#E8C46B]/25 blur-3xl rounded-full pointer-events-none" />

              <div className="relative rounded-3xl bg-white/80 border border-[#e0f1f1] shadow-[0_15px_45px_rgba(0,0,0,0.06)] p-5 flex flex-col gap-3">
                <div className="text-xs font-semibold uppercase tracking-[0.18em] text-[#0FA3A8] mb-1">
                  Quick snapshot
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

                <p className="mt-2 text-[11px] text-gray-500">
                  Catatan: KOJE24 bukan obat dan tidak menggantikan konsultasi
                  profesional medis. Ini adalah <b>supportive habit</b> untuk
                  gaya hidup sehat kamu.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* BENEFIT GRID */}
        <section className="mb-16 md:mb-20">
          <h2 className="font-playfair text-2xl md:text-3xl font-semibold mb-3">
            Manfaat utama ketika kamu rutin minum{" "}
            <span className="text-[#0FA3A8]">KOJE24</span>
          </h2>
          <p className="font-inter text-sm md:text-base text-gray-600 mb-8 max-w-2xl">
            Kamu bisa mulai dari 1–2 botol per hari, lalu sesuaikan dengan
            kebutuhan tubuh. Setiap varian punya fungsi, tapi garis besarnya
            kurang lebih seperti ini:
          </p>

          <div className="grid gap-6 md:gap-7 md:grid-cols-2">
            {BENEFITS.map((b) => (
              <div
                key={b.title}
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
              </div>
            ))}
          </div>
        </section>

        {/* WHY COLD-PRESSED / WHY KOJE24 */}
        <section className="mb-16 md:mb-20">
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
        </section>

        {/* TIMING / RITUAL */}
        <section className="mb-18 md:mb-20">
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
        </section>

        {/* CTA FINAL */}
        <section className="mt-10 md:mt-12">
          <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-[#0B4B50] via-[#0C6C72] to-[#0FA3A8] text-white p-6 md:p-8 shadow-[0_14px_45px_rgba(0,0,0,0.25)]">
            <div className="absolute inset-y-0 right-[-80px] w-64 bg-white/5 blur-3xl pointer-events-none" />
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
                  className="text-xs md:text-sm text-white/80 hover:text-white underline-offset-2 hover:underline"
                  rel="noreferrer"
                >
                  Atau tanya dulu via WhatsApp sebelum order →
                </a>
              </div>
            </div>
          </div>
        </section>
      </div>
    </main>
  )
}
