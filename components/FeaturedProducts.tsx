"use client"

import Image from "next/image"
import { useEffect, useMemo, useState } from "react"
import { useCartStore } from "@/stores/cartStore"
import { useBestSellerRanking } from "@/lib/bestSeller"
import { products } from "@/lib/products"
import type { Product } from "@/types"

// === TYPES ===
interface SheetRow {
  kode: string;
  harga: string | number;
  hargapromo: string | number;
  img: string | null;
  active: string;
}

interface SheetMap {
  [key: string]: {
    harga: number;
    promo: number;
    img: string | null;
    active: boolean;
  };
}

interface RankStats {
  [key: string]: { count: number };
}

// === CONSTANTS ===
const FALLBACK_IDS = process.env.NEXT_PUBLIC_FALLBACK_IDS?.split(',') || ["1", "2", "3"]

const formatIDR = (n: number) => {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(n);
};

export default function FeaturedProducts() {
  const addToCart = useCartStore((s) => s.addItem)
  const rankStats = useBestSellerRanking() as RankStats

  const [sheetData, setSheetData] = useState<SheetMap>({})
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // =========================
  // LOAD DATA GOOGLE SHEET
  // =========================
  useEffect(() => {
    let isMounted = true;

    fetch("/api/master-produk", { cache: "no-store" })
      .then((r) => {
        if (!r.ok) throw new Error(`HTTP ${r.status}`)
        return r.json()
      })
      .then((rows: SheetRow[]) => {
        if (!isMounted) return;
        
        const map: SheetMap = {}
        rows.forEach((x) => {
          map[x.kode] = {
            harga: Number(x.harga) || 0,
            promo: Number(x.hargapromo) || 0,
            img: x.img || null,
            active: String(x.active).toLowerCase() === "true",
          }
        })
        setSheetData(map)
        setError(null)
      })
      .catch((err) => {
        if (!isMounted) return;
        console.error("Failed to fetch sheet data:", err)
        setError("Gagal memuat data produk")
      })
      .finally(() => {
        if (isMounted) setLoading(false)
      })

    return () => {
      isMounted = false
    }
  }, [])

  // =========================
  // HITUNG FEATURED PRODUK
  // =========================
  const featured = useMemo(() => {
    if (loading || error) return []

    const activeProducts = products.filter((p) => {
      const db = sheetData[p.id]
      return db ? db.active !== false : true
    })

    // Gabungkan dengan best seller score
    const scored = activeProducts.map((p) => {
      const stats = rankStats[String(p.id)]
      const score = stats?.count || 0

      return {
        ...p,
        __score: score,
        __isPackage: p.isPackage === true,
      }
    })

    // Sort: 1. Package dulu, 2. Score tertinggi
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
  }, [rankStats, sheetData, loading, error])

  // =========================
  // HANDLE ADD TO CART
  // =========================
  const handleAddToCart = (product: Product & { price: number; img: string }) => {
    if (product.isPackage) {
      window.dispatchEvent(
        new CustomEvent("open-package", {
          detail: {
            id: product.id,
            name: product.name,
            price: product.price,
            img: product.img,
            items: product.items, // Pastikan package punya items
          },
        })
      )
    } else {
      addToCart({
        id: product.id,
        name: product.name,
        price: product.price,
        img: product.img,
      })
    }
  }

  // =========================
  // LOADING STATE
  // =========================
  if (loading) {
    return <FeaturedProductsSkeleton />
  }

  // =========================
  // ERROR STATE
  // =========================
  if (error || featured.length === 0) {
    return (
      <section className="bg-white py-16 md:py-20 px-6 md:px-14 lg:px-24">
        <div className="max-w-6xl mx-auto text-center">
          <p className="text-gray-500">
            {error || "Tidak ada produk yang tersedia saat ini"}
          </p>
        </div>
      </section>
    )
  }

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
                <div className="relative h-[220px] bg-white overflow-hidden">
                  <Image
                    src={img}
                    alt={p.name}
                    fill
                    sizes="(max-width: 768px) 100vw, 33vw"
                    className="object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  {db?.promo && db.promo > 0 && (
                    <div className="absolute top-3 left-3 bg-red-500 text-white text-xs px-2 py-1 rounded-full">
                      Promo
                    </div>
                  )}
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
                    <p className="text-sm text-gray-600 mb-4 leading-relaxed line-clamp-2">
                      {p.desc}
                    </p>
                  )}

                  <div className="mt-auto flex items-center justify-between">
                    <div className="flex flex-col">
                      <span className="font-bold text-lg text-[#0B4B50]">
                        {formatIDR(price)}
                      </span>
                      {db?.harga && db.promo > 0 && (
                        <span className="text-xs text-gray-400 line-through">
                          {formatIDR(db.harga)}
                        </span>
                      )}
                    </div>

                    <button
                      onClick={() => handleAddToCart({ ...p, price, img })}
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

// SKELETON COMPONENT
function FeaturedProductsSkeleton() {
  return (
    <section className="bg-white py-16 md:py-20 px-6 md:px-14 lg:px-24">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-12">
          <div className="h-10 w-64 bg-gray-200 rounded mx-auto mb-3 animate-pulse" />
          <div className="h-6 w-96 max-w-full bg-gray-200 rounded mx-auto animate-pulse" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {[1, 2, 3].map((i) => (
            <div key={i} className="bg-[#f8fcfc] rounded-3xl overflow-hidden shadow">
              <div className="h-[220px] bg-gray-200 animate-pulse" />
              <div className="p-6 space-y-3">
                <div className="h-6 w-3/4 bg-gray-200 rounded animate-pulse" />
                <div className="h-4 w-1/2 bg-gray-200 rounded animate-pulse" />
                <div className="h-4 w-full bg-gray-200 rounded animate-pulse" />
                <div className="flex justify-between items-center pt-3">
                  <div className="h-6 w-20 bg-gray-200 rounded animate-pulse" />
                  <div className="h-8 w-20 bg-gray-200 rounded-full animate-pulse" />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
