"use client"

import { ShoppingCart } from "lucide-react"
import { useCartStore } from "@/stores/cartStore"
import { motion, AnimatePresence } from "framer-motion"

export default function StickyCartBar() {
  const totalQty = useCartStore((state) => state.totalQty)
  const totalPrice = useCartStore((state) => state.totalPrice) // ← otomatis terpakai kalau sudah ada

  return (
    <AnimatePresence>
      {totalQty > 0 && (
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
            className="
              relative flex items-center gap-2 pl-4 pr-5 py-3
              bg-[#0FA3A8] hover:bg-[#0DC1C7] text-white
              rounded-full shadow-xl backdrop-blur-md
              transition-all active:scale-95
            "
          >
            <ShoppingCart className="w-5 h-5" />

            {/* TEKS TOTAL HARGA */}
            <span className="font-semibold text-[15px]">
              {new Intl.NumberFormat("id-ID", {
                style: "currency",
                currency: "IDR",
                maximumFractionDigits: 0,
              }).format(totalPrice)}
            </span>

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
          </button>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
