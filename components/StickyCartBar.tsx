"use client"

import { ShoppingCart } from "lucide-react"
import { useCartStore } from "@/stores/cartStore"
import { motion, AnimatePresence } from "framer-motion"

export default function StickyCartBar() {
  const totalQty = useCartStore((state) => state.totalQty)

  return (
    <AnimatePresence>
      {totalQty > 0 && (
        <motion.div
          key="sticky-cart"
          initial={{ opacity: 0, x: 60, y: 20, scale: 0.7 }}
          animate={{ opacity: 1, x: 0, y: 0, scale: 1 }}
          exit={{ opacity: 0, x: 60, y: 20, scale: 0.7 }}
          transition={{ type: "spring", stiffness: 300, damping: 20 }}
          className="fixed bottom-6 right-4 md:bottom-5 md:right-5 z-50"
        >
          <button
            onClick={() => window.dispatchEvent(new Event("open-cart"))}
            className="
              relative bg-[#0FA3A8] hover:bg-[#0DC1C7]
              text-white p-4 rounded-full shadow-xl
              backdrop-blur-md transition-all active:scale-95
            "
          >
            <ShoppingCart className="w-6 h-6" />

            {/* BADGE */}
            <motion.span
              layout
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring", stiffness: 300, damping: 15 }}
              className="
                absolute -top-2 -right-2
                bg-[#E8C46B] text-[#0B4B50]
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
