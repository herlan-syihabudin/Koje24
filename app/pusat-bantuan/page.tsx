"use client"

import { useEffect, useState, FormEvent } from "react"
import type { ComponentType } from "react"
import { motion } from "framer-motion"
import Link from "next/link"
import dynamic from "next/dynamic"

import {
  Search,
  User,
  ShoppingBag,
  CreditCard,
  Truck,
  RefreshCcw,
  Percent,
  MessageCircle,
  HelpCircle,
} from "lucide-react"

/* ===============================
   CHATBOT (NO SSR)
================================ */
const KOJE24Assistant = dynamic(() => import("@/components/KOJE24Assistant"), {
  ssr: false,
})

/* ===============================
   TYPES
================================ */
type Topic = {
  id: string
  label: string
  description: string
  icon: ComponentType<{ className?: string }>
}

/* ===============================
   TOPICS
================================ */
const topics: Topic[] = [
  {
    id: "akun",
    label: "Akun & Keamanan",
    description: "Login, password, dan data pribadimu.",
    icon: User,
  },
  {
    id: "pesanan",
    label: "Pesanan",
    description: "Lihat status dan detail pesanan KOJE24.",
    icon: ShoppingBag,
  },
  {
    id: "pembayaran",
    label: "Pembayaran",
    description: "Metode bayar, konfirmasi, dan kendala transaksi.",
    icon: CreditCard,
  },
  {
    id: "pengiriman",
    label: "Pengiriman",
    description: "Jadwal kirim, resi, dan perubahan alamat.",
    icon: Truck,
  },
  {
    id: "refund",
    label: "Pengembalian Dana",
    description: "Proses refund & syarat pengembalian.",
    icon: RefreshCcw,
  },
  {
    id: "komplain",
    label: "Komplain Pesanan",
    description: "Pesanan rusak, kurang, atau tidak sesuai.",
    icon: MessageCircle,
  },
  {
    id: "promo",
    label: "Promosi",
    description: "Kode promo, voucher, & langganan.",
    icon: Percent,
  },
  {
    id: "lainnya",
    label: "Lainnya",
    description: "Topik lain di luar kategori di atas.",
    icon: HelpCircle,
  },
]

/* ===============================
   FAQ
================================ */
const faqs = [
  {
    question: "Apa itu KOJE24?",
    answer:
      "KOJE24 adalah minuman cold-pressed alami tanpa gula tambahan, tanpa pengawet, dan tanpa pewarna buatan. Dibuat harian dari bahan segar.",
  },
  {
    question: "Berapa lama masa simpan jus KOJE24?",
    answer:
      "Dalam kondisi tertutup rapat dan disimpan di chiller 0–4°C, jus KOJE24 idealnya dikonsumsi dalam 2–3 hari.",
  },
  {
    question: "Bagaimana cara memesan KOJE24?",
    answer:
      "Pilih varian → masukkan ke keranjang → isi alamat → lakukan pembayaran → pesanan diproses.",
  },
]

/* ===============================
   PAGE
================================ */
export default function PusatBantuanPage() {
  const [greeting, setGreeting] = useState("Malam")
  const [query, setQuery] = useState("")
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(null)

  /* Greeting otomatis */
  useEffect(() => {
    const hour = new Date().getHours()
    if (hour >= 5 && hour < 11) setGreeting("Pagi")
    else if (hour >= 11 && hour < 15) setGreeting("Siang")
    else if (hour >= 15 && hour < 18) setGreeting("Sore")
    else setGreeting("Malam")
  }, [])

  /* Kirim pertanyaan ke AI */
  function handleAsk(e: FormEvent) {
    e.preventDefault()
    if (!query.trim()) return

    window.dispatchEvent(
      new CustomEvent("open-koje24", {
        detail: {
          type: "help",
          query,
        },
      })
    )

    setQuery("")
  }

  return (
    <main className="min-h-screen bg-gradient-to-b from-[#f5fbfb] to-white">
      {/* ================= HERO ================= */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pt-10 pb-12">
        <motion.h1
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-3xl sm:text-4xl font-semibold text-[#0b4b50] mb-3"
        >
          Selamat {greeting}, <br />
          <span className="text-[#0FA3A8]">ada yang bisa kami bantu?</span>
        </motion.h1>

        <form onSubmit={handleAsk} className="max-w-xl">
          <div className="flex items-center gap-3 rounded-full bg-white border border-[#d7ecec] px-4 py-3 shadow-sm">
            <Search className="h-4 w-4 text-slate-400" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Tulis pertanyaanmu…"
              className="flex-1 bg-transparent outline-none text-sm"
            />
            <button
              type="submit"
              className="rounded-full bg-[#0FA3A8] px-4 py-2 text-xs font-semibold text-white"
            >
              Tanya
            </button>
          </div>
        </form>
      </section>

      {/* ================= TOPICS ================= */}
      <section className="border-t border-[#e1f0f0] bg-white/60">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-10">
          <h2 className="text-lg font-semibold text-[#0b4b50] mb-4">
            Pilih topik sesuai kendalamu
          </h2>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {topics.map((topic) => {
              const Icon = topic.icon
              return (
                <Link
                  key={topic.id}
                  href={`/pusat-bantuan/${topic.id}`}
                  className="group flex flex-col gap-2 rounded-2xl bg-white border border-[#d7ecec] px-4 py-4 hover:border-[#0FA3A8] hover:shadow-md transition"
                >
                  <span className="inline-flex w-fit rounded-xl bg-[#f0fbfb] p-2">
                    <Icon className="h-4 w-4 text-[#0FA3A8]" />
                  </span>

                  <div className="text-sm font-semibold text-[#0b4b50] group-hover:text-[#0FA3A8]">
                    {topic.label}
                  </div>

                  <p className="text-xs text-slate-600">
                    {topic.description}
                  </p>
                </Link>
              )
            })}
          </div>
        </div>
      </section>

      {/* ================= FAQ ================= */}
      <section className="border-t border-[#e1f0f0] py-10">
        <div className="max-w-4xl mx-auto px-4">
          <h2 className="text-xl font-semibold text-[#0b4b50] text-center mb-4">
            Pertanyaan Umum
          </h2>

          {faqs.map((faq, i) => (
            <div key={faq.question} className="mb-3 rounded-xl border bg-white">
              <button
                onClick={() =>
                  setOpenFaqIndex(openFaqIndex === i ? null : i)
                }
                className="w-full px-4 py-3 text-left font-medium"
              >
                {faq.question}
              </button>

              {openFaqIndex === i && (
                <div className="px-4 pb-4 text-sm text-slate-600">
                  {faq.answer}
                </div>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* ================= CHATBOT ================= */}
      <KOJE24Assistant />
    </main>
  )
}
