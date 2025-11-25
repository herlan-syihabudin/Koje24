"use client"

import { ShoppingCart } from "lucide-react"
import { useCartStore } from "@/stores/cartStore"

export default function StickyCartBar() {
  const totalQty = useCartStore((state) => state.totalQty)
  const totalPrice = useCartStore((state) => state.totalPrice)

  // Kalau tidak ada item → tombol hilang
  if (!totalQty || totalQty === 0) return null

  return (
    <div className="fixed bottom-6 right-5 z-50">
      <button
        onClick={() => window.dispatchEvent(new Event("open-cart"))}
        className="
          relative flex items-center gap-3
          bg-white shadow-xl
          px-4 py-3 rounded-full
          border border-[#0FA3A8]/20
          hover:shadow-2xl transition-all
          active:scale-95
        "
      >
        {/* CART ICON + BADGE */}
        <div className="relative">
          <div
            className="
              bg-[#0FA3A8] text-white
              w-10 h-10 flex items-center justify-center
              rounded-full
            "
          >
            <ShoppingCart size={20} />
          </div>

          <span
            className="
              absolute -top-1 -right-1
              bg-[#E8C46B] text-[#0B4B50]
              text-xs font-bold rounded-full
              w-5 h-5 flex items-center justify-center
            "
          >
            {totalQty}
          </span>
        </div>

        {/* TOTAL HARGA */}
        <span className="font-semibold text-[#0B4B50] text-sm">
          Rp{totalPrice.toLocaleString("id-ID")}
        </span>
      </button>
    </div>
  )
}
