"use client";

import { useEffect, useState } from "react";
import { Package, AlertTriangle, CheckCircle } from "lucide-react";

type Product = {
  id: string;
  nama: string;
  stok: number;
  harga: number;
  aktif: string;
  thumbnail?: string;
};

export default function StockInventoryPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<"all" | "low" | "out">("all");

  useEffect(() => {
    fetch("/api/dashboard/products")
      .then((res) => res.json())
      .then((data) => {
        if (data.success) setProducts(data.products);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const filteredProducts = products.filter((p) => {
    if (filter === "low") return p.stok > 0 && p.stok <= 10;
    if (filter === "out") return p.stok === 0;
    return true;
  });

  const stats = {
    total: products.length,
    lowStock: products.filter((p) => p.stok > 0 && p.stok <= 10).length,
    outStock: products.filter((p) => p.stok === 0).length,
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 border-2 border-[#0FA3A8] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <p className="text-xs tracking-[0.25em] text-[#0FA3A8]">INVENTORY</p>
        <h1 className="text-2xl font-semibold">Stok & Inventory</h1>
        <p className="text-sm text-gray-600 mt-1">Kelola stok produk dan pantau ketersediaan.</p>
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-3">
        <div className="rounded-2xl border bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <p className="text-xs text-gray-500">Total Produk</p>
            <Package className="w-4 h-4 text-[#0FA3A8]" />
          </div>
          <p className="text-2xl font-semibold mt-2">{stats.total}</p>
        </div>
        <div className="rounded-2xl border bg-yellow-50 p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <p className="text-xs text-yellow-600">Stok Menipis (≤10)</p>
            <AlertTriangle className="w-4 h-4 text-yellow-500" />
          </div>
          <p className="text-2xl font-semibold mt-2 text-yellow-700">{stats.lowStock}</p>
        </div>
        <div className="rounded-2xl border bg-red-50 p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <p className="text-xs text-red-600">Stok Habis</p>
            <AlertTriangle className="w-4 h-4 text-red-500" />
          </div>
          <p className="text-2xl font-semibold mt-2 text-red-700">{stats.outStock}</p>
        </div>
      </div>

      {/* Filter */}
      <div className="flex gap-2">
        {[
          { key: "all", label: "Semua" },
          { key: "low", label: "Stok Menipis" },
          { key: "out", label: "Stok Habis" },
        ].map((f) => (
          <button
            key={f.key}
            onClick={() => setFilter(f.key as any)}
            className={`px-4 py-2 rounded-full text-sm transition ${
              filter === f.key
                ? "bg-[#0FA3A8] text-white"
                : "bg-white border text-gray-600 hover:bg-gray-50"
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>

      {/* Table */}
      <div className="bg-white border rounded-2xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="px-4 py-3 text-left">Produk</th>
                <th className="text-center">Stok</th>
                <th className="text-center">Harga</th>
                <th className="text-center">Status</th>
              </tr>
            </thead>
            <tbody>
              {filteredProducts.map((p) => (
                <tr key={p.id} className="border-t hover:bg-gray-50">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      {p.thumbnail ? (
                        <img src={p.thumbnail} alt={p.nama} className="w-8 h-8 rounded object-cover" />
                      ) : (
                        <div className="w-8 h-8 bg-gray-100 rounded flex items-center justify-center text-xs">📷</div>
                      )}
                      <span className="font-medium">{p.nama}</span>
                    </div>
                  </td>
                  <td className="text-center">
                    <span className={`font-semibold ${p.stok === 0 ? "text-red-600" : p.stok <= 10 ? "text-yellow-600" : "text-green-600"}`}>
                      {p.stok}
                    </span>
                  </td>
                  <td className="text-center">Rp {p.harga.toLocaleString("id-ID")}</td>
                  <td className="text-center">
                    {p.stok === 0 ? (
                      <span className="inline-flex items-center gap-1 text-red-600 text-xs">⚠️ Habis</span>
                    ) : p.stok <= 10 ? (
                      <span className="inline-flex items-center gap-1 text-yellow-600 text-xs">⚠️ Menipis</span>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-green-600 text-xs">✅ Tersedia</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {filteredProducts.length === 0 && (
          <div className="p-8 text-center text-gray-400">Tidak ada produk</div>
        )}
      </div>
    </div>
  );
}
