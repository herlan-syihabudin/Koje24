"use client"
import React, { useEffect, useMemo, useState } from "react"
import { useCart } from "@/components/CartContext"

type FormState = { nama: string; alamat: string; catatan: string }
type ChangeEvt = React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>

export default function CartPopup() {
  const { cart, addItem, removeItem, clearCart } = useCart()

  const totalPrice = useMemo(
    () => cart.reduce((sum, it) => sum + it.price * it.qty, 0),
    [cart]
  )

  const [form, setForm] = useState<FormState>({ nama: "", alamat: "", catatan: "" })
  const [open, setOpen] = useState(false)

  // Buka popup saat StickyCartBar mem-publish event "open-cart"
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
      `🍹 *Pesanan KOJE24*\n\n${cart
        .map((i) => `• ${i.name} × ${i.qty}`)
        .join("\n")}\n\n💰 *Total:* Rp${Number(totalPrice).toLocaleString(
        "id-ID"
      )}\n\n👤 *Nama:* ${form.nama}\n🏡 *Alamat:* ${form.alamat}\n📝 *Catatan:* ${form.catatan}`
    )
    window.open(`https://wa.me/6282213139580?text=${pesan}`, "_blank")
  }

  return (
    <>
      <div
        className={`fixed inset-0 z-[60] bg-black/40 backdrop-blur-sm transition-opacity duration-200
          ${open ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"}`}
        onClick={close}
      />
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

          <div className="space-y-2 max-h-64 overflow-y-auto border-y py-2 mb-4">
            {cart.length ? (
              cart.map((item) => (
                <div key={item.id} className="flex items-center justify-between text-sm font-inter text-[#0B4B50]">
                  <span className="mr-3 truncate">{item.name}</span>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => {
                        // decrement qty satu per klik; kalau hasilnya 0 → hapus item
                        if (item.qty > 1) {
                          // tambah qty -1
                          addItem({ ...item, qty: -1 } as any)
                        } else {
                          removeItem(item.id)
                        }
                      }}
                      className="bg-[#E8C46B] text-[#0B4B50] px-3 py-1.5 rounded-full font-semibold hover:brightness-95 active:scale-95"
                    >
                      –
                    </button>
                    <span className="w-6 text-center font-bold">{item.qty}</span>
                    <button
                      onClick={() => addItem({ ...item, qty: 1 })}
                      className="bg-[#0FA3A8] text-white px-3 py-1.5 rounded-full font-semibold hover:bg-[#0DC1C7] active:scale-95"
                    >
                      +
                    </button>
                    <button
                      onClick={() => removeItem(item.id)}
                      className="ml-2 text-xs text-red-500 underline"
                    >
                      Hapus
                    </button>
                  </div>
                  <span className="w-24 text-right">Rp{(item.price * item.qty).toLocaleString("id-ID")}</span>
                </div>
              ))
            ) : (
              <p className="text-gray-500 text-sm text-center">Keranjang masih kosong</p>
            )}
          </div>

          <div className="text-right text-[#0B4B50] mb-4 font-semibold">
            Total: Rp{Number(totalPrice).toLocaleString("id-ID")}
          </div>

          <div className="space-y-3 mb-5">
            <input
              type="text"
              placeholder="Nama lengkap"
              value={form.nama}
              onChange={onChange("nama")}
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:border-[#0FA3A8]"
            />
            <input
              type="text"
              placeholder="Alamat pengiriman"
              value={form.alamat}
              onChange={onChange("alamat")}
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:border-[#0FA3A8]"
            />
            <textarea
              placeholder="Catatan (opsional)"
              value={form.catatan}
              onChange={onChange("catatan")}
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm h-16 resize-none focus:border-[#0FA3A8]"
            />
          </div>

          <button
            onClick={handleCheckout}
            disabled={!cart.length}
            className="w-full disabled:opacity-50 disabled:cursor-not-allowed bg-[#0FA3A8] text-white py-3 rounded-full font-semibold hover:bg-[#0DC1C7] transition-all"
          >
            Checkout via WhatsApp
          </button>
        </div>
      </div>
    </>
  )
}
