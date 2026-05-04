"use client"

import Image from "next/image"
import { useState, useEffect, memo, useCallback } from "react"
import { useCartStore } from "@/stores/cartStore"
import { useBestSellerRanking } from "@/lib/bestSeller"
import { products } from "@/lib/products"

// Types
interface SheetRow {
  kode: string;
  harga: string | number;
  hargapromo: string | number;
  img: string | null;
  active: string;
}

interface SheetData {
  [key: string]: {
    harga: number;
    promo: number;
    img: string | null;
    active: boolean;
  };
}

// Helper functions - pure, di luar component
const toNumber = (p: number | string): number => {
  if (typeof p === "number") return p
  // Hapus semua non-digit kecuali koma/titik, lalu parse
  const cleaned = String(p).replace(/[^0-9,-]/g, "").replace(",", ".")
  const num = parseFloat(cleaned)
  return isNaN(num) ? 0 : num
}

const formatIDR = (n: number) => `Rp${n.toLocaleString("id-ID")}`

// Product Card Component - memoized
const ProductCard = memo(({ 
  product, 
  sheetData, 
  rankStats,
  onAdd,
  onRemove,
  onOpenPackage,
  addedId,
  imgReady,
  onImageLoad
}: any) => {
  const p = product
  const db = sheetData[p.id]
  
  // Price priority: promo → normal → hardcode
  const priceNum = db?.promo && db.promo > 0 ? db.promo :
                   db?.harga && db.harga > 0 ? db.harga :
                   toNumber(p.price)

  const imgFix = db?.img || p.img
  const qty = useCartStore((state) => 
    state.items.find((i) => i.id === p.id)?.qty || 0
  )
  const isAdded = addedId === p.id
  const stats = rankStats?.[String(p.id)]
  const isBest = stats?.isBestSeller === true

  return (
    <div
      className="group relative bg-white rounded-3xl overflow-hidden 
        border border-white/40 backdrop-blur-[2px]
        shadow-[0_5px_25px_rgba(0,0,0,0.05)]
        hover:-translate-y-2 hover:shadow-[0_10px_35px_rgba(15,163,168,0.25)]
        hover:border-[#0FA3A8]/40
        transition-all duration-500 flex flex-col"
    >
      {/* Image */}
      <div className="relative w-full h-[230px] bg-[#f3f9f9] overflow-hidden rounded-t-3xl">
        {!imgReady[p.id] && (
          <div className="absolute inset-0 animate-pulse bg-gradient-to-br from-[#e3f4f4] via-[#f0fafa] to-[#d7f0f0]" />
        )}

        <Image
          data-id={`product-${p.id}`}
          src={imgFix}
          alt={p.name}
          fill
          priority={parseInt(p.id) < 4} // Priority hanya untuk 4 produk pertama
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
          className={`object-cover object-center 
            transition-transform duration-[900ms] 
            group-hover:scale-[1.07] group-hover:rotate-[0.8deg]
            ${imgReady[p.id] ? "opacity-100" : "opacity-0"}`}
          onLoadingComplete={() => onImageLoad(p.id)}
        />

        {isBest && (
          <span className="absolute top-4 left-4 bg-[#E8C46B] text-[#0B4B50] text-[11px] font-bold px-3 py-1 rounded-full shadow">
            ⭐ Best Seller
          </span>
        )}
      </div>

      {/* Info */}
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
          <p className="font-inter text-sm text-gray-700 mb-4 leading-relaxed line-clamp-2">
            {p.desc}
          </p>
        )}

        <div className="flex items-center justify-between mt-auto pt-2 border-t border-[#e6eeee]/60">
          <span className="font-bold text-[#0B4B50] text-lg">
            {formatIDR(priceNum)}
          </span>

          {p.isPackage ? (
            <button
              onClick={() => onOpenPackage(p.name, priceNum)}
              className="ml-auto bg-[#E8C46B] text-[#0B4B50] text-sm px-6 py-2 rounded-full font-semibold hover:brightness-110 active:scale-95 transition-all"
            >
              Ambil Paket
            </button>
          ) : qty > 0 ? (
            <div className="flex items-center gap-2 ml-auto">
              <button
                onClick={() => onRemove(p.id)}
                className="bg-[#E8C46B] text-[#0B4B50] text-sm px-3 py-2 rounded-full active:scale-95 transition-all"
                aria-label="Kurangi"
              >
                –
              </button>
              <span className="font-bold w-6 text-center">{qty}</span>
              <button
                onClick={() => onAdd(p, priceNum, imgFix)}
                className="bg-[#0FA3A8] text-white text-sm px-3 py-2 rounded-full hover:bg-[#0DC1C7] active:scale-95 transition-all"
                aria-label="Tambah"
              >
                +
              </button>
            </div>
          ) : (
            <button
              onClick={() => onAdd(p, priceNum, imgFix)}
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
})

ProductCard.displayName = 'ProductCard'

// Main Component
export default function ProductGrid({ showHeading = true }: { showHeading?: boolean }) {
  const items = useCartStore((state) => state.items)
  const addToCart = useCartStore((state) => state.addItem)
  const removeFromCart = useCartStore((state) => state.removeItem)
  const rankStats = useBestSellerRanking()

  const [imgReady, setImgReady] = useState<Record<string, boolean>>({})
  const [addedId, setAddedId] = useState<string | null>(null)
  const [sheetData, setSheetData] = useState<SheetData>({})
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Fetch sheet data
  useEffect(() => {
    let isMounted = true

    fetch("/api/master-produk", { cache: "no-store" })
      .then((r) => {
        if (!r.ok) throw new Error(`HTTP ${r.status}`)
        return r.json()
      })
      .then((rows: SheetRow[]) => {
        if (!isMounted) return
        
        const map: SheetData = {}
        rows.forEach((x) => {
          map[x.kode] = {
            harga: Number(x.harga) || 0,
            promo: Number(x.hargapromo) || 0,
            img: x.img || null,
            active: String(x.active).toLowerCase() === "true",
          }
        })
        setSheetData(map)
        setError(null)
      })
      .catch((err) => {
        console.error("Failed to fetch sheet data:", err)
        setError("Gagal memuat data produk")
      })
      .finally(() => {
        if (isMounted) setLoading(false)
      })

    return () => { isMounted = false }
  }, [])

  // Handlers
  const handleAddProduct = useCallback((product: any, priceNum: number, imgFix: string) => {
    addToCart({
      id: product.id,
      name: product.name,
      price: priceNum,
      img: imgFix,
    })

    setAddedId(product.id)

    // Flying animation
    setTimeout(() => {
      const imgDom = document.querySelector(`[data-id="product-${product.id}"]`) as HTMLElement | null
      const cartBtn = document.querySelector(".fixed.bottom-5.right-5 button") as HTMLElement | null
      
      if (!imgDom || !cartBtn || !imgReady[product.id]) return

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
        pointerEvents: "none",
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

    setTimeout(() => setAddedId(null), 1000)
  }, [addToCart, imgReady])

  const handleRemoveProduct = useCallback((id: string) => {
    removeFromCart(id)
  }, [removeFromCart])

  const handleOpenPackage = useCallback((name: string, price: number) => {
    window.dispatchEvent(
      new CustomEvent("open-package", {
        detail: { name, price }
      })
    )
  }, [])

  const handleImageLoad = useCallback((id: string) => {
    setImgReady((prev) => ({ ...prev, [id]: true }))
  }, [])

  // Filter active products
  const activeProducts = products.filter((p) => {
    const db = sheetData[p.id]
    return db ? db.active !== false : true
  })

  // Loading state
  if (loading) {
    return <ProductGridSkeleton />
  }

  // Error state
  if (error) {
    return (
      <section className="py-20 px-6 text-center">
        <p className="text-red-500">{error}</p>
      </section>
    )
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

      {/* Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8 md:gap-10 xl:gap-12 max-w-[1400px] mx-auto place-items-stretch">
        {activeProducts.map((product) => (
          <ProductCard
            key={product.id}
            product={product}
            sheetData={sheetData}
            rankStats={rankStats}
            onAdd={handleAddProduct}
            onRemove={handleRemoveProduct}
            onOpenPackage={handleOpenPackage}
            addedId={addedId}
            imgReady={imgReady}
            onImageLoad={handleImageLoad}
          />
        ))}
      </div>
    </section>
  )
}

// Skeleton Component
function ProductGridSkeleton() {
  return (
    <section className="py-20 px-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8 max-w-[1400px] mx-auto">
        {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
          <div key={i} className="bg-white rounded-3xl overflow-hidden shadow animate-pulse">
            <div className="h-[230px] bg-gray-200" />
            <div className="p-5 space-y-3">
              <div className="h-6 w-3/4 bg-gray-200 rounded" />
              <div className="h-4 w-1/2 bg-gray-200 rounded" />
              <div className="h-4 w-full bg-gray-200 rounded" />
              <div className="h-4 w-full bg-gray-200 rounded" />
              <div className="flex justify-between pt-2">
                <div className="h-6 w-20 bg-gray-200 rounded" />
                <div className="h-8 w-24 bg-gray-200 rounded-full" />
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  )
}
