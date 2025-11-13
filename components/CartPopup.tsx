"use client"
import { useEffect, useMemo, useState } from "react"
import { useCart } from "@/components/CartContext"

type FormState = { nama: string; alamat: string; catatan: string }
type ChangeEvt = React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>

export default function CartPopup() {
  const { cart, addItem, removeItem } = useCart()

  const totalPrice = useMemo(
    () => cart.reduce((sum: number, it: any) => sum + it.price * it.qty, 0),
    [cart]
  )

  const [form, setForm] = useState<FormState>({ nama: "", alamat: "", catatan: "" })
  const [open, setOpen] = useState(false)

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
        .map((i: any) => `• ${i.name} × ${i.qty}`)
        .join("\n")}\n\n💰 *Total:* Rp${Number(totalPrice).toLocaleString(
        "id-ID"
      )}\n\n👤 *Nama:* ${form.nama}\n🏡 *Alamat:* ${form.alamat}\n📝 *Catatan:* ${form.catatan}`
    )
    window.open(`https://wa.me/6282213139580?text=${pesan}`, "_blank")
  }

  return (
    <>
      {/* 🔹 Backdrop */}
      <div
        aria-hidden="true"
        role="presentation"
        className={`fixed inset-0 z-[60] bg-black/40 backdrop-blur-sm transition-opacity duration-200 ${
          open ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
        }`}
        onClick={close}
      />

      {/* 🔹 Container popup */}
      <div
        role="presentation"
        className={`fixed inset-0 z-[61] grid place-items-center px-4 transition-all duration-200 ${
          open ? "opacity-100 scale-100" : "opacity-0 scale-95 pointer-events-none"
        }`}
        onClick={close}
        onKeyDown={(e) => e.key === "Escape" && close()}
        tabIndex={-1}
      >
        {/* 🔹 Konten dialog */}
        <div
          role="dialog"
          aria-modal="true"
          aria-label="Keranjang KOJE24"
          className="w-full max-w-sm sm:max-w-md md:max-w-lg bg-white rounded-3xl shadow-2xl p-6 relative"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Tombol Tutup */}
          <button
            type="button"
            onClick={close}
            className="absolute top-3 right-4 text-gray-500 hover:text-[#0FA3A8] font-bold text-lg"
            aria-label="Tutup"
          >
            ✕
          </button>

          <h3 className="text-xl font-playfair font-semibold text-[#0B4B50] mb-4">
            Keranjang Kamu
          </h3>

          {/* 🔹 Daftar item */}
          <div className="space-y-3 max-h-64 overflow-y-auto border-y py-2 mb-4">
            {cart.length ? (
              cart.map((item: any) => (
                <div
                  key={item.id}
                  className="flex items-center justify-between text-sm font-inter text-[#0B4B50]"
                >
                  {/* Nama produk */}
                  <span className="flex-1 truncate">{item.name}</span>

                  {/* Tombol qty */}
                  <div className="flex items-center gap-2 mx-2 shrink-0">
                    <button
                      type="button"
                      onClick={() => {
                        if (item.qty > 1) {
                          addItem({ ...item, qty: -1 })
                        } else {
                          removeItem(item.id)
                        }
                      }}
                      className="bg-[#E8C46B] text-[#0B4B50] px-3 py-1.5 rounded-full font-semibold hover:brightness-95 active:scale-95"
                      aria-label={`Kurangi ${item.name}`}
                    >
                      –
                    </button>

                    <span className="w-6 text-center font-bold" aria-live="polite">
                      {item.qty}
                    </span>

                    <button
                      type="button"
                      onClick={() => addItem({ ...item, qty: 1 })}
                      className="bg-[#0FA3A8] text-white px-3 py-1.5 rounded-full font-semibold hover:bg-[#0DC1C7] active:scale-95"
                      aria-label={`Tambah ${item.name}`}
                    >
                      +
                    </button>
                  </div>

                  {/* Harga */}
                  <span className="w-20 text-right shrink-0">
                    Rp{(item.price * item.qty).toLocaleString("id-ID")}
                  </span>
                </div>
              ))
            ) : (
              <p className="text-gray-500 text-sm text-center">Keranjang masih kosong</p>
            )}
          </div>

          {/* 🔹 Total harga */}
          <div className="text-right text-[#0B4B50] mb-4 font-semibold">
            Total: Rp{Number(totalPrice).toLocaleString("id-ID")}
          </div>

          {/* 🔹 Form info pengiriman */}
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

          {/* 🔹 Tombol Checkout */}
          <button
            type="button"
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
