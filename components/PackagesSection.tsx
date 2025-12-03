"use client"

import { useState, useEffect } from "react"

const plansLocal = [
  { id: "7", name: "7 Hari Detox Plan", price: 120000, desc: "Cocok untuk start ringan." },
  { id: "14", name: "14 Hari Vitality", price: 230000, desc: "Stamina & kebiasaan sehat." },
  { id: "30", name: "30 Hari Premium Plan", price: 450000, desc: "Perubahan terasa maksimal." },
]

export default function PackagesSection() {
  const openPackage = (name: string, price: number) => {
    window.dispatchEvent(new CustomEvent("open-package", { detail: { name, price } }))
  }

  // 🔥 DATA DARI GOOGLE SHEET
  const [sheetData, setSheetData] = useState<Record<string, any>>({})
  useEffect(() => {
    fetch("/api/master-produk", { cache: "no-store" })
      .then((r) => r.json())
      .then((rows) => {
        const map: Record<string, any> = {}
        rows.forEach((x: any) => {
          map[x.kode] = {
            harga: Number(x.harga) || 0,
            promo: Number(x.hargapromo) || 0,
            active: String(x.active).toLowerCase() === "true",
          }
        })
        setSheetData(map)
      })
  }, [])

  return (
    <section
      id="langganan"
      className="relative bg-gradient-to-b from-white to-[#f3fafa] py-20 md:py-28 px-6 md:px-14 lg:px-24 overflow-hidden"
    >
      <div className="absolute inset-0 pointer-events-none bg-[radial-gradient(circle_at_top_right,rgba(15,163,168,0.10),transparent_60%)]" />

      <div className="text-center mb-14 relative z-10">
        <h2 className="font-playfair text-3xl md:text-4xl font-semibold mb-3 text-[#0B4B50]">
          Paket Hemat KOJE24
        </h2>
        <p className="text-gray-600 max-w-2xl mx-auto font-inter">
          Pilih paket siap minum — langsung checkout via WhatsApp tanpa masuk keranjang.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto relative z-10">
        {plansLocal.map((p) => {
          const db = sheetData[p.id]

          // 🔥 PRIORITAS HARGA: promo → normal → lokal
          const price =
            db?.promo && db.promo > 0 ? db.promo :
            db?.harga && db.harga > 0 ? db.harga :
            p.price

          // 🔥 jika sheet active = false → sembunyikan
          if (db && db.active === false) return null

          return (
            <div
              key={p.id}
              className="
                group relative rounded-3xl bg-white px-7 py-8 cursor-pointer
                border border-white/60 shadow-[0_8px_25px_rgba(0,0,0,0.04)]
                hover:shadow-[0_18px_45px_rgba(15,163,168,0.20)]
                hover:-translate-y-2 hover:border-[#0FA3A8]/40
                transition-all duration-500
              "
            >
              <div className="absolute inset-0 opacity-0 group-hover:opacity-100 bg-gradient-to-br from-[#0FA3A8]/5 to-transparent rounded-3xl transition-opacity duration-500" />

              <h3 className="text-xl font-semibold text-[#0B4B50] mb-1 font-playfair relative z-10">
                {p.name}
              </h3>

              <p className="text-sm text-gray-600 mb-5 font-inter relative z-10">
                {p.desc}
              </p>

              <div className="text-3xl font-bold text-[#0FA3A8] mb-6 relative z-10">
                Rp{price.toLocaleString("id-ID")}
              </div>

              <button
                onClick={() => openPackage(p.name, price)}
                className="
                  w-full bg-[#0FA3A8] text-white py-3 rounded-full font-semibold
                  transition-all duration-300 relative z-10
                  hover:bg-[#0DC1C7] hover:scale-[1.04]
                  active:scale-[0.97]
                  shadow-[0_4px_20px_rgba(15,163,168,0.25)]
                "
              >
                Ambil Paket
              </button>
            </div>
          )
        })}
      </div>
    </section>
  )
}
