"use client"
import { useState, useEffect } from "react"

type PackageData = {
  name: string
  price: string
}

type Form = {
  nama: string
  alamat: string
  catatan: string
}

export default function PackagePopup() {
  const [open, setOpen] = useState(false)
  const [pkg, setPkg] = useState<PackageData | null>(null)
  const [form, setForm] = useState<Form>({ nama: "", alamat: "", catatan: "" })

  // 🧠 Dengarkan event global
  useEffect(() => {
    const handler = (e: CustomEvent<PackageData>) => {
      setPkg(e.detail)
      setOpen(true)
    }
    window.addEventListener("open-package", handler as EventListener)
    return () => window.removeEventListener("open-package", handler as EventListener)
  }, [])

  const close = () => setOpen(false)
  const onChange =
    (key: keyof Form) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
      setForm((f) => ({ ...f, [key]: e.target.value }))

  const handleCheckout = () => {
    if (!pkg) return
    const pesan = encodeURIComponent(
      `🍹 *Ambil Paket KOJE24*\n\n📦 *${pkg.name}*\n💰 Harga: ${pkg.price}\n\n👤 *Nama:* ${form.nama}\n🏡 *Alamat:* ${form.alamat}\n📝 *Catatan:* ${form.catatan}\n\nSilakan konfirmasi pesanan ini.`
    )
    window.open(`https://wa.me/6282213139580?text=${pesan}`, "_blank")
    setOpen(false)
  }

  return (
    <>
      {/* Overlay */}
      <div
        onClick={close}
        className={`fixed inset-0 bg-black/40 backdrop-blur-sm z-[80] transition-opacity duration-300 ${
          open ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
        }`}
      />

      {/* Popup */}
      <div
        className={`fixed inset-0 z-[81] flex items-center justify-center transition-all duration-300 ${
          open ? "opacity-100 scale-100" : "opacity-0 scale-95 pointer-events-none"
        }`}
      >
        <div
          onClick={(e) => e.stopPropagation()}
          className="w-full max-w-md bg-gradient-to-br from-[#fffaf3] to-[#fff] border border-[#E8C46B]/40 shadow-xl rounded-3xl p-6 relative"
        >
          <button
            onClick={close}
            className="absolute top-3 right-4 text-gray-500 hover:text-[#0FA3A8] font-bold text-lg"
          >
            ✕
          </button>

          <h3 className="font-playfair text-2xl text-[#0B4B50] mb-1 font-semibold">
            Ambil Paket
          </h3>
          <p className="text-sm text-gray-600 mb-4">
            Isi data pengiriman sebelum checkout via WhatsApp
          </p>

          {pkg && (
            <div className="bg-[#FFF8E5] border border-[#E8C46B]/50 rounded-xl p-3 mb-5">
              <div className="font-semibold text-[#0B4B50] text-lg">{pkg.name}</div>
              <div className="text-[#E8C46B] font-bold">{pkg.price}</div>
            </div>
          )}

          {/* Form */}
          <div className="space-y-3">
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
            className="w-full mt-5 bg-[#E8C46B] text-[#0B4B50] py-3 rounded-full font-semibold hover:brightness-110 transition-all"
          >
            Checkout via WhatsApp
          </button>
        </div>
      </div>
    </>
  )
}
