"use client"
import Image from "next/image"
import { useState } from "react"
import { useCart } from "@/components/CartContext"

type Product = {
  id: number
  name: string
  desc: string
  price: number | string
  img: string
  tag?: string
}

const products: Product[] = [
  { id: 1, name: "Green Detox", desc: "Bayam • Apel • Lemon • Jahe — segar, rendah kalori.", price: "Rp18.000", img: "/image/juice-green.jpg", tag: "Best Seller" },
  { id: 2, name: "Yellow Immunity", desc: "Jeruk • Nanas • Kunyit • Madu — bantu daya tahan tubuh.", price: "Rp18.000", img: "/image/juice-yellow.jpg", tag: "Best Seller" },
  { id: 3, name: "Red Series", desc: "Semangka • Jeruk • Serai — jaga stamina & energi harian.", price: "Rp18.000", img: "/image/juice-redseries.jpg" },
  { id: 4, name: "Sunrise", desc: "Wortel • Jeruk • Serai — bantu menjaga stamina tubuh.", price: "Rp18.000", img: "/image/juice-orange.jpg" },
  { id: 5, name: "Sunrise+", desc: "Wortel • Jeruk • Serai — rasa lebih bold.", price: "Rp18.000", img: "/image/juice-sunrise.jpg" },
  { id: 6, name: "Beetroot Power", desc: "Bit • Apel • Lemon — bantu sirkulasi darah & imun tubuh.", price: "Rp18.000", img: "/image/juice-beetroot.jpg" },
]

// Helper
const toNumber = (p: number | string): number =>
  typeof p === "number" ? p : Number(p.replace(/[^0-9]/g, "")) || 0

const formatIDR = (n: number) => `Rp${n.toLocaleString("id-ID")}`

export default function ProductGrid({ showHeading = true }: { showHeading?: boolean }) {
  const { cart, addItem, removeItem } = useCart()
  const [imgReady, setImgReady] = useState<Record<number, boolean>>({})
  const [added, setAdded] = useState<number | null>(null)

  const qtyOf = (id: number) => cart[id]?.qty || 0

  const handleAdd = (p: Product) => {
    addItem(p.id, p.name, toNumber(p.price))
    setAdded(p.id)

    // 🔹 animasi gambar terbang ke cart
    const img = document.querySelector(`img[alt="${p.name}"]`) as HTMLElement
    const cartIcon = document.querySelector(".fixed.bottom-5.right-5 button") as HTMLElement

    if (img && cartIcon) {
      const clone = img.cloneNode(true) as HTMLElement
      const rectImg = img.getBoundingClientRect()
      const rectCart = cartIcon.getBoundingClientRect()

      Object.assign(clone.style, {
        position: "fixed",
        top: rectImg.top + "px",
        left: rectImg.left + "px",
        width: rectImg.width + "px",
        height: rectImg.height + "px",
        borderRadius: "10px",
        zIndex: "9999",
        opacity: "1",
        transform: "scale(1)",
        transition: "all 0.8s cubic-bezier(0.45, 0, 0.55, 1)",
      })

      document.body.appendChild(clone)

      requestAnimationFrame(() => {
        clone.style.top = rectCart.top + "px"
        clone.style.left = rectCart.left + "px"
        clone.style.width = "0px"
        clone.style.height = "0px"
        clone.style.opacity = "0"
        clone.style.transform = "scale(0.2)"
      })

      setTimeout(() => clone.remove(), 800)
    }

    setTimeout(() => setAdded(null), 1000)
  }

  return (
    <section
      id="produk"
      className="bg-gradient-to-b from-[#f8fcfc] to-[#f3fafa] text-[#0B4B50] py-20 md:py-28 px-6 md:px-14 lg:px-24"
    >
      {showHeading && (
        <div className="text-center mb-16">
          <h2 className="font-playfair text-3xl md:text-4xl font-semibold mb-3 text-[#0B4B50] tracking-tight">
            Pilihan Produk KOJE24
          </h2>
          <p className="font-inter text-gray-600 text-base md:text-lg max-w-2xl mx-auto leading-relaxed">
            Setiap botol dibuat dari bahan alami segar — tanpa pengawet, tanpa gula tambahan.
          </p>
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8 md:gap-10 xl:gap-12 max-w-[1400px] mx-auto place-items-stretch">
        {products.map((p) => {
          const priceNum = toNumber(p.price)
          const qty = qtyOf(p.id)
          const isAdded = added === p.id

          return (
            <div
              key={p.id}
              className="group relative bg-white rounded-3xl overflow-hidden border border-[#e6eeee]/60 shadow-[0_5px_25px_rgba(0,0,0,0.05)] hover:-translate-y-2 hover:shadow-[0_10px_35px_rgba(15,163,168,0.25)] hover:border-[#0FA3A8]/40 transition-all duration-500 flex flex-col h-[440px] md:h-[480px]"
            >
              <div className="relative w-full h-[220px] md:h-[260px] bg-[#f3f9f9] overflow-hidden rounded-t-3xl flex items-center justify-center">
                {!imgReady[p.id] && (
                  <div className="absolute inset-0 animate-pulse bg-gradient-to-br from-[#e3f4f4] via-[#f0fafa] to-[#d7f0f0]" />
                )}
                <Image
                  src={p.img}
                  alt={p.name}
                  fill
                  priority
                  className={`object-cover transition-transform duration-[800ms] ease-out group-hover:scale-105 ${
                    imgReady[p.id] ? "opacity-100" : "opacity-0"
                  }`}
                  onLoadingComplete={() => setImgReady((m) => ({ ...m, [p.id]: true }))}
                />
                {p.tag && (
                  <span className="absolute top-4 left-4 bg-[#E8C46B] text-[#0B4B50] text-[11px] font-semibold px-3 py-1 rounded-full shadow-sm">
                    {p.tag}
                  </span>
                )}
              </div>

              <div className="p-5 flex flex-col justify-start h-auto">
                <h3 className="font-playfair text-xl font-semibold mb-2">{p.name}</h3>
                <p className="font-inter text-sm text-gray-700 mb-4 leading-relaxed">{p.desc}</p>

                <div className="flex items-center justify-between mt-auto pt-2 border-t border-[#e6eeee]/60">
                  <span className="font-bold text-[#0B4B50] text-lg">{formatIDR(priceNum)}</span>

                  {qty > 0 ? (
                    <div className="flex items-center gap-2 ml-auto">
                      <button
                        onClick={() => removeItem(p.id)}
                        className="bg-[#E8C46B] text-[#0B4B50] text-sm px-3 py-2 rounded-full font-semibold hover:brightness-95 active:scale-90 transition-transform"
                      >
                        –
                      </button>
                      <span className="font-bold w-6 text-center">{qty}</span>
                      <button
                        onClick={() => handleAdd(p)}
                        className="bg-[#0FA3A8] text-white text-sm px-3 py-2 rounded-full font-semibold hover:bg-[#0DC1C7] active:scale-90 transition-all duration-300"
                      >
                        +
                      </button>
                    </div>
                  ) : (
                    <button
                      onClick={() => handleAdd(p)}
                      className={`ml-auto text-white text-sm px-6 py-2 rounded-full font-semibold transition-all duration-300 shadow-sm ${
                        isAdded
                          ? "bg-emerald-500 scale-105"
                          : "bg-[#0FA3A8] hover:bg-[#0DC1C7] hover:scale-[1.03]"
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
