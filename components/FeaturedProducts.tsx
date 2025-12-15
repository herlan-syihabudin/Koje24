"use client"

import Image from "next/image"
import { useEffect, useMemo, useState } from "react"
import { useCartStore } from "@/stores/cartStore"
import { useBestSellerRanking } from "@/lib/bestSeller"
import { products } from "@/lib/products"

// === FALLBACK JIKA DATA KOSONG ===
const FALLBACK_IDS = ["1", "2", "3"]

const formatIDR = (n: number) => `Rp${n.toLocaleString("id-ID")}`

type SheetMap = Record<
  string,
  {
    harga: number
    promo: number
    img: string | null
    active: boolean
  }
>

export default function FeaturedProducts() {
  const addToCart = useCartStore((s) => s.addItem)
  const rankStats = useBestSellerRanking()

  const [sheetData, setSheetData] = useState<SheetMap>({})

  // =========================
  // LOAD DATA GOOGLE SHEET
  // =========================
  useEffect(() => {
    fetch("/api/master-produk", { cache: "no-store" })
      .then((r) => r.json())
      .then((rows) => {
        const map: SheetMap = {}
        rows.forEach((x: any) => {
          map[x.kode] = {
            harga: Number(x.harga) || 0,
            promo: Number(x.hargapromo) || 0,
            img: x.img || null,
            active: String(x.active).toLowerCase() === "true",
          }
        })
        setSheetData(map)
      })
      .catch(() => {})
  }, [])

  // =========================
  // HITUNG FEATURED PRODUK
  // =========================
  const featured = useMemo(() => {
    const activeProducts = products.filter((p) => {
      const db = sheetData[p.id]
      return db ? db.active !== false : true
    })

    // Gabungkan dengan best seller score
    const scored = activeProducts.map((p) => {
      const stats = (rankStats as any)[Number(p.id)]
      const score = stats?.count || 0

      return {
        ...p,
        __score: score,
        __isPackage: p.isPackage === true,
      }
    })

    // Sort:
    // 1. Package dulu
    // 2. Score tertinggi
    const sorted = scored.sort((a, b) => {
      if (a.__isPackage && !b.__isPackage) return -1
      if (!a.__isPackage && b.__isPackage) return 1
      return b.__score - a.__score
    })

    // Ambil top 3
    const top = sorted.slice(0, 3)

    // Fallback kalau kosong
    if (top.length === 0) {
      return products.filter((p) => FALLBACK_IDS.includes(p.id))
    }

    return top
  }, [rankStats, sheetData])

  if (featured.length === 0) return null

  return (
    <section className="bg-white py-16 md:py-20 px-6 md:px-14 lg:px-24">
      <div className="max-w-6xl mx-auto">

        {/* HEADING */}
        <div className="text-center mb-12">
          <h2 className="font-playfair text-3xl md:text-4xl font-semibold mb-3 text-[#0B4B50]">
            Rekomendasi KOJE24
          </h2>
          <p className="font-inter text-gray-600 max-w-xl mx-auto">
            Produk paling disukai pelanggan & cocok untuk mulai hidup lebih sehat.
          </p>
        </div>

        {/* GRID */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {featured.map((p) => {
            const db = sheetData[p.id]

            const price =
              db?.promo && db.promo > 0
                ? db.promo
                : db?.harga && db.harga > 0
                ? db.harga
                : Number(p.price)

            const img = db?.img ? db.img : p.img

            return (
              <div
                key={p.id}
                className="
                  group bg-[#f8fcfc] rounded-3xl overflow-hidden
                  shadow hover:shadow-xl transition-all duration-300
                "
              >
                {/* IMAGE */}
                <div className="relative h-[220px] bg-white">
                  <Image
                    src={img}
                    alt={p.name}
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                </div>

                {/* CONTENT */}
                <div className="p-6 flex flex-col h-full">
                  <h3 className="font-playfair text-xl font-semibold mb-1 text-[#0B4B50]">
                    {p.name}
                  </h3>

                  {p.slogan && (
                    <p className="text-sm font-semibold text-[#0FA3A8] mb-2">
                      {p.slogan}
                    </p>
                  )}

                  {p.desc && (
                    <p className="text-sm text-gray-600 mb-4 leading-relaxed">
                      {p.desc}
                    </p>
                  )}

                  <div className="mt-auto flex items-center justify-between">
                    <span className="font-bold text-lg text-[#0B4B50]">
                      {formatIDR(price)}
                    </span>

                    <button
                      onClick={() =>
                        p.isPackage
                          ? window.dispatchEvent(
                              new CustomEvent("open-package", {
                                detail: { name: p.name, price },
                              })
                            )
                          : addToCart({
                              id: p.id,
                              name: p.name,
                              price,
                              img,
                            })
                      }
                      className="
                        bg-[#0FA3A8] text-white text-sm px-6 py-2 rounded-full
                        hover:bg-[#0DC1C7] active:scale-95 transition-all
                      "
                    >
                      {p.isPackage ? "Lihat Paket" : "Tambah"}
                    </button>
                  </div>
                </div>
              </div>
            )
          })}
        </div>

      </div>
    </section>
  )
}
