"use client"
import { useEffect, useState } from "react"
import { useCartStore } from "@/stores/cartStore"

type FormState = { nama: string; alamat: string; catatan: string }
type ChangeEvt = React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>

export default function CartPopup() {
  const { items, addItem, removeItem, clearCart, totalPrice } =
    useCartStore()

  const [form, setForm] = useState<FormState>({
    nama: "",
    alamat: "",
    catatan: "",
  })
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)

  // 🔹 Trigger popup
  useEffect(() => {
    const handler = () => setOpen(true)
    window.addEventListener("open-cart", handler)
    return () => window.removeEventListener("open-cart", handler)
  }, [])

  const close = () => setOpen(false)

  const onChange =
    (key: keyof FormState) =>
    (e: ChangeEvt) =>
      setForm((prev) => ({ ...prev, [key]: e.target.value }))

  // 🎯 Checkout → WA + Google Sheet
  const handleCheckout = async () => {
    if (!form.nama || !form.alamat) {
      alert("Isi nama & alamat terlebih dahulu ya! 🙏")
      return
    }

    setLoading(true)

    const produkText = items.map((i) => `${i.name}×${i.qty}`).join(", ")
    const total = Number(totalPrice)

    try {
      await fetch("/api/order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          nama: form.nama,
          hp: "-",
          alamat: form.alamat,
          produk: produkText,
          total,
        }),
      })

      const text = `🍹 *Pesanan KOJE24*\n\n${items
        .map((i) => `• ${i.name} × ${i.qty}`)
        .join("\n")}\n\n💰 Total: Rp${total.toLocaleString(
        "id-ID"
      )}\n\n👤 Nama: ${form.nama}\n🏡 Alamat: ${
        form.alamat
      }\n📝 Catatan: ${form.catatan || "-"}`

      window.open(
        `https://wa.me/6282213139580?text=${encodeURIComponent(text)}`,
        "_blank"
      )

      clearCart()
      close()
    } catch (err) {
      console.error("Checkout Error:", err)
      alert("Gagal kirim order. Coba lagi ya 🙏")
    }

    setLoading(false)
  }

  if (!open) return null

  return (
    <>
      <div className="fixed inset-0 bg-black/40 z-[60]" onClick={close}></div>

      <div className="fixed inset-0 grid place-items-center z-[61] p-4">
        <div
          className="bg-white w-full max-w-md rounded-2xl p-6 relative shadow-xl"
          onClick={(e) => e.stopPropagation()}
        >
          <button className="absolute top-3 right-3 text-lg" onClick={close}>
            ✕
          </button>

          <h3 className="text-xl font-semibold text-[#0B4B50] mb-4">
            Keranjang Kamu
          </h3>

          <div className="max-h-64 overflow-y-auto border-y py-3 mb-4 space-y-3">
            {items.length ? (
              items.map((item) => (
                <div
                  key={item.id}
                  className="flex items-center justify-between text-sm"
                >
                  <span>{item.name}</span>

                  <div className="flex items-center gap-2">
                    <button
                      className="text-red-600 font-bold"
                      onClick={() => removeItem(item.id)}
                    >
                      –
                    </button>
                    <span>{item.qty}</span>
                    <button
                      className="text-green-600 font-bold"
                      onClick={() =>
                        addItem({
                          id: item.id,
                          name: item.name,
                          price: item.price,
                          img: item.img,
                        })
                      }
                    >
                      +
                    </button>
                  </div>

                  <span>
                    Rp{(item.qty * item.price).toLocaleString("id-ID")}
                  </span>
                </div>
              ))
            ) : (
              <p className="text-center text-gray-400">
                Keranjang masih kosong
              </p>
            )}
          </div>

          <div className="text-right font-bold mb-4">
            Total: Rp{totalPrice.toLocaleString("id-ID")}
          </div>

          <div className="space-y-2 mb-4">
            <input
              type="text"
              placeholder="Nama lengkap"
              value={form.nama}
              onChange={onChange("nama")}
              className="w-full border rounded p-2"
            />
            <input
              type="text"
              placeholder="Alamat lengkap"
              value={form.alamat}
              onChange={onChange("alamat")}
              className="w-full border rounded p-2"
            />
            <textarea
              placeholder="Catatan tambahan …"
              value={form.catatan}
              onChange={onChange("catatan")}
              className="w-full border rounded p-2"
            />
          </div>

          <button
            disabled={loading || items.length === 0}
            onClick={handleCheckout}
            className="w-full bg-[#0FA3A8] text-white rounded-full py-3 font-semibold disabled:opacity-50"
          >
            {loading ? "Mengirim Pesanan…" : "Checkout via WhatsApp"}
          </button>
        </div>
      </div>
    </>
  )
}
