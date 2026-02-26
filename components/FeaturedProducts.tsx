"use client"

import Image from "next/image"
import { useEffect, useMemo, useState } from "react"
import toast from 'react-hot-toast'
import { motion } from "framer-motion"
import { useCartStore } from "@/stores/cartStore"
import { useBestSellerRanking } from "@/lib/bestSeller"
import { products } from "@/lib/products"

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
const BEST_SELLER_THRESHOLD = 10

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
  const [weeklySales, setWeeklySales] = useState<Record<string, number>>({})
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [animatingId, setAnimatingId] = useState<string | null>(null)
  const [aiScores, setAiScores] = useState<Record<string, number>>({})

  // =========================
  // LOAD DATA GOOGLE SHEET
  // =========================
  useEffect(() => {
    let isMounted = true;

    Promise.all([
      fetch("/api/master-produk", { cache: "no-store" }).then(r => r.json()),
      fetch("/api/weekly-sales", { cache: "no-store" }).then(r => r.json()).catch(() => ({}))
    ])
      .then(([productsData, salesData]) => {
        if (!isMounted) return;
        
        // Process product data
        const map: SheetMap = {}
        productsData.forEach((x: SheetRow) => {
          map[x.kode] = {
            harga: Number(x.harga) || 0,
            promo: Number(x.hargapromo) || 0,
            img: x.img || null,
            active: String(x.active).toLowerCase() === "true",
          }
        })
        setSheetData(map)
        
        // Process sales data
        const salesMap: Record<string, number> = {}
        if (Array.isArray(salesData)) {
          salesData.forEach((item: any) => {
            salesMap[item.id] = item.sold_this_week
          })
        }
        setWeeklySales(salesMap)
        
        setError(null)
      })
      .catch((err) => {
        if (!isMounted) return;
        console.error("Failed to fetch data:", err)
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
    const sorted = [...scored].sort((a, b) => {
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
  // AI RANKING (SIMPLIFIED)
  // =========================
  useEffect(() => {
    if (featured.length === 0) return;
    
    // Simple AI logic based on time and keywords
    const hour = new Date().getHours();
    const month = new Date().getMonth();
    
    const scores: Record<string, number> = {};
    
    featured.forEach(product => {
      let score = 5; // base score
      
      // Time-based
      if (hour < 10 && product.name.toLowerCase().includes('energi')) score += 2;
      if (hour > 18 && product.name.toLowerCase().includes('relax')) score += 2;
      
      // Season-based (rainy season = imun)
      if (month >= 10 || month <= 2) { // Nov-Mar
        if (product.name.toLowerCase().includes('imun')) score += 2;
      }
      
      // Summer = detox
      if (month >= 5 && month <= 8) { // Jun-Sep
        if (product.name.toLowerCase().includes('detox')) score += 2;
      }
      
      scores[product.id] = Math.min(10, Math.max(1, score));
    });
    
    setAiScores(scores);
  }, [featured]);

  // =========================
  // HANDLE ADD TO CART
  // =========================
  const handleAddToCart = (
  product: typeof products[number],
  price: number,
  img: string
) => {
    // Trigger animation
    setAnimatingId(product.id)
    setTimeout(() => setAnimatingId(null), 500)
    
    // Show toast
    toast.success(`${product.name} ditambahkan ke keranjang!`, {
      icon: '🛒',
      duration: 2000,
      style: {
        background: '#0FA3A8',
        color: 'white',
        borderRadius: '999px',
      }
    })
    
    // Actual add to cart logic
    if (product.isPackage) {
      window.dispatchEvent(
        new CustomEvent("open-package", {
          detail: {
            id: product.id,
            name: product.name,
            price: price,
            img: img,
            items: product.items,
          },
        })
      )
    } else {
      addToCart({
        id: product.id,
        name: product.name,
        price: price,
        img: img,
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
            const weeklySold = weeklySales[p.id] ?? 87
const isBestSeller = weeklySold >= 100
            const aiScore = aiScores[p.id] || 0

            const price =
              db?.promo && db.promo > 0
                ? db.promo
                : db?.harga && db.harga > 0
                ? db.harga
                : Number(p.price)

            const img = db?.img || p.img || "/images/placeholder.jpg"

            return (
              <motion.div
                key={p.id}
                animate={animatingId === p.id ? {
                  scale: [1, 1.05, 1],
                  backgroundColor: ["#f8fcfc", "#e6f7f7", "#f8fcfc"],
                } : {}}
                transition={{ duration: 0.5 }}
                className="
                  group bg-[#f8fcfc] rounded-3xl overflow-hidden
                  shadow hover:shadow-xl transition-all duration-300
                "
              >
                {/* IMAGE */}
                <div className="relative h-[220px] bg-white overflow-hidden">
                  {/* Badges Container */}
                  <div className="absolute top-3 left-3 z-10 flex flex-col gap-2">
                    {isBestSeller && (
                      <div className="flex items-center gap-1 bg-orange-500 text-white text-xs font-bold px-3 py-1.5 rounded-full shadow-lg">
                        <span className="text-yellow-200">🔥</span>
                        Best Seller
                      </div>
                    )}
                    {aiScore >= 8 && (
                      <div className="flex items-center gap-1 bg-purple-600 text-white text-xs font-bold px-3 py-1.5 rounded-full shadow-lg">
                        <span>🤖</span>
                        AI Choice
                      </div>
                    )}
                  </div>
                  
                  <Image
                    src={img}
                    alt={p.name}
                    fill
                    sizes="(max-width: 768px) 100vw, 33vw"
                    className="object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  
                  {db?.promo && db.promo > 0 && (
                    <div className="absolute top-3 right-3 bg-red-500 text-white text-xs px-2 py-1 rounded-full">
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

                  {/* Weekly Sales */}
                  <div className="mt-2 mb-3">
                    <div className="inline-flex items-center gap-1 text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full">
                      <span className="text-green-600">📦</span>
                      Terjual {weeklySold}+ minggu ini
                    </div>
                  </div>

                  <div className="mt-auto flex items-center justify-between">
                    <div className="flex flex-col">
                      <span className="font-bold text-lg text-[#0B4B50]">
                        {formatIDR(price)}
                      </span>
                      {db?.promo > 0 && db?.harga > db?.promo && (
                        <span className="text-xs text-gray-400 line-through">
                          {formatIDR(db.harga)}
                        </span>
                      )}
                    </div>

                    <button
                      onClick={() => handleAddToCart(p, price, img)}
                      className="
                        bg-[#0FA3A8] text-white text-sm px-6 py-2 rounded-full
                        hover:bg-[#0DC1C7] active:scale-95 transition-all
                        relative overflow-hidden
                      "
                    >
                      {p.isPackage ? "Lihat Paket" : "Tambah"}
                    </button>
                  </div>
                </div>
              </motion.div>
            )
          })}
        </div>

      </div>
    </section>
  )
}

// SKELETON COMPONENT (same as before)
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
