"use client"

import { useBestSellerRanking } from "@/lib/bestSeller"
import { useCartStore } from "@/stores/cartStore"

export default function ProductCard({
  id,
  name,
  price,
  img,
}: {
  id: string
  name: string
  price: number
  img: string
}) {
  const ranking = useBestSellerRanking()
  const isBest = ranking[String(id)]?.isBestSeller === true

  // Qty agar ada feedback UX
  const qty = useCartStore((s) => s.getQty?.(id) ?? 0) // ⬅ id tetap STRING

  return (
    <div
      className="
        relative bg-white rounded-2xl border border-[#e6eeee] shadow-sm overflow-hidden
        transition-all duration-300 hover:shadow-[0_8px_26px_rgba(0,0,0,0.08)]
        hover:-translate-y-1
      "
    >

      {/* 🔥 BADGE BEST SELLER */}
      {isBest && (
        <div
          className="
            absolute top-3 left-3 
            bg-[#F4B400] text-white text-[11px] font-semibold 
            px-2 py-1 rounded-full shadow-md z-20
            animate-pulse
          "
        >
          ⭐ Best Seller
        </div>
      )}

      {/* 🔥 BADGE QTY */}
      {qty > 0 && (
        <div
          className="
            absolute top-3 right-3 
            bg-[#0FA3A8] text-white text-[11px] font-bold
            px-[7px] py-[3px] rounded-full z-20
            shadow-md
          "
        >
          {qty}x
        </div>
      )}

      <img
        src={img}
        alt={name}
        loading="lazy"
        className="
          w-full h-40 object-cover transition-transform duration-500
          hover:scale-[1.05]
        "
      />

      <div className="p-4">
        <h3 className="font-semibold text-[#0B4B50] leading-tight">{name}</h3>
        <p className="text-sm text-[#557577] mt-1">
          Rp {price.toLocaleString("id-ID")}
        </p>
      </div>
    </div>
  )
}
