"use client"
import { useEffect, useState } from "react"
import { useCartStore } from "@/stores/cartStore"

// 🔹 Interface Score Rank
interface RankData {
  score: number
  orders: number
  rating: number
  reviews: number
  isBestSeller: boolean
}

// 🔹 Key for LocalStorage (backup tracking)
const STORAGE_KEY = "koje24-product-stats"

function getStatsFromStorage(): Record<number, RankData> {
  try {
    const val = localStorage.getItem(STORAGE_KEY)
    return val ? JSON.parse(val) : {}
  } catch {
    return {}
  }
}

function saveStats(stats: Record<number, RankData>) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(stats))
}

// 🔥 Main Logic
export function useBestSellerRanking() {
  const { items } = useCartStore()
  const [stats, setStats] = useState<Record<number, RankData>>({})

  // Hitung score dari order (cart)
  const orderScores: Record<number, number> = {}
  items.forEach((item) => {
    const id = Number(item.id)
    orderScores[id] = (orderScores[id] || 0) + item.qty
  })

  useEffect(() => {
    const current = getStatsFromStorage()

    Object.keys(orderScores).forEach((idStr) => {
      const id = Number(idStr)
      const qty = orderScores[id] || 0

      if (!current[id]) {
        current[id] = {
          score: 0,
          orders: 0,
          rating: 0,
          reviews: 0,
          isBestSeller: false,
        }
      }

      current[id].orders = qty
      current[id].score = qty * 10 + current[id].rating * 2
    })

    const sorted = Object.values(current)
      .sort((a, b) => b.score - a.score)

    const best = sorted.slice(0, 3) // 🔥 Top 3 masuk best seller

    Object.keys(current).forEach((k) => {
      current[Number(k)].isBestSeller =
        best.includes(current[Number(k)])
    })

    saveStats(current)
    setStats(current)
  }, [items])

  return stats
}

// 🔹 Function Update Rating — panggil saat user isi testimoni ⭐
export function updateProductRating(productId: number, rating: number) {
  const current = getStatsFromStorage()

  if (!current[productId]) {
    current[productId] = {
      score: 0,
      orders: 0,
      rating: 0,
      reviews: 0,
      isBestSeller: false,
    }
  }

  current[productId].reviews += 1
  current[productId].rating =
    (current[productId].rating + rating) / 2

  current[productId].score =
    current[productId].orders * 10 + current[productId].rating * 2

  saveStats(current)
}
