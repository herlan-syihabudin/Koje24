"use client"

import { useEffect, useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { X, CheckCircle } from "lucide-react"
import toast from 'react-hot-toast'
import { useCartStore } from "@/stores/cartStore"
import { products } from "@/lib/products"

type PackageData = { 
  name: string
  price: number
  img?: string 
}

// Filter variants dari products (atau bisa dari API)
const VARIANTS = products
  .filter(p => p.category === 'variant' || !p.isPackage)
  .map(p => p.name)
  .slice(0, 6) // ambil 6 aja

// Default variants kalau kosong
const DEFAULT_VARIANTS = [
  "Green Detox",
  "Yellow Immunity",
  "Green Revive",
  "Sunrise Boost",
  "Lemongrass Fresh",
  "Red Vitality",
]

const ACTIVE_VARIANTS = VARIANTS.length > 0 ? VARIANTS : DEFAULT_VARIANTS

export default function PackagePopup() {
  const [open, setOpen] = useState(false)
  const [pkg, setPkg] = useState<PackageData | null>(null)
  const [qty, setQty] = useState<Record<string, number>>({})

  const addItem = useCartStore((state) => state.addItem)

  // Body lock
  useEffect(() => {
    if (open) {
      document.body.classList.add("overflow-hidden")
      document.documentElement.classList.add("overflow-hidden")
    } else {
      document.body.classList.remove("overflow-hidden")
      document.documentElement.classList.remove("overflow-hidden")
    }
  }, [open])

  // Listener
  useEffect(() => {
    const onOpen = (e: CustomEvent<PackageData>) => {
      setPkg({
        name: e.detail.name,
        price: e.detail.price,
        img: e.detail.img || "/images/package-placeholder.jpg"
      })
      setQty({})
      setOpen(true)
    }

    window.addEventListener("open-package", onOpen as EventListener)
    return () => window.removeEventListener("open-package", onOpen as EventListener)
  }, [])

  // Close handler
  const close = () => {
    setOpen(false)
    setQty({})
  }

  // Get max quantity from package name
  const getMaxQty = () => {
    if (!pkg) return 6
    
    const patterns = [
      /(\d+)\s*hari/i,
      /(\d+)\s*botol/i,
      /^paket\s*(\d+)/i,
      /(\d+)/
    ]
    
    for (const pattern of patterns) {
      const match = pkg.name.match(pattern)
      if (match) return parseInt(match[1])
    }
    
    return 6
  }

  const maxQty = getMaxQty()
  const totalQty = Object.values(qty).reduce((a, b) => a + b, 0)
  const isComplete = totalQty === maxQty
  const progress = (totalQty / maxQty) * 100

  // Variant handlers
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

  // Add to cart
  const handleAddToCart = () => {
    if (!pkg) return

    if (!isComplete) {
      toast.error(`Isi paket harus pas ${maxQty} botol`, {
        icon: '⚠️',
        duration: 3000,
        style: {
          background: '#FEE2E2',
          color: '#991B1B',
          borderRadius: '999px',
        }
      })
      return
    }

    const detailText = Object.entries(qty)
      .map(([v, q]) => `${v} x${q}`)
      .join(", ")

    const itemName = `${pkg.name} — [${detailText}]`
    const itemId = `PKG-${pkg.name}-${Date.now()}`

    addItem({
      id: itemId,
      name: itemName,
      price: pkg.price,
      img: pkg.img,
    })

    // Success toast
    toast.success('Paket berhasil ditambahkan ke keranjang!', {
      icon: '🛒',
      duration: 2000,
      style: {
        background: '#0FA3A8',
        color: 'white',
        borderRadius: '999px',
      }
    })

    close()

    // Open cart
    try {
      window.dispatchEvent(new Event("open-cart"))
    } catch {
      // Ignore if no listener
    }
  }

  return (
    <AnimatePresence>
      {open && (
        <>
          {/* Overlay */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[110] bg-black/50 backdrop-blur-[6px]"
            onClick={close}
          />

          {/* Popup */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ type: "spring", duration: 0.3 }}
            className="fixed inset-0 z-[120] flex items-center justify-center px-4"
            onClick={close}
          >
            <div
              className="
                w-full max-w-lg bg-white rounded-[30px]
                shadow-[0_20px_50px_rgba(0,0,0,0.15)]
                ring-1 ring-[#0FA3A8]/15
                p-7 relative overflow-hidden
                max-h-[90vh] overflow-y-auto overscroll-contain
              "
              onClick={(e) => e.stopPropagation()}
            >
              {/* Close button */}
              <button
                onClick={close}
                className="
                  absolute top-5 right-5 p-2 rounded-full
                  bg-white shadow-lg
                  ring-1 ring-black/5
                  hover:bg-gray-100 transition-all
                  z-10
                "
                aria-label="Tutup popup"
              >
                <X size={22} className="text-gray-500" />
              </button>

              {/* Title */}
              <h3 className="text-2xl font-playfair font-semibold text-[#0B4B50] mb-2 pr-10">
                Pilih Varian Juice
              </h3>

              {pkg && (
                <>
                  <p className="text-[#0B4B50] mb-4 leading-relaxed">
                    <span className="font-semibold">{pkg.name}</span>{" "}
                    <b className="text-[#0FA3A8]">
                      — Rp {pkg.price.toLocaleString("id-ID")}
                    </b>
                  </p>

                  {/* Progress bar */}
                  <div className="mb-4">
                    <div className="flex justify-between text-xs text-gray-500 mb-1">
                      <span>Progress pemilihan</span>
                      <span className={isComplete ? "text-green-600 font-medium" : ""}>
                        {totalQty}/{maxQty} botol
                      </span>
                    </div>
                    <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                      <motion.div 
                        className="h-full bg-[#0FA3A8]"
                        initial={{ width: 0 }}
                        animate={{ width: `${progress}%` }}
                        transition={{ duration: 0.3 }}
                      />
                    </div>
                  </div>

                  {/* Summary when complete */}
                  {isComplete && (
                    <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="mb-4 p-3 bg-green-50 rounded-xl border border-green-200"
                    >
                      <p className="text-xs text-green-700 font-medium mb-1 flex items-center gap-1">
                        <CheckCircle size={14} /> Komposisi paket:
                      </p>
                      <p className="text-sm text-gray-700">
                        {Object.entries(qty)
                          .map(([v, q]) => `${q} × ${v}`)
                          .join(', ')}
                      </p>
                    </motion.div>
                  )}
                </>
              )}

              {/* Variants grid */}
              <div className="grid grid-cols-2 gap-3 mb-6">
                {ACTIVE_VARIANTS.map((v) => (
                  <motion.div
                    key={v}
                    whileHover={{ scale: qty[v] ? 1 : 1.02 }}
                    whileTap={{ scale: qty[v] ? 1 : 0.98 }}
                    onClick={() => handleVariantClick(v)}
                    className={`
                      px-3 py-3 rounded-xl border cursor-pointer
                      shadow-sm transition-all
                      ${
                        qty[v]
                          ? "bg-[#0FA3A8]/10 border-[#0FA3A8] shadow-md"
                          : "border-gray-200 hover:border-[#0FA3A8]/30 hover:bg-gray-50"
                      }
                      ${totalQty >= maxQty && !qty[v] ? "opacity-50 cursor-not-allowed" : ""}
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
                            className="w-6 h-6 text-[14px] bg-[#E8C46B] text-[#0B4B50] rounded-full flex items-center justify-center font-bold hover:bg-[#d4b259] transition"
                            aria-label="Kurangi"
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
                            aria-label="Tambah"
                          >
                            +
                          </button>
                        </div>
                      )}
                    </div>
                  </motion.div>
                ))}
              </div>

              {/* Add to cart button */}
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={handleAddToCart}
                disabled={!isComplete}
                className={`
                  w-full py-3 rounded-full font-semibold
                  shadow-lg transition-all
                  ${
                    isComplete
                      ? "bg-[#0FA3A8] hover:bg-[#0DC1C7] text-white"
                      : "bg-gray-200 text-gray-500 cursor-not-allowed"
                  }
                `}
              >
                {isComplete ? "Tambahkan Paket ke Keranjang" : `Pilih ${maxQty - totalQty} botol lagi`}
              </motion.button>

              {/* Info text */}
              <p className="text-[10px] text-gray-400 text-center mt-3">
                Data nama & alamat akan diisi di halaman checkout
              </p>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}
