"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { useCartStore } from "@/stores/cartStore"

type CheckoutState = "idle" | "submitting" | "error"

export default function CheckoutPage() {
  const router = useRouter()
  const items = useCartStore((state) => state.items)
  const clearCart = useCartStore((state) => state.clearCart)

  const [nama, setNama] = useState("")
  const [hp, setHp] = useState("")
  const [alamat, setAlamat] = useState("")
  const [catatan, setCatatan] = useState("")
  const [status, setStatus] = useState<CheckoutState>("idle")
  const [errorMsg, setErrorMsg] = useState("")

  const subtotal = items.reduce(
    (acc, item) => acc + item.price * item.qty,
    0
  )

  const ongkir = 15000
  const total = subtotal + (items.length > 0 ? ongkir : 0)

  useEffect(() => {
    window.scrollTo({ top: 0 })
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!items.length) return

    if (!nama.trim() || !hp.trim() || !alamat.trim()) {
      setErrorMsg("Lengkapi nama, nomor WhatsApp, dan alamat dulu ya 🙏")
      return
    }

    try {
      setStatus("submitting")
      setErrorMsg("")

      const produkText = items
        .map(i => `${i.name}×${i.qty}`)
        .join(", ")

      const qtyTotal = items.reduce((acc, i) => acc + i.qty, 0)

      const res = await fetch("/api/order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          nama,
          hp,
          alamat,
          produk: produkText,
          qty: qtyTotal,
          total
        }),
      })

      const data = await res.json()

      if (!res.ok || !data?.invoiceUrl) {
        throw new Error(data?.message || "Gagal membuat invoice")
      }

      clearCart()
      router.push(data.invoiceUrl)
    } catch (err) {
      console.error("Checkout error:", err)
      setStatus("error")
      setErrorMsg("Error membuat invoice. Coba lagi ya 🙏")
    } finally {
      setStatus("idle")
    }
  }

  return (
    <main className="min-h-screen bg-[#F4FAFA] text-[#0B4B50] flex items-start justify-center py-10 px-4 md:px-6">
      {/* sisanya tetap sama */}
    </main>
  )
}
