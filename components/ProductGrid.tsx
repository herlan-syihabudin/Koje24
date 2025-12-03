"use client"

import Image from "next/image"
import { useState, useEffect } from "react"
import { useCartStore } from "@/stores/cartStore"
import { useBestSellerRanking } from "@/lib/bestSeller"
import { products } from "@/lib/products"   

const toNumber = (p: number | string): number =>
  typeof p === "number" ? p : Number(String(p).replace(/[^0-9]/g, "")) || 0

const formatIDR = (n: number) => `Rp${n.toLocaleString("id-ID")}`

export default function ProductGrid({ showHeading = true }: { showHeading?: boolean }) {
  const items = useCartStore((state) => state.items)
  const addToCart = useCartStore((state) => state.addItem)
  const removeFromCart = useCartStore((state) => state.removeItem)
  const rankStats = useBestSellerRanking()

  const [imgReady, setImgReady] = useState<Record<string, boolean>>({})
  const [added, setAdded] = useState<string | null>(null)

  // 🔥 DATA OTOMATIS DARI GOOGLE SHEET
  const [sheetData, setSheetData] = useState<Record<string, any>>({})
  useEffect(() => {
    fetch("/api/master-produk", { cache: "no-store" })
      .then((r) => r.json())
      .then((rows) => {
        const map: Record<string, any> = {}
        rows.forEach((x: any) => {
          map[x.kode] = {
            harga: Number(x.harga) || 0,
            promo: Number(x.hargapromo) || 0,
            img: x.img || null,
            active: String(x.active).toLowerCase() === "true",
          }
        })
        setSheetData(map)
      })
  }, [])

  const qtyOf = (id: string) => items.find((c) => c.id === id)?.qty || 0

  const openPackage = (name: string, price: number) => {
    window.dispatchEvent(
      new CustomEvent("open-package", {
        detail: { name, price }
      })
    )
  }

  const handleAddProduct = (p: any) => {
    const priceNum = toNumber(p.price)

    addToCart({
      id: p.id,
      name: p.name,
      price: priceNum,
      img: p.img,
    })

    setAdded(p.id)

    setTimeout(() => {
      const imgDom = document.querySelector(`[data-id="product-${p.id}"]`) as HTMLElement | null
      const cartBtn = document.querySelector(".fixed.bottom-5.right-5 button") as HTMLElement | null
      if (!imgDom || !cartBtn || !imgReady[p.id]) return

      const clone = imgDom.cloneNode(true) as HTMLElement
      const rectImg = imgDom.getBoundingClientRect()
      const rectCart = cartBtn.getBoundingClientRect()

      Object.assign(clone.style, {
        position: "fixed",
        top: `${rectImg.top}px`,
        left: `${rectImg.left}px`,
        width: `${rectImg.width}px`,
        height: `${rectImg.height}px`,
        borderRadius: "12px",
        zIndex: "9999",
        opacity: "1",
        transform: "scale(1)",
        transition: "all 0.9s cubic-bezier(0.45, 0, 0.55, 1)",
        boxShadow: "0 0 30px 10px rgba(15,163,168,0.4)",
      })

      document.body.appendChild(clone)

      requestAnimationFrame(() => {
        clone.style.top = `${rectCart.top}px`
        clone.style.left = `${rectCart.left}px`
        clone.style.width = "0px"
        clone.style.height = "0px"
        clone.style.opacity = "0"
        clone.style.transform = "scale(0.2)"
        clone.style.boxShadow = "0 0 10px 2px rgba(15,163,168,0.1)"
      })

      setTimeout(() => clone.remove(), 900)
    }, 30)

    setTimeout(() => setAdded(null), 1000)
  }

  return (
    <section id="produk" className="bg-gradient-to-b from-[#f8fcfc] to-[#f3fafa] text-[#0B4B50] py-20 md:py-28 px-6 md:px-14 lg:px-24">
      
      {showHeading && (
        <div className="text-center mb-16">
          <h2 className="font-playfair text-3xl md:text-4xl font-semibold mb-3">
            Pilihan Produk KOJE24
          </h2>
          <p className="font-inter text-gray-600 text-base md:text-lg max-w-2xl mx-auto">
            Setiap botol dibuat dari bahan alami segar — tanpa pengawet & tanpa gula tambahan.
          </p>
        </div>
      )}

      {/* GRID */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8 md:gap-10 xl:gap-12 max-w-[1400px] mx-auto place-items-stretch">

        {products.map((p) => {
          const db = sheetData[p.id]   // DATA DARI GOOGLE SHEET

          // 🔥 BACA HARGA PRIORITAS: PROMO → NORMAL → HARDCODE
          const priceNum =
            db?.promo && db.promo > 0 ? db.promo :
            db?.harga && db.harga > 0 ? db.harga :
            toNumber(p.price)

          // 🔥 GAMBAR — kalau sheet ada gambar, replace
          const imgFix = db?.img ? db.img : p.img

          // 🔥 jika sheet aktif = false → sembunyikan
          if (db && db.active === false) return null

          const qty = qtyOf(p.id)
          const isAdded = added === p.id

          const stats = (rankStats as any)[Number(p.id)]
          const isBest = stats?.isBestSeller === true

          return (
            <div
              key={p.id}
              className="group relative bg-white rounded-3xl overflow-hidden 
              border border-white/40 backdrop-blur-[2px]
              shadow-[0_5px_25px_rgba(0,0,0,0.05)]
              hover:-translate-y-2 hover:shadow-[0_10px_35px_rgba(15,163,168,0.25)]
              hover:border-[#0FA3A8]/40
              transition-all duration-500 flex flex-col"
            >

              {/* GAMBAR */}
              <div className="relative w-full h-[230px] bg-[#f3f9f9] overflow-hidden rounded-t-3xl flex items-center justify-center">
                {!imgReady[p.id] && (
                  <div className="absolute inset-0 animate-pulse bg-gradient-to-br from-[#e3f4f4] via-[#f0fafa] to-[#d7f0f0]" />
                )}

                <Image
                  data-id={`product-${p.id}`}
                  src={imgFix}
                  alt={p.name}
                  fill
                  priority
                  className={`object-cover object-center 
                    transition-transform duration-[900ms] 
                    group-hover:scale-[1.07] group-hover:rotate-[0.8deg]
                    ${imgReady[p.id] ? "opacity-100" : "opacity-0"}`}
                  onLoadingComplete={() => setImgReady((m) => ({ ...m, [p.id]: true }))}
                />

                {isBest && (
                  <span className="absolute top-4 left-4 bg-[#E8C46B] text-[#0B4B50] text-[11px] font-bold px-3 py-1 rounded-full shadow">
                    ⭐ Best Seller
                  </span>
                )}
              </div>

              {/* INFO */}
              <div className="p-5 flex flex-col flex-1">

                <h3 className="font-playfair text-xl font-semibold mb-1">{p.name}</h3>

                {p.slogan && (
                  <p className="text-sm text-[#0B4B50] font-semibold leading-snug mb-2">
                    “{p.slogan}”
                  </p>
                )}

                {p.ingredients && (
                  <p className="text-xs text-gray-500 mb-3">
                    {p.ingredients.join(" • ")}
                  </p>
                )}

                {p.desc && (
                  <p className="font-inter text-sm text-gray-700 mb-4 leading-relaxed">
                    {p.desc}
                  </p>
                )}

                <div className="flex items-center justify-between mt-auto pt-2 border-t border-[#e6eeee]/60">
                  <span className="font-bold text-[#0B4B50] text-lg">{formatIDR(priceNum)}</span>

                  {p.isPackage ? (
                    <button
                      onClick={() => openPackage(p.name, priceNum)}
                      className="ml-auto bg-[#E8C46B] text-[#0B4B50] text-sm px-6 py-2 rounded-full font-semibold hover:brightness-110 active:scale-95 transition-all"
                    >
                      Ambil Paket
                    </button>
                  ) : qty > 0 ? (
                    <div className="flex items-center gap-2 ml-auto">
                      <button
                        onClick={() => removeFromCart(p.id)}
                        className="bg-[#E8C46B] text-[#0B4B50] text-sm px-3 py-2 rounded-full active:scale-95 transition-all"
                      >
                        –
                      </button>
                      <span className="font-bold w-6 text-center">{qty}</span>
                      <button
                        onClick={() => handleAddProduct(p)}
                        className="bg-[#0FA3A8] text-white text-sm px-3 py-2 rounded-full hover:bg-[#0DC1C7] active:scale-95 transition-all"
                      >
                        +
                      </button>
                    </div>
                  ) : (
                    <button
                      onClick={() => handleAddProduct(p)}
                      className={`ml-auto text-white text-sm px-6 py-2 rounded-full min-w-[120px] active:scale-95 transition-all ${
                        isAdded ? "bg-emerald-500 scale-105" : "bg-[#0FA3A8] hover:bg-[#0DC1C7]"
                      }`}
                    >
                      {isAdded ? "✔ Ditambahkan" : "Tambah"}
                    </button>
                  )}
                </div>

              </div>
            </div>
          )
        })}

      </div>
    </section>
  )
}
