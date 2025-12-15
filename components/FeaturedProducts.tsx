"use client"

import Image from "next/image"
import { useCartStore } from "@/stores/cartStore"
import { products } from "@/lib/products"

const FEATURED_IDS = ["1", "2", "3"] 
// ⬆️ ganti ID sesuai produk unggulan lu (bisa paket / best seller)

const formatIDR = (n: number) => `Rp${n.toLocaleString("id-ID")}`

export default function FeaturedProducts() {
  const addToCart = useCartStore((s) => s.addItem)

  const featured = products.filter((p) => FEATURED_IDS.includes(p.id))

  if (featured.length === 0) return null

  return (
    <section className="bg-white py-16 md:py-20 px-6 md:px-14 lg:px-24">
      <div className="max-w-6xl mx-auto">

        {/* HEADING */}
        <div className="text-center mb-12">
          <h2 className="font-playfair text-3xl md:text-4xl font-semibold mb-3 text-[#0B4B50]">
            Rekomendasi KOJE24
          </h2>
          <p className="font-inter text-gray-600 max-w-xl mx-auto">
            Baru pertama coba? Mulai dari produk favorit pelanggan kami.
          </p>
        </div>

        {/* GRID */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {featured.map((p) => (
            <div
              key={p.id}
              className="group bg-[#f8fcfc] rounded-3xl overflow-hidden 
              shadow hover:shadow-xl transition-all duration-300"
            >
              {/* IMAGE */}
              <div className="relative h-[220px] bg-white">
                <Image
                  src={p.img}
                  alt={p.name}
                  fill
                  className="object-cover group-hover:scale-105 transition-transform duration-500"
                />
              </div>

              {/* CONTENT */}
              <div className="p-6 flex flex-col">
                <h3 className="font-playfair text-xl font-semibold mb-1 text-[#0B4B50]">
                  {p.name}
                </h3>

                {p.slogan && (
                  <p className="text-sm font-semibold text-[#0FA3A8] mb-2">
                    {p.slogan}
                  </p>
                )}

                {p.desc && (
                  <p className="text-sm text-gray-600 mb-4 leading-relaxed">
                    {p.desc}
                  </p>
                )}

                <div className="mt-auto flex items-center justify-between">
                  <span className="font-bold text-lg text-[#0B4B50]">
                    {formatIDR(Number(p.price))}
                  </span>

                  <button
                    onClick={() =>
                      p.isPackage
                        ? window.dispatchEvent(
                            new CustomEvent("open-package", {
                              detail: { name: p.name, price: Number(p.price) },
                            })
                          )
                        : addToCart({
                            id: p.id,
                            name: p.name,
                            price: Number(p.price),
                            img: p.img,
                          })
                    }
                    className="bg-[#0FA3A8] text-white text-sm px-6 py-2 rounded-full 
                    hover:bg-[#0DC1C7] active:scale-95 transition-all"
                  >
                    {p.isPackage ? "Lihat Paket" : "Tambah"}
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

      </div>
    </section>
  )
}
