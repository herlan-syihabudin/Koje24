"use client"
import { useEffect, useState } from "react"
import { updateProductRating } from "@/lib/bestSeller"

export default function RatingPopup() {
  const [open, setOpen] = useState(false)
  const [products, setProducts] = useState<any[]>([])
  const [ratings, setRatings] = useState<{ [id: string]: number }>({})

  useEffect(() => {
    const handler = (e: any) => {
      setProducts(e.detail.items)
      setOpen(true)
    }
    window.addEventListener("open-rating", handler as EventListener)
    return () => window.removeEventListener("open-rating", handler as EventListener)
  }, [])

  const submitRating = () => {
    Object.entries(ratings).forEach(([id, star]) =>
      updateProductRating(Number(id), star)
    )
    alert("Terima kasih! ⭐ Rating tersimpan.")
    setOpen(false)
  }

  if (!open) return null

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[200] flex items-center justify-center">
      <div className="bg-white rounded-3xl p-6 w-full max-w-sm shadow-xl">
        <h3 className="font-playfair text-lg text-[#0B4B50] mb-3">
          Rating Produk
        </h3>

        {products.map((p) => (
          <div key={p.id} className="mb-3">
            <p className="text-sm font-inter">{p.name}</p>
            <div className="flex gap-1">
              {[1,2,3,4,5].map((i) => (
                <span
                  key={i}
                  onClick={() =>
                    setRatings((s) => ({ ...s, [p.id]: i }))
                  }
                  className={`text-2xl cursor-pointer ${
                    ratings[p.id] >= i ? "text-yellow-500" : "text-gray-300"
                  }`}
                >
                  ★
                </span>
              ))}
            </div>
          </div>
        ))}

        <button
          onClick={submitRating}
          className="w-full bg-[#0FA3A8] text-white py-2 rounded-full mt-3 font-semibold"
        >
          Kirim Rating ⭐
        </button>

        <button
          onClick={() => setOpen(false)}
          className="w-full text-sm text-gray-500 mt-2"
        >
          Tutup
        </button>
      </div>
    </div>
  )
}
