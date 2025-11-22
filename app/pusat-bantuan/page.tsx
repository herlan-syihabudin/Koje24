"use client"

import { useEffect, useState, FormEvent } from "react"
import { motion } from "framer-motion"
import { Search, User, ShoppingBag, CreditCard, Truck, RefreshCcw, Percent, MessageCircle, HelpCircle } from "lucide-react"

type Topic = {
  id: string
  label: string
  description: string
  icon: React.ComponentType<{ className?: string }>
}

const topics: Topic[] = [
  { id: "akun", label: "Akun & Keamanan", description: "Login, password, dan data pribadimu.", icon: User },
  { id: "pesanan", label: "Pesanan", description: "Lihat status dan detail pesanan KOJE24.", icon: ShoppingBag },
  { id: "pembayaran", label: "Pembayaran", description: "Metode bayar, konfirmasi, dan kendala transaksi.", icon: CreditCard },
  { id: "pengiriman", label: "Pengiriman", description: "Jadwal kirim, resi, dan perubahan alamat.", icon: Truck },
  { id: "refund", label: "Pengembalian Dana", description: "Proses refund & syarat pengembalian.", icon: RefreshCcw },
  { id: "komplain", label: "Komplain Pesanan", description: "Pesanan rusak, kurang, atau tidak sesuai.", icon: MessageCircle },
  { id: "promo", label: "Promosi", description: "Kode promo, voucher, & langganan.", icon: Percent },
  { id: "lainnya", label: "Lainnya", description: "Topik lain di luar kategori di atas.", icon: HelpCircle },
]

const faqs = [
  {
    question: "Apa itu KOJE24?",
    answer:
      "KOJE24 adalah minuman cold-pressed alami tanpa gula tambahan, tanpa pengawet, dan tanpa pewarna buatan. Dibuat harian dari bahan segar.",
  },
  {
    question: "Berapa lama masa simpan jus KOJE24?",
    answer:
      "Dalam kondisi tertutup rapat dan disimpan di chiller 0–4°C, jus KOJE24 idealnya dikonsumsi dalam 2–3 hari untuk kualitas rasa dan nutrisi terbaik.",
  },
  {
    question: "Bagaimana cara memesan KOJE24?",
    answer:
      "Kamu bisa pesan langsung melalui website ini. Pilih varian, masukkan ke keranjang, isi data pengiriman, lalu selesaikan pembayaran.",
  },
]

export default function PusatBantuanPage() {
  const [greeting, setGreeting] = useState("Malam")
  const [query, setQuery] = useState("")
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(0)

  // Tentukan salam berdasarkan waktu lokal user (WIB kira-kira sama, cukup client-side)
  useEffect(() => {
    const now = new Date()
    const hour = now.getHours()

    if (hour >= 5 && hour < 11) setGreeting("Pagi")
    else if (hour >= 11 && hour < 15) setGreeting("Siang")
    else if (hour >= 15 && hour < 18) setGreeting("Sore")
    else setGreeting("Malam")
  }, [])

  function handleAsk(e: FormEvent) {
  e.preventDefault()
  const trimmed = query.trim()
  if (!trimmed) return

  // 🔥 Trigger untuk buka KOJE24 Assistant
  window.dispatchEvent(
    new CustomEvent("open-koje24", { detail: trimmed })
  )

  // optional bersihin input
  setQuery("")
}

    // 👉 TEMPAT MASUK BOT
    // Di sini nanti lu sambungin ke KOJE24 Assistant.
    // Misal:
    // window.KOJE24Assistant?.open(trimmed)
    console.log("Tanya KOJE24:", trimmed)

    // optional: clear / biarin isi query-nya
  }

  return (
    <main className="min-h-screen bg-gradient-to-b from-[#f5fbfb] to-white">
      <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pt-10 pb-12">
        {/* Breadcrumb kecil */}
        <div className="inline-flex items-center gap-2 rounded-full bg-white/80 border border-[#d7ecec] px-4 py-1 text-xs font-medium text-[#0b4b50] shadow-sm mb-6">
          <span className="h-2 w-2 rounded-full bg-[#0FA3A8]" />
          Pusat Bantuan KOJE24
        </div>

        <div className="grid gap-10 lg:grid-cols-[minmax(0,1.6fr)_minmax(0,1.1fr)] items-start">
          {/* Kolom kiri: greeting + search */}
          <div>
            <motion.h1
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-3xl sm:text-4xl lg:text-4xl font-semibold text-[#0b4b50] tracking-tight mb-3"
            >
              Selamat {greeting},<br />
              <span className="text-[#0FA3A8]">ada yang bisa kami bantu?</span>
            </motion.h1>

            <p className="text-sm sm:text-base text-slate-600 max-w-xl mb-6">
              Ketik pertanyaanmu seputar varian jus, manfaat, pemesanan, pengiriman, atau penyimpanan. KOJE24 akan bantu
              jawab secepat mungkin.
            </p>

            {/* Search bar = pintu ke bot, tanpa kata "chatbot" */}
            <form onSubmit={handleAsk} className="relative mb-4">
              <div className="flex items-center gap-3 rounded-full bg-white border border-[#d7ecec] px-4 py-3 shadow-sm focus-within:ring-2 focus-within:ring-[#0FA3A8]/40">
                <Search className="h-4 w-4 text-slate-400" />
                <input
                  type="text"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  className="flex-1 bg-transparent text-sm sm:text-base outline-none placeholder:text-slate-400"
                  placeholder="Tulis pertanyaanmu di sini, misalnya: “Jus yang cocok untuk maag apa?”"
                />
                <button
                  type="submit"
                  className="hidden sm:inline-flex items-center justify-center rounded-full bg-[#0FA3A8] px-4 py-2 text-xs font-semibold text-white shadow hover:bg-[#0b8f93] transition"
                >
                  Tanya KOJE24
                </button>
              </div>
              {/* Tombol untuk mobile */}
              <button
                type="submit"
                className="sm:hidden mt-3 w-full rounded-full bg-[#0FA3A8] py-2.5 text-xs font-semibold text-white shadow hover:bg-[#0b8f93] transition"
              >
                Tanya KOJE24
              </button>
            </form>

            <p className="text-[11px] sm:text-xs text-slate-500">
              Online • Jawaban cepat dalam hitungan detik (tanpa perlu menyebut kata “chatbot” 🤫)
            </p>
          </div>

          {/* Kolom kanan: rekomendasi cepat (seperti Tokped) */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-2xl border border-[#d7ecec] shadow-sm p-5 sm:p-6"
          >
            <div className="text-xs font-semibold text-[#0FA3A8] mb-2">Rekomendasi cepat</div>
            <h2 className="text-sm sm:text-base font-semibold text-[#0b4b50] mb-2">
              Pertanyaan yang paling sering ditanyakan
            </h2>
            <p className="text-xs sm:text-sm text-slate-600 mb-4">
              Misalnya: “Yang cocok buat maag apa?”, “Kalau buat imun harian?”, atau “Cara order paket langganan
              gimana?”.
            </p>

            <ul className="space-y-2 mb-4 text-xs sm:text-sm text-slate-600">
              <li>• Pilih varian sesuai kebutuhan harianmu (Detox, Imun, Maag, dll).</li>
              <li>• Cek jadwal kirim & area layanan sebelum checkout.</li>
              <li>• Chat KOJE24 kalau butuh rekomendasi personal.</li>
            </ul>

            <div className="flex flex-wrap gap-2 text-[11px] sm:text-xs">
              <span className="inline-flex items-center rounded-full bg-[#f0fbfb] text-[#0b4b50] px-3 py-1 border border-[#d7ecec]">
                Detox & pencernaan
              </span>
              <span className="inline-flex items-center rounded-full bg-[#f0fbfb] text-[#0b4b50] px-3 py-1 border border-[#d7ecec]">
                Imun & stamina harian
              </span>
              <span className="inline-flex items-center rounded-full bg-[#f0fbfb] text-[#0b4b50] px-3 py-1 border border-[#d7ecec]">
                Aman untuk maag
              </span>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Grid Topik seperti Tokped tapi visual KOJE24 */}
      <section className="border-t border-[#e1f0f0] bg-white/60">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
          <h2 className="text-lg sm:text-xl font-semibold text-[#0b4b50] mb-1">
            Pilih topik sesuai kendalamu
          </h2>
          <p className="text-xs sm:text-sm text-slate-600 mb-6">
            Supaya bantuan lebih cepat, mulai dari kategori yang paling mendekati pertanyaanmu.
          </p>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {topics.map((topic) => {
              const Icon = topic.icon
              return (
                <button
                  key={topic.id}
                  className="group flex flex-col items-start gap-2 rounded-2xl bg-white border border-[#d7ecec] px-4 py-4 text-left shadow-xs hover:shadow-md hover:border-[#0FA3A8]/50 transition"
                  type="button"
                >
                  <span className="inline-flex items-center justify-center rounded-xl bg-[#f0fbfb] p-2 mb-1">
                    <Icon className="h-4 w-4 text-[#0FA3A8]" />
                  </span>
                  <div className="text-sm font-semibold text-[#0b4b50] group-hover:text-[#0FA3A8]">
                    {topic.label}
                  </div>
                  <p className="text-xs text-slate-600">{topic.description}</p>
                </button>
              )
            })}
          </div>
        </div>
      </section>

      {/* FAQ tetap ada di bawah */}
      <section className="bg-gradient-to-b from-white to-[#f5fbfb] border-t border-[#e1f0f0]">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-12">
          <h2 className="text-xl sm:text-2xl font-semibold text-[#0b4b50] text-center mb-2">
            Pertanyaan yang Sering Diajukan
          </h2>
          <p className="text-xs sm:text-sm text-slate-600 text-center mb-8">
            Temukan jawaban seputar KOJE24 — dari penyimpanan, manfaat, sampai cara pemesanan 🍃
          </p>

          <div className="space-y-3">
            {faqs.map((faq, idx) => {
              const isOpen = openFaqIndex === idx
              return (
                <div
                  key={faq.question}
                  className="rounded-2xl bg-white border border-[#d7ecec] shadow-xs overflow-hidden"
                >
                  <button
                    type="button"
                    onClick={() => setOpenFaqIndex(isOpen ? null : idx)}
                    className="w-full flex items-center justify-between px-4 sm:px-5 py-3 sm:py-4 text-left"
                  >
                    <span className="text-sm sm:text-base font-medium text-[#0b4b50]">
                      {faq.question}
                    </span>
                    <span className="ml-4 flex h-6 w-6 items-center justify-center rounded-full bg-[#f0fbfb] text-[#0b4b50] text-xs">
                      {isOpen ? "−" : "+"}
                    </span>
                  </button>
                  {isOpen && (
                    <div className="px-4 sm:px-5 pb-4 text-xs sm:text-sm text-slate-600">
                      {faq.answer}
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        </div>
      </section>
    </main>
  )
}
