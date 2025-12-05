"use client"

import { ShoppingCart } from "lucide-react"
import { useCartStore } from "@/stores/cartStore"
import { motion, AnimatePresence } from "framer-motion"
import { useEffect, useState } from "react"
import { usePathname } from "next/navigation"

export default function StickyCartBar() {
  const pathname = usePathname()
  const totalQty = useCartStore((state) => state.totalQty)
  const totalPrice = useCartStore((state) => state.totalPrice)

  const [glow, setGlow] = useState(false)

  // ❌ HILANGKAN di halaman CHECKOUT & INVOICE
  if (
    pathname?.startsWith("/checkout") ||
    pathname?.startsWith("/invoice")
  ) {
    return null
  }

  // ❌ HILANGKAN kalau cart kosong
  if (totalQty === 0) return null

  // 🔥 auto glowing setiap 12 detik
  useEffect(() => {
    const t = setInterval(() => {
      setGlow(true)
      setTimeout(() => setGlow(false), 900)
    }, 12000)
    return () => clearInterval(t)
  }, [])

  const hargaFormat = new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
  }).format(totalPrice)

  const bonusOngkir = totalPrice >= 120000

  return (
    <AnimatePresence>
      <motion.div
        key="sticky-cart"
        initial={{ opacity: 0, x: 60, y: 20, scale: 0.7 }}
        animate={{ opacity: 1, x: 0, y: 0, scale: 1 }}
        exit={{ opacity: 0, x: 60, y: 20, scale: 0.7 }}
        transition={{ type: "spring", stiffness: 300, damping: 20 }}
        className="fixed bottom-6 right-4 md:bottom-5 md:right-6 z-50"
      >
        <button
          onClick={() => window.dispatchEvent(new Event("open-cart"))}
          className={`
            relative flex items-center gap-2 pl-4 pr-5 py-3
            rounded-full shadow-xl backdrop-blur-md
            transition-all active:scale-95 
            bg-[#0FA3A8] text-white hover:bg-[#0DC1C7]
            ${glow ? "ring-4 ring-[#0FA3A8]/40" : ""}
          `}
        >
          <ShoppingCart className="w-5 h-5" />
          <div className="flex flex-col leading-tight text-left mr-2">
            <span className="font-semibold text-[15px]">{hargaFormat}</span>
            <span className="text-[10px] opacity-90 -mt-[2px]">
              Lanjutkan pesanan ➜
            </span>
          </div>

          {/* BADGE QTY */}
          <motion.span
            layout
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", stiffness: 300, damping: 15 }}
            className="
              absolute -top-2 -right-2 bg-[#E8C46B] text-[#0B4B50]
              text-xs font-bold rounded-full
              min-w-[20px] h-[20px] flex items-center justify-center
            "
          >
            {totalQty}
          </motion.span>

          {/* BONUS ONGKIR */}
          {bonusOngkir && (
            <span className="absolute -bottom-3 right-0 bg-[#E8C46B] text-[#0B4B50] text-[9px] px-2 py-[2px] rounded-full shadow-md font-bold">
              Bonus Ongkir 🎁
            </span>
          )}
        </button>
      </motion.div>
    </AnimatePresence>
  )
}
