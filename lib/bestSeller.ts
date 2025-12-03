"use client"

import { useEffect, useState } from "react"

export interface RankData {
  rating: number
  reviews: number
  score: number
  isBestSeller: boolean
}

const STORAGE_KEY = "koje24-best-seller-data"

/* ======================================================
   📌 SAFE localStorage
====================================================== */
function safeGetItem(key: string) {
  if (typeof window === "undefined") return null
  return localStorage.getItem(key)
}

function safeSetItem(key: string, val: string) {
  if (typeof window === "undefined") return
  localStorage.setItem(key, val)
}

/* ======================================================
   📌 Ambil data history dari localStorage
====================================================== */
function getStats(): Record<string, RankData> {
  try {
    const d = safeGetItem(STORAGE_KEY)
    return d ? JSON.parse(d) : {}
  } catch {
    return {}
  }
}

function saveStats(data: Record<string, RankData>) {
  safeSetItem(STORAGE_KEY, JSON.stringify(data))
}

/* ======================================================
   🔥 DIPANGGIL SAAT USER KIRIM TESTIMONI
====================================================== */
export function updateRating(productId: string, newRating: number) {
  if (typeof window === "undefined") return

  const stats = getStats()
  if (!stats[productId]) {
    stats[productId] = {
      rating: newRating,
      reviews: 1,
      score: 0,
      isBestSeller: false,
    }
  } else {
    const prev = stats[productId]
    prev.rating =
      (prev.rating * prev.reviews + newRating) / (prev.reviews + 1)
    prev.reviews += 1
  }

  const s = stats[productId]
  s.score = s.rating * 5 + s.reviews * 3

  saveStats(stats)
}

/* ======================================================
   🔥 HITUNG & AMBIL 3 PRODUK BEST SELLER
====================================================== */
export function getBestSellerList() {
  if (typeof window === "undefined") return {}

  const stats = getStats()

  const sorted = Object.entries(stats)
    .sort((a, b) => b[1].score - a[1].score)
    .slice(0, 3)

  Object.values(stats).forEach((s) => (s.isBestSeller = false))
  sorted.forEach(([id]) => {
    stats[id].isBestSeller = true
  })

  saveStats(stats)
  return stats
}

/* ======================================================
   🔥 HOOK CLIENT
====================================================== */
export function useBestSellerRanking() {
  const [stats, setStats] = useState<Record<string, RankData>>({})

  useEffect(() => {
    if (typeof window === "undefined") return

    const s = getBestSellerList()
    setStats({ ...s })

    const handler = () => {
      const s2 = getBestSellerList()
      setStats({ ...s2 })
    }

    window.addEventListener("storage", handler)
    return () => window.removeEventListener("storage", handler)
  }, [])

  return stats
}
