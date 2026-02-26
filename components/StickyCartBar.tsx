"use client"

import { ShoppingCart } from "lucide-react"
import { useCartStore } from "@/stores/cartStore"
import { motion, AnimatePresence } from "framer-motion"
import { useEffect, useState, useMemo, useRef, useCallback } from "react"
import { usePathname } from "next/navigation"

export default function StickyCartBar() {
  const totalQty = useCartStore((state) => state.totalQty)
  const totalPrice = useCartStore((state) => state.totalPrice)

  const pathname = usePathname()
  const [glow, setGlow] = useState(false)
  const [cartOpen, setCartOpen] = useState(false)
  const glowTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  // 🛑 sembunyikan sticky bar di halaman checkout
  const isCheckoutPage = pathname?.includes("/checkout")
  const shouldShow = totalQty > 0 && !cartOpen && !isCheckoutPage

  // 💰 Format harga dengan memo
  const hargaFormat = useMemo(() => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      maximumFractionDigits: 0,
    }).format(totalPrice)
  }, [totalPrice])

  // 🎁 Bonus ongkir logic
  const bonusOngkir = totalPrice >= 120000
  const ongkirProgress = Math.min(100, (totalPrice / 120000) * 100)

  // 🔥 Open cart handler
  const openCart = useCallback(() => {
    if (typeof window !== 'undefined') {
      try {
        window.dispatchEvent(new Event("open-cart"))
      } catch (error) {
        console.warn('Failed to open cart:', error)
      }
    }
  }, [])

  // ✨ auto glowing (marketing attention)
  useEffect(() => {
    if (totalQty === 0) return

    const interval = setInterval(() => {
      setGlow(true)
      
      // Cleanup previous timeout
      if (glowTimeoutRef.current) {
        clearTimeout(glowTimeoutRef.current)
      }
      
      glowTimeoutRef.current = setTimeout(() => {
        setGlow(false)
      }, 900)
    }, 12000)

    return () => {
      clearInterval(interval)
      if (glowTimeoutRef.current) {
        clearTimeout(glowTimeoutRef.current)
      }
    }
  }, [totalQty])

  // 🎯 popup event + auto-reset saat pindah halaman
  useEffect(() => {
    const open = () => setCartOpen(true)
    const close = () => setCartOpen(false)

    window.addEventListener("open-cart", open)
    window.addEventListener("close-cart", close)

    // Reset otomatis jika pindah halaman
    setCartOpen(false)

    return () => {
      window.removeEventListener("open-cart", open)
      window.removeEventListener("close-cart", close)
    }
  }, [pathname])

  if (!shouldShow) return null

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key="sticky-cart"
        initial={{ opacity: 0, x: 60, y: 20, scale: 0.7 }}
        animate={{ opacity: 1, x: 0, y: 0, scale: 1 }}
        exit={{ opacity: 0, x: 60, y: 20, scale: 0.7 }}
        transition={{ type: "spring", stiffness: 300, damping: 20 }}
        className="fixed bottom-6 right-4 md:bottom-5 md:right-6 z-50"
      >
        <button
          onClick={openCart}
          className={`
            relative flex items-center gap-2 pl-4 pr-5 py-3
            rounded-full shadow-xl backdrop-blur-md
            transition-all active:scale-95 
            bg-[#0FA3A8] text-white hover:bg-[#0DC1C7]
            ${glow ? "ring-4 ring-[#0FA3A8]/40" : ""}
          `}
          aria-label={`Buka keranjang, total ${totalQty} item, ${hargaFormat}`}
        >
          <ShoppingCart className="w-5 h-5" />

          <div className="flex flex-col leading-tight text-left mr-2">
            <span className="font-semibold text-[15px]">{hargaFormat}</span>
            <span className="text-[10px] opacity-90 -mt-[2px]">
              Lanjutkan pesanan ➜
            </span>
          </div>

          {/* QTY BADGE */}
          <motion.span
            layout
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", stiffness: 300, damping: 15 }}
            className="absolute -top-2 -right-2 bg-[#E8C46B] text-[#0B4B50]
              text-xs font-bold rounded-full min-w-[20px] h-[20px] flex items-center justify-center"
          >
            {totalQty}
          </motion.span>

          {/* BONUS ONGKIR - Enhanced */}
          {bonusOngkir ? (
            <span className="absolute -bottom-3 right-0 bg-[#E8C46B] text-[#0B4B50] text-[9px] px-2 py-[2px] rounded-full shadow-md font-bold">
              🎁 Gratis Ongkir
            </span>
          ) : (
            <span className="absolute -bottom-3 right-0 bg-white/90 text-[#0B4B50] text-[8px] px-2 py-[2px] rounded-full shadow-md font-medium">
              {Math.round(ongkirProgress)}% menuju ongkir gratis
            </span>
          )}
        </button>
      </motion.div>
    </AnimatePresence>
  )
}
