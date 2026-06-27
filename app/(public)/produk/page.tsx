// app/(public)/produk/page.tsx

"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";

type Product = {
  id: string;
  slug: string;
  nama: string;
  harga: number;
  img: string;
  stok: number;
  aktif: string;
  kategori?: string;
  isPackage?: boolean;
};

export default function ProdukPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<"all" | "juice" | "paket">("all");

  useEffect(() => {
    fetch("/api/master-produk", { cache: "no-store" })
      .then((res) => res.json())
      .then((data) => {
        if (data.success) {
          // ✅ FILTER HANYA PRODUK AKTIF
          const activeProducts = data.products.filter(
            (p: Product) => p.aktif === "YES" || p.aktif === "true"
          );
          setProducts(activeProducts);
        }
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  // ✅ FILTER BERDASARKAN SEARCH & KATEGORI
  const filteredProducts = products.filter((p) => {
    const matchSearch = p.nama.toLowerCase().includes(search.toLowerCase());
    const matchFilter =
      filter === "all" ||
      (filter === "juice" && !p.isPackage) ||
      (filter === "paket" && p.isPackage);
    return matchSearch && matchFilter;
  });

  // ✅ HITUNG JUMLAH PRODUK PER KATEGORI
  const totalJuice = products.filter((p) => !p.isPackage).length;
  const totalPaket = products.filter((p) => p.isPackage).length;

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center pt-20">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-[#0FA3A8] border-t-transparent rounded-full animate-spin mx-auto mb-2" />
          <p className="text-gray-400">Memuat produk...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 pt-24 md:pt-28">
      {/* HEADER */}
      <div className="text-center mb-8">
        <h1 className="text-3xl md:text-4xl font-playfair font-bold text-[#0B4B50]">
          Produk KOJE24
        </h1>
        <p className="text-gray-600 mt-2">
          Cold-pressed juice alami tanpa gula tambahan
        </p>
      </div>

      {/* SEARCH & FILTER */}
      <div className="flex flex-col md:flex-row gap-4 max-w-2xl mx-auto mb-8">
        <input
          type="text"
          placeholder="Cari produk..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="flex-1 border border-gray-200 rounded-xl px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-[#0FA3A8] transition"
        />
        
        <div className="flex gap-2">
          <button
            onClick={() => setFilter("all")}
            className={`px-4 py-2 rounded-xl text-sm font-medium transition ${
              filter === "all"
                ? "bg-[#0FA3A8] text-white"
                : "bg-gray-100 text-gray-600 hover:bg-gray-200"
            }`}
          >
            Semua ({products.length})
          </button>
          <button
            onClick={() => setFilter("juice")}
            className={`px-4 py-2 rounded-xl text-sm font-medium transition ${
              filter === "juice"
                ? "bg-[#0FA3A8] text-white"
                : "bg-gray-100 text-gray-600 hover:bg-gray-200"
            }`}
          >
            Jus ({totalJuice})
          </button>
          <button
            onClick={() => setFilter("paket")}
            className={`px-4 py-2 rounded-xl text-sm font-medium transition ${
              filter === "paket"
                ? "bg-[#0FA3A8] text-white"
                : "bg-gray-100 text-gray-600 hover:bg-gray-200"
            }`}
          >
            Paket ({totalPaket})
          </button>
        </div>
      </div>

      {/* GRID PRODUK */}
      {filteredProducts.length > 0 ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
          {filteredProducts.map((product) => (
            <Link
              key={product.id}
              href={`/produk/${product.slug}`}
              className="group bg-white rounded-2xl border border-gray-100 overflow-hidden hover:shadow-xl hover:-translate-y-1 transition-all duration-300"
            >
              <div className="aspect-square bg-gray-50 flex items-center justify-center relative overflow-hidden">
                {product.img ? (
                  <Image
                    src={product.img}
                    alt={product.nama}
                    fill
                    sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
                    className="object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                ) : (
                  <div className="text-gray-400 text-sm">No Image</div>
                )}
                {product.isPackage && (
                  <span className="absolute top-2 right-2 bg-[#E8C46B] text-[#0B4B50] text-[10px] font-semibold px-2 py-1 rounded-full">
                    Paket
                  </span>
                )}
                {product.stok <= 0 && (
                  <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                    <span className="bg-red-500 text-white text-xs font-semibold px-3 py-1 rounded-full">
                      Habis
                    </span>
                  </div>
                )}
              </div>
              <div className="p-3 text-center">
                <h3 className="font-semibold text-sm text-gray-800 group-hover:text-[#0FA3A8] transition line-clamp-1">
                  {product.nama}
                </h3>
                <p className="text-[#0FA3A8] font-bold text-sm mt-1">
                  Rp {product.harga.toLocaleString("id-ID")}
                </p>
                {product.stok > 0 && product.stok < 10 && (
                  <p className="text-[10px] text-orange-500 mt-1">
                    Stok tersisa {product.stok}
                  </p>
                )}
              </div>
            </Link>
          ))}
        </div>
      ) : (
        <div className="text-center py-12 text-gray-400">
          <p className="text-lg">Produk tidak ditemukan</p>
          <p className="text-sm mt-1">Coba kata kunci lain</p>
        </div>
      )}
    </div>
  );
}
