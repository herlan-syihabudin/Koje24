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
const safeGetItem = (key: string) => {
  if (typeof window === "undefined") return null
  try {
    return localStorage.getItem(key)
  } catch {
    return null
  }
}

const safeSetItem = (key: string, val: string) => {
  if (typeof window === "undefined") return
  try {
    localStorage.setItem(key, val)
  } catch {}
}

/* ======================================================
   📌 Ambil data history dari localStorage
====================================================== */
function getStats(): Record<string, RankData> {
  try {
    const d = safeGetItem(STORAGE_KEY)
    if (!d) return {}
    const parsed = JSON.parse(d)
    return typeof parsed === "object" && parsed !== null ? parsed : {}
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

  // kalau produk belum punya statistik → buat baru
  if (!stats[productId]) {
    stats[productId] = {
      rating: newRating,
      reviews: 1,
      score: newRating * 5 + 3, // default score awal
      isBestSeller: false,
    }
  } else {
    // update rating & reviews
    const prev = stats[productId]
    prev.rating =
      (prev.rating * prev.reviews + newRating) / (prev.reviews + 1)
    prev.reviews += 1
  }

  // hitung score terkini
  const s = stats[productId]
  s.score = s.rating * 5 + s.reviews * 3

  saveStats(stats)

  // 👇 trigger agar product lain update badge Best Seller
  window.dispatchEvent(new Event("storage"))
}

/* ======================================================
   🔥 HITUNG 3 PRODUK BEST SELLER
====================================================== */
export function getBestSellerList() {
  const stats = getStats()

  if (!stats || Object.keys(stats).length === 0) return {}

  // rank 3 terbaik berdasarkan total score
  const top3 = Object.entries(stats)
    .sort((a, b) => b[1].score - a[1].score)
    .slice(0, 3)

  // reset semua → non best seller dulu
  Object.values(stats).forEach((s) => (s.isBestSeller = false))

  // kasih bendera best seller ke top 3
  top3.forEach(([id]) => (stats[id].isBestSeller = true))

  saveStats(stats)
  return stats
}

/* ======================================================
   🔥 HOOK CLIENT (auto update visual)
====================================================== */
export function useBestSellerRanking() {
  const [stats, setStats] = useState<Record<string, RankData>>({})

  useEffect(() => {
    if (typeof window === "undefined") return

    const load = () => {
      const s = getBestSellerList()
      setStats({ ...s })
    }

    load()
    window.addEventListener("storage", load)
    return () => window.removeEventListener("storage", load)
  }, [])

  return stats
}
