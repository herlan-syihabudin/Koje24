"use client"
import { useState } from "react"
import PaketPopup from "./PaketPopup"

export default function SubscriptionSection() {
  const [selectedPlan, setSelectedPlan] = useState<string | null>(null)

  const plans = [
    {
      id: "7hari",
      title: "7 Hari Detox Plan",
      desc: "Paket pemula untuk detoks ringan dan segar setiap hari.",
      price: "Rp120.000",
    },
    {
      id: "14hari",
      title: "14 Hari Vitality Plan",
      desc: "Cocok untuk menjaga energi & metabolisme lebih stabil.",
      price: "Rp230.000",
    },
    {
      id: "30hari",
      title: "30 Hari Premium Plan",
      desc: "Detoks maksimal selama 1 bulan penuh untuk hasil optimal.",
      price: "Rp450.000",
    },
    {
      id: "reguler",
      title: "Reguler Plan",
      desc: "Pilih produk sesuai keinginan — harga otomatis per botol.",
      price: "Harga per botol Rp18.000",
    },
  ]

  return (
    <section id="langganan" className="bg-[#f9fdfd] text-[#0B4B50] py-24 px-6 md:px-14 lg:px-24">
      <div className="text-center mb-16">
        <h2 className="font-playfair text-3xl md:text-4xl font-semibold mb-3 text-[#0B4B50]">
          Langganan Paket KOJE24
        </h2>
        <p className="font-inter text-gray-600 text-base md:text-lg max-w-2xl mx-auto">
          Pilih paket sesuai kebutuhan detoks kamu — praktis, sehat, dan hemat!
        </p>
      </div>

      {/* Grid Paket */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 max-w-[1280px] mx-auto">
        {plans.map((p) => (
          <div
            key={p.id}
            className="bg-white rounded-3xl border border-[#e6eeee]/60 shadow-[0_5px_20px_rgba(0,0,0,0.05)] hover:-translate-y-2 hover:shadow-[0_10px_35px_rgba(15,163,168,0.25)] transition-all duration-500 flex flex-col p-6 text-center"
          >
            <h3 className="font-playfair text-xl font-semibold mb-2">{p.title}</h3>
            <p className="font-inter text-sm text-gray-700 mb-4 flex-1">{p.desc}</p>
            <div className="text-lg font-bold text-[#0FA3A8] mb-4">{p.price}</div>
            <button
              onClick={() => setSelectedPlan(p.id)}
              className="bg-[#0FA3A8] hover:bg-[#0DC1C7] text-white font-semibold rounded-full py-2.5 px-6 transition-all duration-300 shadow-md"
            >
              Ambil Paket
            </button>
          </div>
        ))}
      </div>

      {/* Popup Pilihan Produk */}
      {selectedPlan && <PaketPopup planId={selectedPlan} onClose={() => setSelectedPlan(null)} />}
    </section>
  )
}
