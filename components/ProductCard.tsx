"use client"

import { useBestSellerRanking } from "@/lib/bestSeller"
import { useCartStore } from "@/stores/cartStore"

export default function ProductCard({
  id,
  name,
  price,
  img,
  promo,
}: {
  id: string
  name: string
  price: number
  img: string | any
  promo?: { active: boolean; discountPercent: number }
}) {
  const ranking = useBestSellerRanking()
  const info = ranking[id]
  const isBest = Boolean(info?.isBestSeller)

  const qty = useCartStore((s) =>
    typeof s.getQty === "function" ? s.getQty(id) : 0
  )
  const addItem = useCartStore((s) => s.addItem)
  const removeItem = useCartStore((s) => s.removeItem)

  const hasPromo =
    promo?.active && (promo.discountPercent ?? 0) > 0
  const discount = hasPromo
    ? Math.round(price * (promo!.discountPercent / 100))
    : 0
  const finalPrice = price - discount

  return (
    <div className="relative bg-white rounded-2xl border border-[#e6eeee] shadow-sm overflow-hidden transition-all duration-300 hover:shadow-[0_8px_26px_rgba(0,0,0,0.08)] hover:-translate-y-1">
      {isBest && (
        <div className="absolute top-3 left-3 bg-[#F4B400] text-white text-[11px] font-semibold px-2 py-1 rounded-full shadow-md z-20 animate-pulse">
          ⭐ Best Seller
        </div>
      )}

      {qty > 0 && (
        <div className="absolute top-3 right-3 bg-[#0FA3A8] text-white text-[11px] font-bold px-[7px] py-[3px] rounded-full z-20 shadow-md">
          {qty}x
        </div>
      )}

      <img
        src={typeof img === "string" ? img : img.src}
        alt={name}
        loading="lazy"
        className="w-full h-40 object-cover transition-transform duration-500 hover:scale-[1.05]"
      />

      <div className="p-4">
        <h3 className="font-semibold text-[#0B4B50] leading-tight">{name}</h3>

        {hasPromo ? (
          <div className="mt-1">
            <p className="text-[#D20000] font-bold text-[15px]">
              Rp {finalPrice.toLocaleString("id-ID")}
            </p>
            <p className="line-through text-[12px] text-[#8fa2a2]">
              Rp {price.toLocaleString("id-ID")}
            </p>
            <span className="inline-block mt-1 bg-[#D20000] text-white text-[10px] px-2 py-[3px] rounded-full font-semibold">
              -{promo!.discountPercent}%
            </span>
          </div>
        ) : (
          <p className="text-sm text-[#557577] mt-1">
            Rp {price.toLocaleString("id-ID")}
          </p>
        )}

        <div className="flex items-center gap-2 mt-4">
          {qty > 0 && (
            <button
              onClick={() => removeItem(id)}
              className="px-3 py-1 bg-[#0FA3A8] text-white rounded-lg text-sm font-semibold hover:opacity-80"
            >
              –
            </button>
          )}

          <button
            onClick={() => addItem({ id, name, price: finalPrice, img })}
            className="flex-1 px-4 py-2 bg-[#0FA3A8] text-white rounded-lg text-sm font-semibold hover:bg-[#0a898c] transition"
          >
            Tambah
          </button>
        </div>
      </div>
    </div>
  )
}
