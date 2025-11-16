"use client"
import { useStatsStore } from "@/stores/statsStore"

export function useBestSeller(products: any[], ratings: Record<string, any[]>) {
  const orders = useStatsStore((s) => s.orders)

  const scored = products.map((p) => {
    const rev = ratings[p.id] || []
    const totalRev = rev.length
    const avgRating = totalRev
      ? rev.reduce((a, b) => a + Number(b.rating), 0) / totalRev
      : 0

    const orderCount = orders[p.id] || 0

    const score = avgRating * 0.7 + Math.log10(orderCount + 1) * 0.3

    return { ...p, score }
  })

  return scored
    .sort((a, b) => b.score - a.score)
    .map((p, i) => ({
      ...p,
      tag:
        i === 0 || i === 1
          ? "Best Seller"
          : i === 2
          ? "Trending 🔥"
          : undefined,
    }))
}
