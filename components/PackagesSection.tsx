"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"

interface SheetRow {
  kode: string;
  harga: string | number;
  hargapromo: string | number;
  active: string;
}

interface Package {
  id: string;
  name: string;
  price: number;
  desc: string;
  popular?: boolean;
}

const plansLocal: Package[] = [
  { id: "7", name: "7 Hari Detox Plan", price: 120000, desc: "Cocok untuk start ringan." },
  { id: "14", name: "14 Hari Vitality", price: 230000, desc: "Stamina & kebiasaan sehat.", popular: true },
  { id: "30", name: "30 Hari Premium Plan", price: 450000, desc: "Perubahan terasa maksimal." },
]

export default function PackagesSection() {
  const [sheetData, setSheetData] = useState<Record<string, any>>({})
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Fetch data dari Google Sheet
  useEffect(() => {
    let isMounted = true

    fetch("/api/master-produk", { cache: "no-store" })
      .then((r) => {
        if (!r.ok) throw new Error(`HTTP ${r.status}`)
        return r.json()
      })
      .then((rows: SheetRow[]) => {
        if (!isMounted) return
        
        const map: Record<string, any> = {}
        rows.forEach((x) => {
          map[x.kode] = {
            harga: Number(x.harga) || 0,
            promo: Number(x.hargapromo) || 0,
            active: String(x.active).toLowerCase() === "true",
          }
        })
        setSheetData(map)
        setError(null)
      })
      .catch((err) => {
        console.error("Failed to fetch package data:", err)
        setError("Gagal memuat data paket")
      })
      .finally(() => {
        if (isMounted) setLoading(false)
      })

    return () => { isMounted = false }
  }, [])

  const openPackage = (name: string, price: number) => {
    window.dispatchEvent(new CustomEvent("open-package", { 
      detail: { name, price } 
    }))
  }

  // Loading state
  if (loading) {
    return <PackagesSkeleton />
  }

  // Error state
  if (error) {
    return (
      <section className="bg-gradient-to-b from-white to-[#f3fafa] py-20 px-6 text-center">
        <p className="text-red-500">{error}</p>
      </section>
    )
  }

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
        {plansLocal.map((p, index) => {
          const db = sheetData[p.id]

          // Skip if inactive in sheet
          if (db && db.active === false) return null

          // Price priority: promo → normal → local
          const price =
            db?.promo && db.promo > 0 ? db.promo :
            db?.harga && db.harga > 0 ? db.harga :
            p.price

          const discount = db?.promo > 0 && db?.harga > db?.promo
            ? Math.round((1 - db.promo / db.harga) * 100)
            : 0

          return (
            <motion.div
              key={p.id}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              viewport={{ once: true, amount: 0.3 }}
              className="
                group relative rounded-3xl bg-white px-7 py-8 cursor-pointer
                border border-white/60 shadow-[0_8px_25px_rgba(0,0,0,0.04)]
                hover:shadow-[0_18px_45px_rgba(15,163,168,0.20)]
                hover:-translate-y-2 hover:border-[#0FA3A8]/40
                transition-all duration-500
              "
            >
              {/* Background gradient on hover */}
              <div className="absolute inset-0 opacity-0 group-hover:opacity-100 bg-gradient-to-br from-[#0FA3A8]/5 to-transparent rounded-3xl transition-opacity duration-500" />

              {/* Popular badge */}
              {p.popular && (
                <div className="absolute top-3 left-3 bg-[#E8C46B] text-[#0B4B50] text-xs px-3 py-1 rounded-full font-medium z-10">
                  🌟 Paling Populer
                </div>
              )}

              {/* Discount badge */}
              {discount > 0 && (
                <div className="absolute top-3 right-3 bg-red-500 text-white text-xs px-3 py-1 rounded-full font-medium z-10">
                  Hemat {discount}%
                </div>
              )}

              <h3 className="text-xl font-semibold text-[#0B4B50] mb-1 font-playfair relative z-10">
                {p.name}
              </h3>

              <p className="text-sm text-gray-600 mb-5 font-inter relative z-10 min-h-[40px]">
                {p.desc}
              </p>

              <div className="mb-6 relative z-10">
                {db?.promo > 0 && db?.harga > db?.promo && (
                  <span className="text-sm text-gray-400 line-through mr-2">
                    Rp{db.harga.toLocaleString("id-ID")}
                  </span>
                )}
                <span className="text-3xl font-bold text-[#0FA3A8]">
                  Rp{price.toLocaleString("id-ID")}
                </span>
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
            </motion.div>
          )
        })}
      </div>
    </section>
  )
}

// Skeleton component for loading state
function PackagesSkeleton() {
  return (
    <section className="bg-gradient-to-b from-white to-[#f3fafa] py-20 md:py-28 px-6">
      <div className="text-center mb-14">
        <div className="h-10 w-64 bg-gray-200 rounded mx-auto mb-3 animate-pulse" />
        <div className="h-6 w-96 max-w-full bg-gray-200 rounded mx-auto animate-pulse" />
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
        {[1, 2, 3].map((i) => (
          <div key={i} className="bg-white rounded-3xl p-7 shadow">
            <div className="h-6 w-3/4 bg-gray-200 rounded mb-2 animate-pulse" />
            <div className="h-4 w-full bg-gray-200 rounded mb-5 animate-pulse" />
            <div className="h-8 w-1/2 bg-gray-200 rounded mb-6 animate-pulse" />
            <div className="h-12 w-full bg-gray-200 rounded-full animate-pulse" />
          </div>
        ))}
      </div>
    </section>
  )
}
