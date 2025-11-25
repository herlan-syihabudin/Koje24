"use client"

import { useCartStore } from "@/stores/cartStore"
import { ShoppingCart } from "lucide-react"

export default function StickyCartBar() {
  const items = useCartStore((state) => state.items)
  const totalQty = useCartStore((state) => state.totalQty)
  const totalPrice = useCartStore((state) => state.totalPrice)

  // kalau keranjang kosong → jangan tampil
  if (!items || items.length === 0 || totalQty === 0) return null

  return (
    <div className="fixed bottom-6 left-0 right-0 z-50 flex justify-center px-4">
      <button
        onClick={() => window.dispatchEvent(new Event("open-cart"))}
        className="
          w-full max-w-sm
          flex items-center justify-between
          bg-[#E8C46B] text-[#0B4B50]
          px-5 py-3
          rounded-full shadow-[0_4px_14px_rgba(0,0,0,0.15)]
          active:scale-[0.97] transition-all
        "
      >
        {/* KIRI */}
        <div className="flex items-center gap-2">
          <ShoppingCart size={20} />
          <span className="font-semibold">
            Checkout ({totalQty})
          </span>
        </div>

        {/* KANAN: TOTAL HARGA */}
        <div className="bg-[#0B4B50] text-white px-3 py-1 rounded-full text-sm font-semibold">
          Rp{totalPrice.toLocaleString("id-ID")}
        </div>
      </button>
    </div>
  )
}
