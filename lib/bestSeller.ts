"use client"

export interface RankData {
  rating: number
  reviews: number
  score: number
  isBestSeller: boolean
}

const STORAGE_KEY = "koje24-best-seller-data"

// Ambil data history dari localStorage
function getStats(): Record<number, RankData> {
  if (typeof window === "undefined") return {}
  try {
    const d = localStorage.getItem(STORAGE_KEY)
    return d ? JSON.parse(d) : {}
  } catch {
    return {}
  }
}

function saveStats(data: Record<number, RankData>) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data))
}

/* ======================================================
   🔥 DIPANGGIL SAAT USER KIRIM TESTIMONI
   updateRating(productId, ratingBaru)
====================================================== */
export function updateRating(productId: number, newRating: number) {
  const stats = getStats()

  if (!stats[productId]) {
    stats[productId] = {
      rating: newRating,
      reviews: 1,
      score: 0,
      isBestSeller: false
    }
  } else {
    const prev = stats[productId]

    // Update rating rata-rata
    prev.rating =
      (prev.rating * prev.reviews + newRating) / (prev.reviews + 1)

    prev.reviews += 1
  }

  // Hitung skor final
  const s = stats[productId]
  s.score = s.rating * 5 + s.reviews * 3 // 🔥 formula paling umum di marketplace

  saveStats(stats)
}

/* ======================================================
   🔥 AMBIL RANKING BEST SELLER
====================================================== */
export function getBestSellerList() {
  const stats = getStats()

  const sorted = Object.entries(stats)
    .sort((a, b) => b[1].score - a[1].score)
    .slice(0, 3) // top 3 best seller

  // Reset semua
  Object.values(stats).forEach((s) => (s.isBestSeller = false))

  // Tandai best seller
  sorted.forEach(([id]) => {
    stats[Number(id)].isBestSeller = true
  })

  saveStats(stats)

  return stats
}
