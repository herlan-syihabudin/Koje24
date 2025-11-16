"use client"
import { useEffect, useState } from "react"
import { useCartStore } from "@/stores/cartStore"

type FormState = { nama: string; hp: string; alamat: string; catatan: string }
type ChangeEvt = React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>

export default function CartPopup() {
  const { items, addItem, removeItem, clearCart, totalPrice } =
    useCartStore()

  const [form, setForm] = useState<FormState>({
    nama: "",
    hp: "",
    alamat: "",
    catatan: "",
  })
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)

  // 🟢 Tampilkan popup saat event open-cart dipanggil
  useEffect(() => {
    const handler = () => setOpen(true)
    window.addEventListener("open-cart", handler)
    return () => window.removeEventListener("open-cart", handler)
  }, [])

  const close = () => setOpen(false)

  // 🔒 Lock scroll saat popup terbuka
  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : ""
  }, [open])

  const onChange =
    (key: keyof FormState) =>
    (e: ChangeEvt) =>
      setForm((prev) => ({ ...prev, [key]: e.target.value }))

  // 🚀 Checkout → Google Sheet + WhatsApp + Invoice Page
  const handleCheckout = async () => {
    if (!form.nama || !form.hp || !form.alamat) {
      alert("Isi Nama, HP, dan Alamat ya 🙏")
      return
    }

    setLoading(true)

    const produkText = items.map((i) => `${i.name}×${i.qty}`).join(", ")
    const total = Number(totalPrice)

    try {
      // 1️⃣ Simpan order ke Google Sheet
      const res = await fetch("/api/order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          nama: form.nama,
          hp: form.hp,
          alamat: form.alamat,
          produk: produkText,
          total,
        }),
      })

      let invoiceUrl: string | null = null
      if (res.ok) {
        const json = await res.json()
        invoiceUrl = json.invoiceUrl || null
      }

      // 2️⃣ Format pesan untuk WhatsApp
      const text = `🍹 *Pesanan KOJE24*\n\n${items
        .map((i) => `• ${i.name} × ${i.qty}`)
        .join("\n")}\n\n📞 *HP:* ${form.hp}\n👤 *Nama:* ${
        form.nama
      }\n🏡 *Alamat:* ${form.alamat}\n📝 *Catatan:* ${
        form.catatan || "-"
      }\n\n💰 *Total:* Rp${total.toLocaleString("id-ID")}`

      // 3️⃣ Buka WhatsApp
      window.open(
        `https://wa.me/6282213139580?text=${encodeURIComponent(text)}`,
        "_blank"
      )

      // 4️⃣ Jika invoiceUrl tersedia → buka halaman invoice
      if (invoiceUrl) {
        window.open(invoiceUrl, "_blank")
      }

      clearCart()
      close()
    } catch (err) {
      console.error("Checkout Error:", err)
      alert("Order gagal terkirim. Coba lagi ya 🙏")
    }

    setLoading(false)
  }

  if (!open) return null

  return (
    <>
      {/* Overlay Background */}
      <div
        className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[60]"
        onClick={close}
      />

      {/* Popup Card */}
      <div className="fixed inset-0 grid place-items-center z-[61] p-4">
        <div
          className="bg-white w-full max-w-md rounded-3xl p-6 relative shadow-2xl"
          onClick={(e) => e.stopPropagation()}
        >
          <button
            className="absolute top-3 right-3 text-xl text-gray-500 hover:text-[#0FA3A8]"
            onClick={close}
          >
            ✕
          </button>

          <h3 className="text-xl font-playfair font-semibold text-[#0B4B50] mb-4">
            Keranjang Kamu
          </h3>

          {/* Produk List */}
          <div className="max-h-64 overflow-y-auto border-y py-3 mb-4 space-y-3">
            {items.length ? (
              items.map((item) => (
                <div
                  key={item.id}
                  className="flex items-center justify-between text-sm text-[#0B4B50]"
                >
                  <span className="flex-1">{item.name}</span>

                  <div className="flex items-center gap-2">
                    <button
                      className="bg-[#E8C46B] text-[#0B4B50] px-3 py-1 rounded-full font-bold"
                      onClick={() => removeItem(item.id)}
                    >
                      –
                    </button>
                    <span className="w-6 text-center">{item.qty}</span>
                    <button
                      className="bg-[#0FA3A8] text-white px-3 py-1 rounded-full font-bold"
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

                  <span className="w-20 text-right">
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

          {/* Total */}
          <div className="text-right font-semibold text-[#0B4B50] mb-4">
            Total: Rp{totalPrice.toLocaleString("id-ID")}
          </div>

          {/* Form Order */}
          <div className="space-y-3 mb-5">
            <input
              type="text"
              placeholder="Nomor HP (WA)"
              value={form.hp}
              onChange={onChange("hp")}
              className="w-full border rounded-lg px-3 py-2 text-sm focus:border-[#0FA3A8]"
            />
            <input
              type="text"
              placeholder="Nama lengkap"
              value={form.nama}
              onChange={onChange("nama")}
              className="w-full border rounded-lg px-3 py-2 text-sm focus:border-[#0FA3A8]"
            />
            <input
              type="text"
              placeholder="Alamat lengkap"
              value={form.alamat}
              onChange={onChange("alamat")}
              className="w-full border rounded-lg px-3 py-2 text-sm focus:border-[#0FA3A8]"
            />
            <textarea
              placeholder="Catatan tambahan (opsional)…"
              value={form.catatan}
              onChange={onChange("catatan")}
              className="w-full border rounded-lg px-3 py-2 text-sm h-16 resize-none focus:border-[#0FA3A8]"
            />
          </div>

          {/* Checkout Button */}
          <button
            disabled={loading || items.length === 0}
            onClick={handleCheckout}
            className="w-full bg-[#0FA3A8] text-white rounded-full py-3 font-semibold disabled:opacity-50 hover:bg-[#0DC1C7] transition-all"
          >
            {loading ? "Mengirim Pesanan…" : "Checkout via WhatsApp"}
          </button>
        </div>
      </div>
    </>
  )
}
