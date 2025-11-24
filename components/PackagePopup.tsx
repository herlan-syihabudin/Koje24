"use client"
import { useEffect, useState } from "react"
import { X } from "lucide-react"

type PackageData = { name: string; price: number }
type Form = { nama: string; alamat: string; catatan: string }

const VARIANTS = [
  "Green Detox",
  "Yellow Immunity",
  "Carrot Boost",
  "Red Series",
  "Sunrise",
  "Beetroot",
]

export default function PackagePopup() {
  const [open, setOpen] = useState(false)
  const [pkg, setPkg] = useState<PackageData | null>(null)
  const [form, setForm] = useState<Form>({
    nama: "",
    alamat: "",
    catatan: "",
  })
  const [qty, setQty] = useState<Record<string, number>>({})

  /* BODY LOCK – versi premium */
  const lockBody = () => {
    document.body.classList.add("overflow-hidden")
    document.documentElement.classList.add("overflow-hidden")
  }

  const unlockBody = () => {
    document.body.classList.remove("overflow-hidden")
    document.documentElement.classList.remove("overflow-hidden")
  }

  /* LISTENER */
  useEffect(() => {
    const onOpen = (e: any) => {
      setPkg(e.detail)
      setQty({})
      setOpen(true)
      lockBody()
    }

    window.addEventListener("open-package", onOpen)
    return () => window.removeEventListener("open-package", onOpen)
  }, [])

  /* CLOSE */
  const close = () => {
    setOpen(false)
    setTimeout(() => unlockBody(), 300)
  }

  /* FORM HANDLERS */
  const onChange = (key: keyof Form) => (e: any) =>
    setForm((f) => ({ ...f, [key]: e.target.value }))

  const getMaxQty = () => {
    if (!pkg) return 6
    const m = pkg.name.match(/\d+/)
    return m ? parseInt(m[0]) : 6
  }

  const maxQty = getMaxQty()
  const totalQty = Object.values(qty).reduce((a, b) => a + b, 0)

  const increase = (v: string) => {
    if (totalQty >= maxQty) return
    setQty((p) => ({ ...p, [v]: (p[v] || 0) + 1 }))
  }

  const decrease = (v: string) => {
    setQty((prev) => {
      if (!prev[v]) return prev
      if (prev[v] === 1) {
        const copy = { ...prev }
        delete copy[v]
        return copy
      }
      return { ...prev, [v]: prev[v] - 1 }
    })
  }

  const handleVariantClick = (v: string) => {
    if (qty[v]) return
    if (totalQty >= maxQty) return
    setQty((p) => ({ ...p, [v]: 1 }))
  }

  /* WA CHECKOUT */
  const handleCheckout = () => {
    if (!pkg) return
    if (totalQty !== maxQty) {
      alert(`Isi paket harus pas ${maxQty} botol, bro!`)
      return
    }

    const selected = Object.entries(qty)
      .map(([v, q]) => `🥤 ${v} × ${q}`)
      .join("\n")

    const msg = encodeURIComponent(
      `🧃 *Paket KOJE24*\n\n📦 ${pkg.name}\n💰 Rp${pkg.price.toLocaleString(
        "id-ID"
      )}\n\n${selected}\n\n👤 *Nama:* ${form.nama}\n🏡 *Alamat:* ${
        form.alamat
      }\n📝 *Catatan:* ${form.catatan}`
    )

    window.open(`https://wa.me/6282213139580?text=${msg}`, "_blank")
  }

  /* ============================================================
     UI — POPUP PREMIUM
  ============================================================ */

  return (
    <>
      {/* OVERLAY */}
      <div
        className={`
          fixed inset-0 z-[110] bg-black/40 backdrop-blur-md
          transition-all duration-300 
          ${open ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"}
        `}
        onClick={close}
      />

      {/* POPUP WRAPPER */}
      <div
        className={`
          fixed inset-0 z-[120] flex items-center justify-center px-4
          transition-all duration-300 
          ${open ? "opacity-100 scale-100" : "opacity-0 scale-95 pointer-events-none"}
        `}
      >
        {/* POPUP BOX */}
        <div
          className="
            bg-white w-full max-w-lg rounded-[28px] shadow-2xl 
            max-h-[88vh] overflow-y-auto overscroll-contain
            relative p-7
            animate-[fadeInUp_0.35s_ease]
            scrollbar-thin scrollbar-track-transparent scrollbar-thumb-gray-300
          "
          onClick={(e) => e.stopPropagation()}
        >
          {/* CLOSE BUTTON */}
          <button
            onClick={close}
            className="
              absolute top-5 right-5 p-1 rounded-full 
              bg-white shadow-md hover:bg-gray-100 
              transition-all
            "
          >
            <X size={22} className="text-gray-500" />
          </button>

          {/* TITLE */}
          <h3 className="text-2xl font-playfair font-semibold text-[#0B4B50] mb-2">
            Pilih Varian
          </h3>

          {/* PACKAGE INFO */}
          {pkg && (
            <p className="text-[#0B4B50] mb-5">
              {pkg.name} —{" "}
              <b className="text-[#0FA3A8]">
                Rp{pkg.price.toLocaleString("id-ID")}
              </b>
              <br />
              <span className="text-sm text-gray-500">
                Total botol harus <b>{maxQty}</b> (dipilih {totalQty})
              </span>
            </p>
          )}

          {/* VARIANT GRID */}
          <div className="grid grid-cols-2 gap-2 mb-5">
            {VARIANTS.map((v) => (
              <div
                key={v}
                onClick={() => handleVariantClick(v)}
                className={`
                  px-3 py-3 rounded-xl border cursor-pointer select-none
                  shadow-sm transition-all
                  ${
                    qty[v]
                      ? "bg-[#0FA3A8]/10 border-[#0FA3A8] shadow-md"
                      : "border-gray-300 hover:bg-gray-100"
                  }
                `}
              >
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">{v}</span>

                  {qty[v] && (
                    <div className="flex items-center gap-1">
                      <button
                        onClick={(e) => {
                          e.stopPropagation()
                          decrease(v)
                        }}
                        className="w-6 h-6 text-[14px] bg-[#E8C46B] text-[#0B4B50] rounded-full flex items-center justify-center font-bold"
                      >
                        –
                      </button>

                      <span className="text-sm font-semibold min-w-[18px] text-center">
                        {qty[v]}
                      </span>

                      <button
                        onClick={(e) => {
                          e.stopPropagation()
                          increase(v)
                        }}
                        disabled={totalQty >= maxQty}
                        className={`
                          w-6 h-6 text-[14px] font-bold rounded-full flex items-center justify-center
                          ${
                            totalQty >= maxQty
                              ? "bg-gray-300 text-white cursor-not-allowed"
                              : "bg-[#0FA3A8] text-white hover:bg-[#0DC1C7]"
                          }
                        `}
                      >
                        +
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* FORM */}
          <input
            type="text"
            placeholder="Nama lengkap"
            value={form.nama}
            onChange={onChange("nama")}
            className="w-full border border-gray-300 rounded-xl px-3 py-2.5 text-sm mb-3 focus:ring-2 focus:ring-[#0FA3A8]/40 outline-none"
          />

          <input
            type="text"
            placeholder="Alamat pengiriman"
            value={form.alamat}
            onChange={onChange("alamat")}
            className="w-full border border-gray-300 rounded-xl px-3 py-2.5 text-sm mb-3 focus:ring-2 focus:ring-[#0FA3A8]/40 outline-none"
          />

          <textarea
            placeholder="Catatan (opsional)"
            value={form.catatan}
            onChange={onChange("catatan")}
            className="w-full border border-gray-300 rounded-xl px-3 py-2.5 text-sm mb-3 h-20 resize-none focus:ring-2 focus:ring-[#0FA3A8]/40 outline-none"
          />

          {/* CHECKOUT */}
          <button
            onClick={handleCheckout}
            className="
              w-full py-3 bg-[#0FA3A8] hover:bg-[#0DC1C7] 
              text-white font-semibold rounded-full 
              shadow-lg transition-all active:scale-[0.97]
            "
          >
            Checkout via WhatsApp
          </button>
        </div>
      </div>
    </>
  )
}
