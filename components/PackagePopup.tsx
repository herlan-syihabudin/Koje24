"use client"
import { useEffect, useState } from "react"

type PackageData = { name: string; price: number }
type Form = { nama: string; alamat: string; catatan: string }

export default function PackagePopup() {
  const [open, setOpen] = useState(false)
  const [pkg, setPkg] = useState<PackageData | null>(null)
  const [form, setForm] = useState<Form>({ nama: "", alamat: "", catatan: "" })

  useEffect(() => {
    const onOpen = (e: Event) => {
      const detail = (e as CustomEvent).detail as PackageData
      setPkg(detail)
      setOpen(true)
    }
    window.addEventListener("open-package", onOpen as EventListener)
    return () => window.removeEventListener("open-package", onOpen as EventListener)
  }, [])

  const handleCheckout = () => {
    if (!pkg) return
    const pesan = encodeURIComponent(
      `🧃 *Paket KOJE24*\n\n📦 ${pkg.name}\n💰 *Total:* Rp${pkg.price.toLocaleString("id-ID")}\n\n👤 *Nama:* ${form.nama}\n🏡 *Alamat:* ${form.alamat}\n📝 *Catatan:* ${form.catatan}`
    )
    window.open(`https://wa.me/6282213139580?text=${pesan}`, "_blank")
  }

  const close = () => setOpen(false)
  const onChange =
    (key: keyof Form) =>
    (e: any) =>
      setForm((f) => ({ ...f, [key]: e.target.value }))

  return (
    <>
      <div
        className={`fixed inset-0 z-[70] bg-black/40 backdrop-blur-sm transition-opacity duration-200 ${
          open ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
        }`}
        onClick={close}
      />
      <div
        className={`fixed inset-0 z-[71] grid place-items-center px-4 transition-all duration-200 ${
          open ? "opacity-100 scale-100" : "opacity-0 scale-95 pointer-events-none"
        }`}
        onClick={close}
      >
        <div
          className="w-full max-w-lg bg-white rounded-3xl shadow-2xl p-6 relative"
          onClick={(e) => e.stopPropagation()}
        >
          <button
            onClick={close}
            className="absolute top-3 right-4 text-gray-500 hover:text-[#0FA3A8] font-bold text-lg"
          >
            ✕
          </button>

          <h3 className="text-xl font-playfair font-semibold text-[#0B4B50] mb-2">
            Checkout Paket
          </h3>

          {pkg ? (
            <p className="mb-4 text-[#0B4B50]">
              {pkg.name} — <b>Rp{pkg.price.toLocaleString("id-ID")}</b>
            </p>
          ) : (
            <p className="mb-4 text-gray-500">Pilih paket untuk melanjutkan.</p>
          )}

          <input
            type="text"
            placeholder="Nama lengkap"
            value={form.nama}
            onChange={onChange("nama")}
            className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm mb-2"
          />
          <input
            type="text"
            placeholder="Alamat pengiriman"
            value={form.alamat}
            onChange={onChange("alamat")}
            className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm mb-2"
          />
          <textarea
            placeholder="Catatan (opsional)"
            value={form.catatan}
            onChange={onChange("catatan")}
            className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm h-16 resize-none"
          />

          <button
            onClick={handleCheckout}
            disabled={!pkg}
            className="w-full disabled:opacity-50 disabled:cursor-not-allowed bg-[#0FA3A8] text-white py-3 rounded-full font-semibold hover:bg-[#0DC1C7] transition-all mt-4"
          >
            Checkout via WhatsApp
          </button>
        </div>
      </div>
    </>
  )
}
