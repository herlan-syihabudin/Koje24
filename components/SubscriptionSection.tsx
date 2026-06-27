"use client"

import { useState, useEffect } from "react"

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

export default function SubscriptionSection() {
  const [packages, setPackages] = useState<ProductFromAPI[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // ✅ FETCH DATA DARI GOOGLE SHEETS
  useEffect(() => {
    let isMounted = true

    fetch("/api/master-produk", { cache: "no-store" })
      .then((r) => {
        if (!r.ok) throw new Error(`HTTP ${r.status}`)
        return r.json()
      })
      .then((response) => {
        if (!isMounted) return
        
        const productsData = response?.success ? response.products : (Array.isArray(response) ? response : [])
        
        if (!Array.isArray(productsData)) {
          console.error("productsData is not an array:", productsData)
          setError("Gagal memuat data paket")
          setLoading(false)
          return
        }
        
        // ✅ FILTER PAKET SAJA (Reguler Plan dihapus)
        const packageItems = productsData
          .filter((p: ProductFromAPI) => {
            return p.isPackage === true || 
                   p.kategori?.toLowerCase() === "paket" ||
                   p.kategori?.toLowerCase() === "program detox" ||
                   p.nama?.toLowerCase().includes("paket")
          })
          .filter((p: ProductFromAPI) => p.aktif === "YES")
          .sort((a: ProductFromAPI, b: ProductFromAPI) => a.harga - b.harga)
        
        setPackages(packageItems)
        setError(null)
      })
      .catch((err) => {
        console.error("Failed to fetch packages:", err)
        setError("Gagal memuat data paket")
      })
      .finally(() => {
        if (isMounted) setLoading(false)
      })

    return () => { isMounted = false }
  }, [])

  const openPackage = (name: string, price: number) => {
    window.dispatchEvent(
      new CustomEvent("open-package", {
        detail: { name, price },
      })
    )
  }

  // ⏳ LOADING STATE
  if (loading) {
    return <SubscriptionSkeleton />
  }

  // ❌ ERROR STATE
  if (error) {
    return (
      <section className="bg-gradient-to-b from-[#f9fdfd] to-[#f1fafa] py-24 px-6 text-center">
        <p className="text-red-500">{error}</p>
      </section>
    )
  }

  // 📭 EMPTY STATE
  if (packages.length === 0) {
    return (
      <section className="bg-gradient-to-b from-[#f9fdfd] to-[#f1fafa] py-24 px-6 text-center">
        <p className="text-gray-500">Belum ada paket yang tersedia</p>
      </section>
    )
  }

  return (
    <section
      id="langganan"
      className="relative bg-gradient-to-b from-[#f9fdfd] to-[#f1fafa] text-[#0B4B50] py-24 px-6 md:px-14 lg:px-24 overflow-hidden"
    >
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_bottom_right,rgba(15,163,168,0.08),transparent_70%)] pointer-events-none" />

      <div className="text-center mb-16 relative z-10">
        <h2 className="font-playfair text-3xl md:text-4xl font-semibold mb-4 text-[#0B4B50]">
          Paket Hemat KOJE24
        </h2>
        <p className="font-inter text-gray-600 text-base md:text-lg max-w-2xl mx-auto leading-relaxed">
          Pilih paket hemat untuk hasil maksimal — lebih praktis & lebih murah! 💰
          <br />
          Nikmati{" "}
          <span className="text-[#0FA3A8] font-semibold">
            #SehatBarengKOJE
          </span>{" "}
          setiap hari 🍃
        </p>
      </div>

      <div className="relative z-10 grid grid-cols-1 md:grid-cols-3 gap-8 max-w-[1024px] mx-auto">
        {packages.map((pkg, index) => {
          // Tentukan paket favorit (yang di tengah)
          const isPopular = index === 1 || pkg.nama?.toLowerCase().includes("favorit")
          
          return (
            <div
              key={pkg.id}
              className="
                group bg-white rounded-3xl border border-[#e6eeee]/60
                shadow-[0_5px_25px_rgba(0,0,0,0.05)]
                hover:-translate-y-3
                hover:shadow-[0_10px_35px_rgba(15,163,168,0.25)]
                transition-all duration-500
                flex flex-col p-6 text-center relative overflow-hidden
              "
            >
              {/* BADGE POPULAR */}
              {isPopular && (
                <span
                  className="
                    absolute top-2 left-2
                    bg-[#0FA3A8]/90 text-white
                    text-[11px] font-semibold
                    px-3 py-1 rounded-full
                    shadow-sm backdrop-blur
                    z-10
                  "
                >
                  ⭐ Favorit
                </span>
              )}

              <div className="absolute inset-x-0 top-0 h-[5px] bg-gradient-to-r from-[#0FA3A8] to-[#E8C46B] opacity-70 group-hover:opacity-100 transition-opacity duration-500" />

              <h3 className="font-playfair text-xl font-semibold mb-2 text-[#0B4B50]">
                {pkg.nama}
              </h3>

              {pkg.slogan && (
                <p className="text-sm text-[#0FA3A8] font-medium mb-2">
                  {pkg.slogan}
                </p>
              )}

              <p className="font-inter text-sm text-gray-700 mb-5 flex-1 leading-relaxed px-2">
                {pkg.desc || "Paket hemat untuk gaya hidup sehat"}
              </p>

              <div className="text-lg font-bold text-[#0FA3A8] mb-6 tracking-tight">
                Rp{pkg.harga.toLocaleString("id-ID")}
              </div>

              <button
                onClick={() => openPackage(pkg.nama, pkg.harga)}
                className="
                  bg-[#0FA3A8] hover:bg-[#0DC1C7]
                  text-white font-semibold rounded-full
                  py-2.5 px-7
                  shadow-[0_4px_15px_rgba(15,163,168,0.3)]
                  hover:shadow-[0_6px_25px_rgba(15,163,168,0.4)]
                  transition-all duration-300
                  active:scale-95
                "
              >
                Ambil Paket
              </button>
            </div>
          )
        })}
      </div>
    </section>
  )
}

// ⏳ SKELETON LOADING
function SubscriptionSkeleton() {
  return (
    <section className="bg-gradient-to-b from-[#f9fdfd] to-[#f1fafa] py-24 px-6">
      <div className="text-center mb-16">
        <div className="h-10 w-64 bg-gray-200 rounded mx-auto mb-3 animate-pulse" />
        <div className="h-6 w-96 max-w-full bg-gray-200 rounded mx-auto animate-pulse" />
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-[1024px] mx-auto">
        {[1, 2, 3].map((i) => (
          <div key={i} className="bg-white rounded-3xl p-6 shadow animate-pulse">
            <div className="h-6 w-3/4 bg-gray-200 rounded mx-auto mb-3" />
            <div className="h-4 w-full bg-gray-200 rounded mx-auto mb-5" />
            <div className="h-6 w-1/2 bg-gray-200 rounded mx-auto mb-6" />
            <div className="h-10 w-full bg-gray-200 rounded-full mx-auto" />
          </div>
        ))}
      </div>
    </section>
  )
}
