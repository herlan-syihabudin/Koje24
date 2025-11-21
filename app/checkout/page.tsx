"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { useCartStore } from "@/stores/cartStore"

type CheckoutState = "idle" | "submitting" | "error"

type CartItemType = {
  id: string
  name: string
  price: number
  qty: number
}

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

  // ============================
  // FIXED STRICT TYPESCRIPT
  // ============================
  const subtotal = items.reduce(
    (acc: number, item: CartItemType) => acc + item.price * item.qty,
    0
  )

  const ongkir = 15000
  const total = subtotal + (items.length > 0 ? ongkir : 0)

  useEffect(() => {
    window.scrollTo({ top: 0 })
  }, [])

  useEffect(() => {
    if (items.length === 0) {
      const t = setTimeout(() => {
        router.push("/#produk")
      }, 1800)
      return () => clearTimeout(t)
    }
  }, [items, router])

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

      const res = await fetch("/api/order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          nama,
          hp,
          alamat,
          note: catatan,
          cart: items.map((it: CartItemType) => ({
            id: it.id,
            name: it.name,
            qty: it.qty,
            price: it.price,
          })),
        }),
      })

      const data = await res.json()

      if (!res.ok || !data?.success) {
        throw new Error(data?.message || "Gagal membuat invoice")
      }

      clearCart()
      router.push(data.invoiceUrl || "/")
    } catch (err: any) {
      console.error("Checkout error:", err)
      setStatus("error")
      setErrorMsg(
        "Maaf, sedang ada kendala saat membuat invoice. Coba lagi sebentar lagi ya."
      )
    } finally {
      setStatus((prev) => (prev === "submitting" ? "idle" : prev))
    }
  }

  const disabled = status === "submitting" || !items.length

  return (
    <main className="min-h-screen bg-[#F4FAFA] text-[#0B4B50] flex items-start justify-center py-10 px-4 md:px-6">
      <div className="w-full max-w-5xl">
        {/* Title */}
        <div className="mb-8">
          <p className="text-xs tracking-[0.25em] uppercase text-[#0FA3A8] mb-2">
            KOJE24 • Premium Checkout
          </p>
          <h1 className="font-playfair text-3xl md:text-4xl font-semibold">
            Selesaikan Pesanan Kamu
          </h1>
          <p className="font-inter text-sm md:text-base text-gray-600 mt-2 max-w-2xl">
            Isi data pengiriman dengan teliti. Setelah ini, sistem akan membuat invoice
            otomatis dan kamu bisa langsung konfirmasi via WhatsApp.
          </p>
        </div>

        {items.length === 0 ? (
          <div className="mt-10 bg-white/70 border border-[#e6eeee] rounded-2xl p-6 text-center shadow-sm">
            <p className="font-inter text-sm md:text-base text-gray-600">
              Keranjang kamu masih kosong. Mengarahkan kembali ke halaman produk...
            </p>
          </div>
        ) : (
          <div className="grid gap-6 md:gap-8 md:grid-cols-[1.1fr_0.9fr]">
            {/* LEFT: FORM */}
            <section className="bg-white/90 border border-[#e6eeee] rounded-3xl shadow-[0_10px_35px_rgba(11,75,80,0.07)] p-6 md:p-7">
              <h2 className="font-playfair text-xl md:text-2xl mb-4">
                Detail Pengiriman
              </h2>

              <form onSubmit={handleSubmit} className="space-y-4">
                {/* Form input here (unchanged) */}
                {/* ... */}
              </form>
            </section>

            {/* RIGHT: ORDER SUMMARY */}
            <aside className="bg-white/95 border border-[#e1eeee] rounded-3xl shadow-[0_10px_35px_rgba(0,0,0,0.04)] p-5 md:p-6 flex flex-col gap-4">
              <h2 className="font-playfair text-lg md:text-xl mb-1">
                Ringkasan Pesanan
              </h2>

              <div className="space-y-3 max-h-[260px] overflow-y-auto pr-1">
                {items.map((item: CartItemType) => (
                  <div
                    key={item.id}
                    className="flex items-start justify-between gap-3 border-b border-[#edf5f5] pb-2.5"
                  >
                    <div>
                      <p className="font-inter text-[14px] font-semibold">
                        {item.name}
                      </p>
                      <p className="text-[12px] text-gray-500">
                        {item.qty} x Rp{item.price.toLocaleString("id-ID")}
                      </p>
                    </div>
                    <p className="font-semibold text-[14px]">
                      Rp{(item.qty * item.price).toLocaleString("id-ID")}
                    </p>
                  </div>
                ))}
              </div>

              <div className="mt-2 space-y-1 text-sm border-t border-[#e6eeee] pt-3">
                <div className="flex justify-between text-gray-600">
                  <span>Subtotal</span>
                  <span>Rp{subtotal.toLocaleString("id-ID")}</span>
                </div>
                <div className="flex justify-between text-gray-600">
                  <span>Ongkir (flat)</span>
                  <span>Rp{ongkir.toLocaleString("id-ID")}</span>
                </div>
                <div className="flex justify-between items-center pt-2 border-t border-[#e6eeee] mt-2">
                  <span className="font-semibold text-sm">Total Akhir</span>
                  <span className="font-bold text-lg text-[#0B4B50]">
                    Rp{total.toLocaleString("id-ID")}
                  </span>
                </div>
              </div>

              <div className="mt-1 rounded-2xl bg-[#f3fbfb] border border-[#d4ecec] px-3 py-3">
                <p className="text-[11px] text-gray-600 leading-relaxed">
                  Pembayaran melalui{" "}
                  <span className="font-semibold text-[#0B4B50]">transfer bank</span>. Detail
                  nomor rekening dan instruksi lengkap akan tertera di invoice.
                </p>
              </div>

              <button
                type="button"
                onClick={() => router.push("/#produk")}
                className="mt-auto text-xs md:text-[11px] text-gray-500 hover:text-[#0FA3A8] underline-offset-2 hover:underline"
              >
                ← Kembali belanja dulu
              </button>
            </aside>
          </div>
        )}
      </div>
    </main>
  )
}
