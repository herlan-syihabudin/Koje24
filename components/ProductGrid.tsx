"use client"
import Image from "next/image"
import { useState } from "react"
import { useCart } from "@/components/CartContext"

type Product = {
  id: number
  name: string
  desc: string
  price: number | string
  img: string
  tag?: string
}

const products: Product[] = [
  { id: 1, name: "Green Detox", desc: "Bayam • Apel • Lemon • Jahe — segar, rendah kalori.", price: "Rp18.000", img: "/image/juice-green.jpg", tag: "Best Seller" },
  { id: 2, name: "Yellow Immunity", desc: "Jeruk • Nanas • Kunyit • Madu — bantu daya tahan tubuh.", price: "Rp18.000", img: "/image/juice-yellow.jpg", tag: "Best Seller" },
  { id: 3, name: "Red Series", desc: "Semangka • Jeruk • Serai — jaga stamina & energi harian.", price: "Rp18.000", img: "/image/juice-redseries.jpg" },
  { id: 4, name: "Sunrise", desc: "Wortel • Jeruk • Serai — bantu menjaga stamina tubuh.", price: "Rp18.000", img: "/image/juice-orange.jpg" },
  { id: 5, name: "Sunrise+", desc: "Wortel • Jeruk • Serai — rasa lebih bold.", price: "Rp18.000", img: "/image/juice-sunrise.jpg" },
  { id: 6, name: "Beetroot Power", desc: "Bit • Apel • Lemon — bantu sirkulasi darah & imun tubuh.", price: "Rp18.000", img: "/image/juice-beetroot.jpg" },
]

// Helper
const toNumber = (p: number | string): number =>
  typeof p === "number" ? p : Number(p.replace(/[^0-9]/g, "")) || 0

const formatIDR = (n: number) => `Rp${n.toLocaleString("id-ID")}`

export default function ProductGrid({ showHeading = true }: { showHeading?: boolean }) {
  const { cart, addItem, removeItem } = useCart()
  const [imgReady, setImgReady] = useState<Record<number, boolean>>({})
  const [added, setAdded] = useState<number | null>(null)

  const qtyOf = (id: number) => cart[id]?.qty || 0

  const handleAdd = (p: Product) => {
    addItem(p.id, p.name, toNumber(p.price))
    setAdded(p.id)

    // 🔹 animasi gambar terbang ke cart
    const img = document.querySelector(`img[alt="${p.name}"]`) as HTMLElement
    const cartIcon = document.querySelector(".fixed.bottom-5.right-5 button") as HTMLElement

    if (img && cartIcon) {
      const clone = img.cloneNode(true) as HTMLElement
      const rectImg = img.getBoundingClientRect()
      const rectCart = cartIcon.getBoundingClientRect()

      Object.assign(clone.style, {
  position: "fixed",
  top: rectImg.top + "px",
  left: rectImg.left + "px",
  width: rectImg.width + "px",
  height: rectImg.height + "px",
  borderRadius: "10px", // ✅ tambahkan titik dua dan nilai
  zIndex: "9999",
  opacity: "1",
  transform: "scale(1)",
  transition: "all 0.8s cubic-bezier(0.45, 0, 0.55, 1)",
})

