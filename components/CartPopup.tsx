"use client"
import React, { useEffect, useMemo, useState } from "react"
import { useCart } from "@/components/CartContext"

type FormState = { nama: string; alamat: string; catatan: string }
type ChangeEvt = React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>

export default function CartPopup() {
  // Ambil data dari context (array of items)
  const { cart, addItem, removeItem, clearCart } = useCart()

  // Hitung total secara lokal agar tidak tergantung properti tambahan di context
  const totalPrice = useMemo(
    () => cart.reduce((sum, it) => sum + it.price * it.qty, 0),
    [cart]
  )

  const [form, setForm] = useState<FormState>({ nama: "", alamat: "", catatan: "" })
  const [open, setOpen] = useState(false)
  const items = useMemo(() => cart, [cart])

  // Buka popup saat event custom "open-cart" dipublish dari StickyCartBar
  useEffect(() => {
    const handler = () => setOpen(true)
    window.addEventListener("open-cart", handler as EventListener)
    return () => window.removeEventListener("open-cart", handler as EventListener)
  }, [])

  const onChange =
    (key: keyof FormState) =>
    (e: ChangeEvt) =>
      setForm((prev) => ({ ...prev, [key]: e.target.value }))

  const close = () => setOpen(false)

  const handleCheckout = () => {
    const pesan = encodeURIComponent(
      `🍹 *Pesanan KOJE24*\n\n${items
        .map((i) => `• ${i.name} × ${i.qty}`)
        .join("\n")}\n\n💰 *Total:* Rp${Number(totalPrice).toLocaleString(
        "id-ID"
      )}\n\n👤 *Nama:* ${form.nama}\n🏡 *Alamat:* ${form.alamat}\n📝 *Catatan:* ${form.catatan}`
    )
    window.open(`https://wa.me/6282213139580?text=${pesan}`, "_blank")
  }

  return (
    <>
      {/* Overlay */}
      <div
        className={`fixed inset-0 z-[60] bg-black/40 backdrop-blur-sm transition-opacity duration-200
          ${open ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"}`}
        onClick={close}
      />

      {/* Modal card */}
      <div
        className={`fixed inset-0 z-[61] grid place-items-center px-4 transition-all duration-200
          ${open ? "opacity-100 scale-100" : "opacity-0 scale-95 pointer-events-none"}`}
        onClick={close}
      >
        <div
          className="w-full max-w-lg bg-white rounded-3xl shadow-2xl p-6 relative"
          onClick={(e) => e.stopPropagation()}
        >
          <button
            onClick={close}
            className="absolute top-3 right-4 text-gray-500 hover:text-[#0FA3A8] font-bold text-lg"
            aria-label="Tutup"
          >
            ✕
          </button>

          <h3 className="text-xl font-playfair font-semibold text-[#0B4B50] mb-4">
            Keranjang Kamu
          </h3>

          {/* List Produk */}
          <div className="space-y-2 max-h-64 overflow-y-auto border-y py-2 mb-4">
            {items.length ? (
              items.map((item) => (
                <div
                  key={item.id}
                  className="flex justify-between text-sm font-inter text-[#0B4B50]"
                >
                  <span>
                    {item.name} <b>× {item.qty}</b>
                  </span>
                  <span>Rp{(item.price * item.qty).toLocaleString("id-ID")}</span>
                </div>
              ))
            ) : (
              <p className="text-gray-500 text-sm text-center">Keranjang masih kosong</p>
            )}
          </div>

          {/* Total */}
          <div className="text-right text-[#0B4B50] mb-4 font-semibold">
            Total: Rp{Number(totalPrice).toLocaleString("id-ID")}
          </div>

          {/* Form */}
          <div className="space-y-3 mb-5">
            <input
              type="text"
              placeholder="Nama lengkap"
              value={form.nama}
              onChange={onChange("nama")}
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:border-[#0FA3A8] outline-none"
            />
            <input
              type="text"
              placeholder="Alamat pengiriman"
              value={form.alamat}
              onChange={onChange("alamat")}
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:border-[#0FA3A8] outline-none"
            />
            <textarea
              placeholder="Catatan (opsional)"
              value={form.catatan}
              onChange={onChange("catatan")}
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm h-16 resize-none focus:border-[#0FA3A8] outline-none"
            />
          </div>

          <button
            onClick={handleCheckout}
            className="w-full bg-[#0FA3A8] text-white py-3 rounded-full font-semibold hover:bg-[#0DC1C7] transition-all"
          >
            Checkout via WhatsApp
          </button>
        </div>
      </div>
    </>
  )
}
