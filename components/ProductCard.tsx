"use client"

import { memo } from "react"
import Image from "next/image"
import { useBestSellerRanking } from "@/lib/bestSeller"
import { useCartStore } from "@/stores/cartStore"
import type { StaticImageData } from "next/image"

interface ProductCardProps {
  id: string
  name: string
  price: number
  img: string | StaticImageData
  promo?: { active: boolean; discountPercent: number }
  stock?: number
}

const formatPrice = (price: number) => {
  return price.toLocaleString("id-ID")
}

const ProductCard = memo(function ProductCard({
  id,
  name,
  price,
  img,
  promo,
  stock = 10
}: ProductCardProps) {

  const ranking = useBestSellerRanking()
  const info = ranking[id]
  const isBest = Boolean(info?.isBestSeller)

  const qty = useCartStore(
    (s) => s.items.find((i) => i.id === id)?.qty ?? 0
  )
  const addItem = useCartStore((s) => s.addItem)
  const removeItem = useCartStore((s) => s.removeItem)

  const hasPromo = promo?.active && (promo.discountPercent ?? 0) > 0
  const discount = hasPromo
    ? Math.round(price * ((promo?.discountPercent ?? 0) / 100))
    : 0
  const finalPrice = price - discount

  // 🔥 FIX UTAMA DI SINI
  const imageSrc = typeof img === "string" ? img : img.src

  const handleAdd = () => {
    addItem({
      id,
      name,
      price: finalPrice,
      img: imageSrc, // sekarang selalu string
    })
  }

  const handleRemove = () => removeItem(id)

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

      <div className="relative w-full h-40 overflow-hidden">
        <Image
          src={imageSrc}
          alt={name}
          fill
          sizes="(max-width: 768px) 100vw, 33vw"
          className="object-cover transition-transform duration-500 hover:scale-[1.05]"
          loading="lazy"
        />
      </div>

      <div className="p-4">
        <h3 className="font-semibold text-[#0B4B50] leading-tight line-clamp-2">
          {name}
        </h3>

        {hasPromo ? (
          <div className="mt-1">
            <p className="text-[#D20000] font-bold text-[15px]">
              Rp {formatPrice(finalPrice)}
            </p>
            <p className="line-through text-[12px] text-[#8fa2a2]">
              Rp {formatPrice(price)}
            </p>
            <span className="inline-block mt-1 bg-[#D20000] text-white text-[10px] px-2 py-[3px] rounded-full font-semibold">
              -{promo?.discountPercent}%
            </span>
          </div>
        ) : (
          <p className="text-sm text-[#557577] mt-1">
            Rp {formatPrice(price)}
          </p>
        )}

        <div className="flex items-center gap-2 mt-4">
          {qty > 0 && (
            <button
              onClick={handleRemove}
              className="px-3 py-1 bg-[#0FA3A8] text-white rounded-lg text-sm font-semibold hover:opacity-80 transition-opacity"
              aria-label="Kurangi jumlah"
            >
              –
            </button>
          )}

          <button
            onClick={handleAdd}
            className="flex-1 px-4 py-2 bg-[#0FA3A8] text-white rounded-lg text-sm font-semibold hover:bg-[#0a898c] transition-colors"
            disabled={stock === 0}
          >
            {stock === 0 ? "Habis" : "Tambah"}
          </button>
        </div>

        {stock < 5 && stock > 0 && (
          <p className="text-xs text-orange-500 mt-2">
            ⚡ Sisa {stock} lagi!
          </p>
        )}
      </div>
    </div>
  )
})

export default ProductCard
