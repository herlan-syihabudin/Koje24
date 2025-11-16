"use client"

import Image from "next/image"
import { useState } from "react"
import { useCartStore } from "@/stores/cartStore"
import { useBestSellerRanking } from "@/lib/bestSeller" // ⭐ NEW

type Product = {
  id: number
  name: string
  desc: string
  price: number | string
  img: string
  isPackage?: boolean
}

const toNumber = (p: number | string): number =>
  typeof p === "number" ? p : Number(String(p).replace(/[^0-9]/g, "")) || 0

const formatIDR = (n: number) => `Rp${n.toLocaleString("id-ID")}`

const products: Product[] = [
  { id: 1, name: "Detox", desc: "Bayam • Apel • Lemon • Jahe — segar, rendah kalori.", price: "Rp18.000", img: "/image/detox.JPG" },
  { id: 2, name: "Yellow Immunity", desc: "Jeruk • Nanas • Kunyit • Madu — bantu daya tahan tubuh.", price: "Rp18.000", img: "/image/yellowseries.JPG" },
  { id: 3, name: "Red Series", desc: "Semangka • Jeruk • Serai — jaga stamina & energi harian.", price: "Rp18.000", img: "/image/juice-redseries.jpg" },
  { id: 4, name: "Sunrise", desc: "Wortel • Jeruk • Serai — bantu stamina tubuh.", price: "Rp18.000", img: "/image/juice-orange.jpg" },
  { id: 5, name: "Sunrise+", desc: "Wortel • Jeruk • Serai — rasa lebih bold.", price: "Rp18.000", img: "/image/juice-sunrise.jpg" },
  { id: 6, name: "Beetroot Power", desc: "Bit • Apel • Lemon — bantu sirkulasi darah.", price: "Rp18.000", img: "/image/juice-beetroot.jpg" },
  {
    id: 7,
    name: "Paket Detox 3 Hari",
    desc: "6 botol/hari kombinasi varian sehat untuk detoks total.",
    price: "Rp320.000",
    img: "/image/paket-detox.jpg",
    isPackage: true,
  },
]

export default function ProductGrid({ showHeading = true }: { showHeading?: boolean }) {
  const items = useCartStore((state) => state.items)
  const addToCart = useCartStore((state) => state.addItem)
  const removeFromCart = useCartStore((state) => state.removeItem)

  const rankStats = useBestSellerRanking() // ⭐ BEST SELLER SYSTEM

  const [imgReady, setImgReady] = useState<Record<number, boolean>>({})
  const [added, setAdded] = useState<number | null>(null)

  const qtyOf = (id: number) => items.find((c) => c.id === id.toString())?.qty || 0

  const openPackage = (name: string, price: number | string) => {
    window.dispatchEvent(
      new CustomEvent("open-package" as any, {
        detail: { name, price: toNumber(price) },
      } as any)
    )
  }

  const handleAddProduct = (p: Product) => {
    const priceNum = toNumber(p.price)

    addToCart({
      id: p.id.toString(),
      name: p.name,
      price: priceNum,
      img: p.img,
    })

    setAdded(p.id)

    setTimeout(() => {
      const img = document.querySelector(`[data-id="product-${p.id}"]`) as HTMLElement | null
      const cartBtn = document.querySelector(".fixed.bottom-5.right-5 button") as HTMLElement | null
      if (!img || !cartBtn || !imgReady[p.id]) return

      const clone = img.cloneNode(true) as HTMLElement
      const rectImg = img.getBoundingClientRect()
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
    }, 50)

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
            Setiap botol dibuat dari bahan alami segar — tanpa pengawet, tanpa gula tambahan.
          </p>
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8 md:gap-10 xl:gap-12 max-w-[1400px] mx-auto place-items-stretch">
        {products.map((p) => {
          const priceNum = toNumber(p.price)
          const qty = qtyOf(p.id)
          const isAdded = added === p.id
          const stats = rankStats[p.id]
          const isBest = stats?.isBestSeller || false

          return (
            <div
              key={p.id}
              className="group relative bg-white rounded-3xl overflow-hidden border border-[#e6eeee]/60 shadow-[0_5px_25px_rgba(0,0,0,0.05)] hover:-translate-y-2 hover:shadow-[0_10px_35px_rgba(15,163,168,0.25)] hover:border-[#0FA3A8]/40 transition-all duration-500 flex flex-col h-[450px]"
            >
              <div className="relative w-full h-[230px] bg-[#f3f9f9] overflow-hidden rounded-t-3xl flex items-center justify-center">
                
                {!imgReady[p.id] && (
                  <div className="absolute inset-0 animate-pulse bg-gradient-to-br from-[#e3f4f4] via-[#f0fafa] to-[#d7f0f0]" />
                )}

                <Image
                  data-id={`product-${p.id}`}
                  src={p.img}
                  alt={p.name}
                  fill
                  priority
                  className={`object-cover object-center transition-transform duration-[800ms] ease-out group-hover:scale-105 ${
                    imgReady[p.id] ? "opacity-100" : "opacity-0"
                  }`}
                  onLoadingComplete={() => setImgReady((m) => ({ ...m, [p.id]: true }))}
                />

                {/* ⭐ Auto Best Seller Badge */}
                {isBest && (
                  <span className="absolute top-4 left-4 bg-[#E8C46B] text-[#0B4B50] text-[11px] font-bold px-3 py-1 rounded-full shadow-md animate-pulse">
                    ⭐ Best Seller
                  </span>
                )}
              </div>

              <div className="p-5 flex flex-col justify-start h-auto">
                <h3 className="font-playfair text-xl font-semibold mb-1">{p.name}</h3>

                {/* ⭐ Rating Display */}
                {stats?.reviews > 0 && (
                  <div className="flex items-center gap-1 mb-2">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <span
                        key={i}
                        className={`text-[13px] ${
                          i < Math.round(stats.rating)
                            ? "text-yellow-500"
                            : "text-gray-300"
                        }`}
                      >
                        ★
                      </span>
                    ))}
                    <span className="text-xs text-gray-500 ml-1">
                      ({stats.reviews})
                    </span>
                  </div>
                )}

                <p className="font-inter text-sm text-gray-700 mb-4 leading-relaxed">{p.desc}</p>

                <div className="flex items-center justify-between mt-auto pt-2 border-t border-[#e6eeee]/60">
                  <span className="font-bold text-[#0B4B50] text-lg">{formatIDR(priceNum)}</span>

                  {p.isPackage ? (
                    <button
                      onClick={() => openPackage(p.name, p.price)}
                      className="ml-auto bg-[#E8C46B] text-[#0B4B50] text-sm px-6 py-2 rounded-full font-semibold hover:brightness-110 active:scale-95"
                    >
                      Ambil Paket
                    </button>
                  ) : qty > 0 ? (
                    <div className="flex items-center gap-2 ml-auto">
                      <button
                        onClick={() => removeFromCart(p.id.toString())}
                        className="bg-[#E8C46B] text-[#0B4B50] text-sm px-3 py-2 rounded-full"
                      >
                        –
                      </button>
                      <span className="font-bold w-6 text-center">{qty}</span>
                      <button
                        onClick={() => handleAddProduct(p)}
                        className="bg-[#0FA3A8] text-white text-sm px-3 py-2 rounded-full hover:bg-[#0DC1C7]"
                      >
                        +
                      </button>
                    </div>
                  ) : (
                    <button
                      onClick={() => handleAddProduct(p)}
                      className={`ml-auto text-white text-sm px-6 py-2 rounded-full min-w-[120px] ${
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
