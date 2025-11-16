"use client"
import { useEffect, useMemo, useState } from "react"
import { useCartStore } from "@/stores/cartStore"

type FormState = { nama: string; alamat: string; catatan: string }
type ChangeEvt = React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>

export default function CartPopup() {
  const { items, addItem, removeItem, clearCart, totalQty, totalPrice } =
    useCartStore((state) => ({
      items: state.items,
      addItem: state.addItem,
      removeItem: state.removeItem,
      clearCart: state.clearCart,
      totalQty: state.totalQty,
      totalPrice: state.totalPrice,
    }))

  const [form, setForm] = useState<FormState>({
    nama: "",
    alamat: "",
    catatan: "",
  })
  const [open, setOpen] = useState(false)

  useEffect(() => {
    const handler = () => setOpen(true)
    window.addEventListener("open-cart", handler)
    return () => window.removeEventListener("open-cart", handler)
  }, [])

  const close = () => setOpen(false)

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : ""
  }, [open])

  const onChange =
    (key: keyof FormState) =>
    (e: ChangeEvt) =>
      setForm((prev) => ({ ...prev, [key]: e.target.value }))

  // ⭐ NEW — Checkout → WA → Google Sheet
  const handleCheckout = async () => {
    const produkText = items.map((i) => `${i.name}×${i.qty}`).join(", ")
    const total = Number(totalPrice)

    // 1️⃣ Save to Google Sheet
    await fetch("/api/order", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        nama: form.nama,
        hp: "-", // belum ada field input HP—upgrade nanti
        alamat: form.alamat,
        produk: produkText,
        total,
      }),
    })

    // 2️⃣ Open WhatsApp
    const text = `🍹 *Pesanan KOJE24*\n\n${items
      .map((i) => `• ${i.name} × ${i.qty}`)
      .join("\n")}\n\n💰 *Total:* Rp${total.toLocaleString("id-ID")}\n\n👤 *Nama:* ${
      form.nama
    }\n🏡 *Alamat:* ${form.alamat}\n📝 *Catatan:* ${form.catatan || "-"}`

    window.open(
      `https://wa.me/6282213139580?text=${encodeURIComponent(text)}`,
      "_blank"
    )

    clearCart()
    close()
  }

  if (!open) return null

  return (
    <>
      <div
        className={`fixed inset-0 z-[60] bg-black/40 backdrop-blur-sm transition-opacity duration-200 ${
          open ? "opacity-100" : "opacity-0 pointer-events-none"
        }`}
        onClick={close}
      />

      <div
        className={`fixed inset-0 z-[61] grid place-items-center px-4 transition-all duration-200 ${
          open ? "opacity-100 scale-100" : "opacity-0 scale-95 pointer-events-none"
        }`}
        onClick={close}
      >
        <div
          className="w-full max-w-sm sm:max-w-md md:max-w-lg bg-white rounded-3xl shadow-2xl p-6 relative"
          onClick={(e) => e.stopPropagation()}
        >
          <button
            type="button"
            onClick={close}
            className="absolute top-3 right-4 text-gray-500 hover:text-[#0FA3A8] font-bold text-lg"
          >
            ✕
          </button>

          <h3 className="text-xl font-playfair font-semibold text-[#0B4B50] mb-4">
            Keranjang Kamu
          </h3>

          {/* ITEMS */}
          <div className="space-y-3 max-h-64 overflow-y-auto border-y py-2 mb-4">
            {items.length ? (
              items.map((item) => (
                <div
                  key={item.id}
                  className="flex items-center justify-between text-sm font-inter text-[#0B4B50]"
                >
                  <span className="flex-1 truncate">{item.name}</span>

                  <div className="flex items-center gap-2 mx-2 shrink-0">
                    <button
                      onClick={() => removeItem(item.id)}
                      className="bg-[#E8C46B] text-[#0B4B50] px-3 py-1.5 rounded-full font-semibold hover:brightness-95 active:scale-95"
                    >
                      –
                    </button>

                    <span className="w-6 text-center font-bold">{item.qty}</span>

                    <button
                      onClick={() =>
                        addItem({
                          id: item.id,
                          name: item.name,
                          price: item.price,
                          img: item.img,
                        })
                      }
                      className="bg-[#0FA3A8] text-white px-3 py-1.5 rounded-full font-semibold hover:bg-[#0DC1C7] active:scale-95"
                    >
                      +
                    </button>
                  </div>

                  <span className="w-20 text-right">
                    Rp{(item.qty * item.price).toLocaleString("id-ID")}
                  </span>
                </div>
              ))
            ) : (
              <p className="text-gray-500 text-sm text-center">Keranjang masih kosong</p>
            )}
          </div>

          {/* TOTAL */}
          <div className="text-right text-[#0B4B50] mb-4 font-semibold">
            Total: Rp{Number(totalPrice).toLocaleString("id-ID")}
          </div>

          {/* FORM */}
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
            type="button"
            onClick={handleCheckout}
            disabled={items.length === 0}
            className="w-full disabled:opacity-50 disabled:cursor-not-allowed bg-[#0FA3A8] text-white py-3 rounded-full font-semibold hover:bg-[#0DC1C7] transition-all"
          >
            Checkout via WhatsApp
          </button>
        </div>
      </div>
    </>
  )
}
