"use client"

import Image from "next/image"
import { useState } from "react"
import { useCartStore } from "@/stores/cartStore"
import { useBestSellerRanking } from "@/lib/bestSeller"
import { products } from "@/lib/products"   // ✅ AMAN: produk sekarang ambil dari file terpusat

type Product = {
  id: number | string
  name: string
  desc?: string
  price: number | string
  img: string
  isPackage?: boolean
}

const toNumber = (p: number | string): number =>
  typeof p === "number" ? p : Number(String(p).replace(/[^0-9]/g, "")) || 0

const formatIDR = (n: number) => `Rp${n.toLocaleString("id-ID")}`

export default function ProductGrid({ showHeading = true }: { showHeading?: boolean }) {
  const items = useCartStore((state) => state.items)
  const addToCart = useCartStore((state) => state.addItem)
  const removeFromCart = useCartStore((state) => state.removeItem)
  const rankStats = useBestSellerRanking()

  const [imgReady, setImgReady] = useState<Record<string | number, boolean>>({})
  const [added, setAdded] = useState<string | number | null>(null)

  const qtyOf = (id: string | number) =>
    items.find((c) => c.id === String(id))?.qty || 0

  const openPackage = (name: string, price: number | string) => {
    window.dispatchEvent(
      new CustomEvent("open-package" as any, {
        detail: { name, price: toNumber(price) }
      } as any)
    )
  }

  const handleAddProduct = (p: Product) => {
    const priceNum = toNumber(p.price)

    addToCart({
      id: String(p.id),
      name: p.name,
      price: priceNum,
      img: p.img,
    })

    setAdded(p.id)

    // ⭐ ANIMASI FLY — tidak diubah sama sekali
    setTimeout(() => {
      const img = document.querySelector(`[data-id="product-${p.id}"]`) as HTMLElement | null
      const cartBtn = document.querySelector(".fixed.bottom-5.right-5 button") as HTMLElement | null
      if (!img || !cartBtn || !imgReady[p.id]) return

      const clone = img.cloneNode(true) as HTMLElement
      const rectImg = img.getBoundingClientRect()
      const rectCart = cartBtn.getBoundingClientRect()

      Object.assign(clone.style, {
        position: "fixed",
        top: `${rectImg.top}px`,
        left: `${rectImg.left}px`,
        width: `${rectImg.width}px`,
        height: `${rectImg.height}px`,
        borderRadius: "12px",
        zIndex: "9999",
        opacity: "1",
        transform: "scale(1)",
        transition: "all 0.9s cubic-bezier(0.45, 0, 0.55, 1)",
        boxShadow: "0 0 30px 10px rgba(15,163,168,0.4)",
      })

      document.body.appendChild(clone)

      requestAnimationFrame(() => {
        clone.style.top = `${rectCart.top}px`
        clone.style.left = `${rectCart.left}px`
        clone.style.width = "0px"
        clone.style.height = "0px"
        clone.style.opacity = "0"
        clone.style.transform = "scale(0.2)"
        clone.style.boxShadow = "0 0 10px 2px rgba(15,163,168,0.1)"
      })

      setTimeout(() => clone.remove(), 900)
    }, 30)

    setTimeout(() => setAdded(null), 1000)
  }
