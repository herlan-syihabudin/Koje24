"use client"

import Image from "next/image"
import { useState, useEffect, memo, useCallback } from "react"
import { useCartStore } from "@/stores/cartStore"
import { useBestSellerRanking } from "@/lib/bestSeller"

// Types
interface ProductFromAPI {
  id: string;
  slug: string;
  nama: string;
  kategori: string;
  harga: number;
  stok: number;
  aktif: string;
  img: string;
  slogan?: string;
  ingredients?: string[];
  benefits?: string[];
  goodFor?: string[];
  consumeTime?: string;
  isPackage?: boolean;
  brand?: string;
  desc?: string;
}

// Helper functions
const formatIDR = (n: number) => `Rp${n.toLocaleString("id-ID")}`

// Product Card Component
const ProductCard = memo(({ 
  product, 
  onAdd,
  onRemove,
  onOpenPackage,
  addedId,
  imgReady,
  onImageLoad
}: any) => {
  const p = product
  const qty = useCartStore((state) => 
    state.items.find((i) => i.id === p.id)?.qty || 0
  )
  const isAdded = addedId === p.id

  return (
    <div
      className="group relative bg-white rounded-3xl overflow-hidden 
        border border-white/40 backdrop-blur-[2px]
        shadow-[0_5px_25px_rgba(0,0,0,0.05)]
        hover:-translate-y-2 hover:shadow-[0_10px_35px_rgba(15,163,168,0.25)]
        hover:border-[#0FA3A8]/40
        transition-all duration-500 flex flex-col"
    >
      <div className="relative w-full h-[230px] bg-[#f3f9f9] overflow-hidden rounded-t-3xl">
        {!imgReady[p.id] && (
          <div className="absolute inset-0 animate-pulse bg-gradient-to-br from-[#e3f4f4] via-[#f0fafa] to-[#d7f0f0]" />
        )}

        <Image
          data-id={`product-${p.id}`}
          src={p.img || "/placeholder.png"}
          alt={p.nama}
          fill
          priority={parseInt(p.id) < 4}
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
          className={`object-cover object-center 
            transition-transform duration-[900ms] 
            group-hover:scale-[1.07] group-hover:rotate-[0.8deg]
            ${imgReady[p.id] ? "opacity-100" : "opacity-0"}`}
          onLoadingComplete={() => onImageLoad(p.id)}
        />
      </div>

      <div className="p-5 flex flex-col flex-1">
        <h3 className="font-playfair text-xl font-semibold mb-1">{p.nama}</h3>

        {p.slogan && (
          <p className="text-sm text-[#0B4B50] font-semibold leading-snug mb-2">
            “{p.slogan}”
          </p>
        )}

        {p.ingredients && p.ingredients.length > 0 && (
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
            {formatIDR(p.harga)}
          </span>

          {p.isPackage ? (
            <button
              onClick={() => onOpenPackage(p.nama, p.harga)}
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
                onClick={() => onAdd(p, p.harga, p.img)}
                className="bg-[#0FA3A8] text-white text-sm px-3 py-2 rounded-full hover:bg-[#0DC1C7] active:scale-95 transition-all"
                aria-label="Tambah"
              >
                +
              </button>
            </div>
          ) : (
            <button
              onClick={() => onAdd(p, p.harga, p.img)}
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
  const addToCart = useCartStore((state) => state.addItem)
  const removeFromCart = useCartStore((state) => state.removeItem)
  const rankStats = useBestSellerRanking()

  const [imgReady, setImgReady] = useState<Record<string, boolean>>({})
  const [addedId, setAddedId] = useState<string | null>(null)
  const [products, setProducts] = useState<ProductFromAPI[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // 🔥 FETCH DATA DARI API (LIVE)
  useEffect(() => {
    let isMounted = true

    fetch("/api/master-produk", { cache: "no-store" })
      .then((r) => {
        if (!r.ok) throw new Error(`HTTP ${r.status}`)
        return r.json()
      })
      .then((response) => {
        if (!isMounted) return
        
        console.log("API Response:", response)
        
        // 🔥 Ambil products dari response
        const productsData = response?.success ? response.products : (Array.isArray(response) ? response : [])
        
        if (!Array.isArray(productsData)) {
          console.error("productsData is not an array:", productsData)
          setError("Gagal memuat data produk")
          setLoading(false)
          return
        }
        
        setProducts(productsData)
        setError(null)
        setLoading(false)
      })
      .catch((err) => {
        console.error("Failed to fetch products:", err)
        setError(err.message || "Gagal memuat data produk")
        setLoading(false)
      })

    return () => { isMounted = false }
  }, [])

  // Handlers
  const handleAddProduct = useCallback((product: ProductFromAPI, priceNum: number, imgFix: string) => {
    addToCart({
      id: product.id,
      name: product.nama,
      price: priceNum,
      img: imgFix,
    })

    setAddedId(product.id)
    setTimeout(() => setAddedId(null), 1000)
  }, [addToCart])

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

  if (loading) {
    return <ProductGridSkeleton />
  }

  if (error) {
    return (
      <section className="py-20 px-6 text-center">
        <p className="text-red-500">{error}</p>
      </section>
    )
  }

  if (products.length === 0) {
    return (
      <section className="py-20 px-6 text-center">
        <p className="text-gray-500">Belum ada produk yang tersedia</p>
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

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8 md:gap-10 xl:gap-12 max-w-[1400px] mx-auto place-items-stretch">
        {products.map((product) => (
          <ProductCard
            key={product.id}
            product={product}
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
