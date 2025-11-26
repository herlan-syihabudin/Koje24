"use client"

import { useEffect, useState } from "react"
import { X } from "lucide-react"
import { useCartStore } from "@/stores/cartStore"   // ⬅️ pakai keranjang yang sudah ada

type PackageData = { name: string; price: number }

// varian yang bisa dipilih dalam paket
const VARIANTS = [
  "Green Detox",
  "Yellow Immunity",
  "Green Revive",
  "Sunrise Boost",
  "Lemongrass Fresh",
  "Red Vitality",
]

export default function PackagePopup() {
  const [open, setOpen] = useState(false)
  const [pkg, setPkg] = useState<PackageData | null>(null)
  const [qty, setQty] = useState<Record<string, number>>({})

  // ambil fungsi addItem dari cart store
  const addItem = useCartStore((state) => state.addItem)

  /* =========================================
     BODY LOCK (tetap sama)
  ========================================= */
  const lockBody = () => {
    document.body.classList.add("overflow-hidden")
    document.documentElement.classList.add("overflow-hidden")
  }
  const unlockBody = () => {
    document.body.classList.remove("overflow-hidden")
    document.documentElement.classList.remove("overflow-hidden")
  }

  /* =========================================
     LISTENER (tetap sama, cuma simpan data paket)
  ========================================= */
  useEffect(() => {
    const onOpen = (e: any) => {
      setPkg(e.detail)   // detail = { name, price } dari PackagesSection / ProductGrid
      setQty({})
      setOpen(true)
      lockBody()
    }
    window.addEventListener("open-package", onOpen)
    return () => window.removeEventListener("open-package", onOpen)
  }, [])

  /* =========================================
     CLOSE
  ========================================= */
  const close = () => {
    setOpen(false)
    setTimeout(() => unlockBody(), 300)
  }

  /* =========================================
     VARIANT LOGIC (tetap, cuma kita pakai buat ke keranjang)
  ========================================= */
  const getMaxQty = () => {
    if (!pkg) return 6
    // coba baca angka dari nama paket, contoh: "7 Hari Detox Plan" → 7 botol
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
        const cp = { ...prev }
        delete cp[v]
        return cp
      }
      return { ...prev, [v]: prev[v] - 1 }
    })
  }

  const handleVariantClick = (v: string) => {
    if (qty[v]) return
    if (totalQty >= maxQty) return
    setQty((p) => ({ ...p, [v]: 1 }))
  }

  /* =========================================
     ⬇️ STEP PENTING: MASUKKAN PAKET KE KERANJANG
  ========================================= */
  const handleAddToCart = () => {
    if (!pkg) return

    if (totalQty !== maxQty) {
      alert(`Isi paket harus pas ${maxQty} botol, bro!`)
      return
    }

    // rangkum komposisi varian untuk ditampilkan di keranjang / invoice
    const detailText = Object.entries(qty)
      .map(([v, q]) => `${v} x${q}`)
      .join(", ")

    // kita buat nama item paket yang sudah include komposisi
    const itemName = `${pkg.name} — [${detailText}]`

    // id paket cukup di-generate dari nama supaya konsisten
    const itemId = `PKG-${pkg.name}`

    // masukkan sebagai 1 line item di keranjang
    addItem({
      id: itemId,
      name: itemName,
      price: pkg.price,
      // img optional, kalau store lu support img silakan ganti ke thumbnail khusus paket
      // @ts-ignore
      img: undefined,
    })

    // setelah masuk keranjang, kita tutup popup
    close()

    // dan buka popup keranjang / sticky bar (kalau ada listener "open-cart")
    try {
      window.dispatchEvent(new Event("open-cart"))
    } catch {
      // kalau belum ada listener, diabaikan saja
    }
  }

  /* =========================================
     PREMIUM UI — versi paket → keranjang
  ========================================= */
  return (
    <>
      {/* OVERLAY */}
      <div
        className={`
          fixed inset-0 z-[110]
          bg-black/50 backdrop-blur-[6px]
          transition-all duration-300
          ${open ? "opacity-100" : "opacity-0 pointer-events-none"}
        `}
        onClick={close}
      />

      {/* WRAPPER */}
      <div
        className={`
          fixed inset-0 z-[120]
          flex items-center justify-center
          px-4 transition-all duration-300
          ${open ? "opacity-100 scale-100" : "opacity-0 scale-95 pointer-events-none"}
        `}
      >
        {/* POPUP */}
        <div
          className="
            w-full max-w-lg bg-white rounded-[30px]
            shadow-[0_20px_50px_rgba(0,0,0,0.15)]
            ring-1 ring-[#0FA3A8]/15
            p-7 relative overflow-hidden
            max-h-[90vh] overflow-y-auto overscroll-contain
            animate-[fadeInUp_0.45s_cubic-bezier(.16,.72,.43,1)]
            backdrop-blur-xl
          "
          onClick={(e) => e.stopPropagation()}
        >
          {/* CLOSE BUTTON */}
          <button
            onClick={close}
            className="
              absolute top-5 right-5 p-2 rounded-full
              bg-white shadow-lg
              ring-1 ring-black/5
              hover:bg-gray-100 transition-all
            "
          >
            <X size={22} className="text-gray-500" />
          </button>

          {/* TITLE */}
          <h3 className="text-2xl font-playfair font-semibold text-[#0B4B50] mb-2">
            Pilih Varian Juice
          </h3>

          {pkg && (
            <p className="text-[#0B4B50] mb-6 leading-relaxed">
              <span className="font-semibold">{pkg.name}</span>{" "}
              <b className="text-[#0FA3A8]">
                — Rp{pkg.price.toLocaleString("id-ID")}
              </b>
              <br />
              <span className="text-sm text-gray-500">
                Total botol harus <b>{maxQty}</b> (dipilih {totalQty})
              </span>
              <br />
              <span className="text-[11px] text-gray-500">
                Setelah kamu pilih komposisi, paket akan dimasukkan ke
                keranjang. Data nama & alamat diisi nanti di halaman checkout.
              </span>
            </p>
          )}

          {/* VARIANTS */}
          <div className="grid grid-cols-2 gap-3 mb-6">
            {VARIANTS.map((v) => (
              <div
                key={v}
                onClick={() => handleVariantClick(v)}
                className={`
                  px-3 py-3 rounded-xl border cursor-pointer
                  shadow-sm transition-all
                  ${
                    qty[v]
                      ? "bg-[#0FA3A8]/10 border-[#0FA3A8] shadow-md"
                      : "border-gray-300 hover:bg-gray-100"
                  }
                `}
              >
                <div className="flex items-center justify-between">
                  <span className="text-[14px] font-medium">{v}</span>

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

          {/* BUTTON → MASUK KERANJANG */}
          <button
            onClick={handleAddToCart}
            className="
              w-full py-3 bg-[#0FA3A8] hover:bg-[#0DC1C7]
              text-white font-semibold rounded-full
              shadow-lg transition-all active:scale-[0.97]
            "
          >
            Tambahkan Paket ke Keranjang
          </button>
        </div>
      </div>
    </>
  )
}
