"use client"

import { useEffect, useState } from "react"

export interface RankData {
  rating: number
  reviews: number
  score: number
  isBestSeller: boolean
}

const STORAGE_KEY = "koje24-best-seller-data"
const UPDATE_EVENT = "bestseller-update"

/* ======================================================
   📌 SAFE LOCALSTORAGE (Universal / tidak bikin crash di SSR)
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
   📌 AMBIL STATISTIK BEST SELLER
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

  if (!stats[productId]) {
    // produk pertama kali dapat rating
    stats[productId] = {
      rating: newRating,
      reviews: 1,
      score: newRating * 5 + 3,
      isBestSeller: false,
    }
  } else {
    // update rating existing
    const prev = stats[productId]
    prev.rating =
      (prev.rating * prev.reviews + newRating) / (prev.reviews + 1)
    prev.reviews += 1
  }

  // hitung score baru
  const s = stats[productId]
  s.score = s.rating * 5 + s.reviews * 3

  saveStats(stats)

  // trigger UI refresh
  window.dispatchEvent(new Event(UPDATE_EVENT))
}

/* ======================================================
   🔥 HITUNG 3 PRODUK TERATAS → BEST SELLER
====================================================== */
export function getBestSellerList() {
  const stats = getStats()
  if (!stats || Object.keys(stats).length === 0) return {}

  const before = JSON.stringify(stats)

  // ranking score → ambil top 3
  const top3 = Object.entries(stats)
    .sort((a, b) => b[1].score - a[1].score)
    .slice(0, 3)

  // reset
  Object.values(stats).forEach((s) => (s.isBestSeller = false))

  // kasih bendera best seller
  top3.forEach(([id]) => (stats[id].isBestSeller = true))

  // hanya update kalau ada perubahan
  if (before !== JSON.stringify(stats)) saveStats(stats)

  return stats
}

/* ======================================================
   🔥 HOOK UNTUK UI — auto update visual tanpa refresh
====================================================== */
export function useBestSellerRanking() {
  const [stats, setStats] = useState<Record<string, RankData>>({})

  useEffect(() => {
    if (typeof window === "undefined") return

    const load = () => {
      const s = getBestSellerList()
      setStats({ ...s })
    }

    load() // load awal
    window.addEventListener(UPDATE_EVENT, load)
    return () => window.removeEventListener(UPDATE_EVENT, load)
  }, [])

  return stats
}
