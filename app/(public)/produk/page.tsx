// app/produk/page.tsx
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
};

export default function ProdukPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  useEffect(() => {
    fetch("/api/master-produk")
      .then((res) => res.json())
      .then((data) => {
        if (data.success) setProducts(data.products);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const filteredProducts = products.filter((p) =>
    p.nama.toLowerCase().includes(search.toLowerCase())
  );

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-[#0FA3A8] border-t-transparent rounded-full animate-spin mx-auto mb-2" />
          <p className="text-gray-400">Memuat produk...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-[#0B4B50]">Produk KOJE24</h1>
        <p className="text-gray-600 mt-2">Cold-pressed juice alami tanpa gula tambahan</p>
      </div>

      {/* Search */}
      <div className="max-w-md mx-auto mb-8">
        <input
          type="text"
          placeholder="Cari produk..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full border rounded-xl px-4 py-2 focus:outline-none focus:ring-2 focus:ring-[#0FA3A8]"
        />
      </div>

      {/* Grid Produk */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
        {filteredProducts.map((product) => (
          <Link
            key={product.id}
            href={`/produk/${product.slug}`}
            className="group bg-white rounded-2xl border overflow-hidden hover:shadow-lg transition-shadow"
          >
            <div className="aspect-square bg-gray-100 flex items-center justify-center">
              {product.img ? (
                <img
                  src={product.img}
                  alt={product.nama}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="text-gray-400 text-sm">No Image</div>
              )}
            </div>
            <div className="p-3 text-center">
              <h3 className="font-semibold text-gray-800 group-hover:text-[#0FA3A8] transition">
                {product.nama}
              </h3>
              <p className="text-[#0FA3A8] font-bold mt-1">
                Rp {product.harga.toLocaleString("id-ID")}
              </p>
            </div>
          </Link>
        ))}
      </div>

      {filteredProducts.length === 0 && (
        <div className="text-center py-12 text-gray-400">Produk tidak ditemukan</div>
      )}
    </div>
  );
}
