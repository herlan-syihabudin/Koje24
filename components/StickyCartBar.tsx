"use client"
import { useCart } from "@/components/CartContext"
import { ShoppingCart } from "lucide-react"

export default function StickyCartBar() {
  const { totalQty } = useCart() ?? {}
  if (!totalQty) return null

  return (
    <div className="fixed bottom-5 right-5 z-50">
      <button
        className="relative bg-[#0FA3A8] hover:bg-[#0DC1C7] text-white p-4 rounded-full shadow-xl backdrop-blur-md transition-all active:scale-95"
        onClick={() => {
          // 👇 ini yang penting: kabari CartPopup untuk buka
          window.dispatchEvent(new Event("open-cart"))
        }}
      >
        <ShoppingCart className="w-6 h-6" />
        <span className="absolute -top-2 -right-2 bg-[#E8C46B] text-[#0B4B50] text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
          {totalQty}
        </span>
      </button>
    </div>
  )
}
