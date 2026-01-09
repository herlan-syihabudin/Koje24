"use client";

import { useEffect, useState } from "react";

type Product = {
  id: string;
  nama: string;
  harga: number;
  stok: number;
  aktif: "YES" | "NO";
};
export default function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [q, setQ] = useState("");

  useEffect(() => {
    load();
  }, []);

  async function load() {
    setLoading(true);
    const res = await fetch("/api/dashboard/products", { cache: "no-store" });
    const json = await res.json();
    if (json.success) setProducts(json.products);
    setLoading(false);
  }

  const filtered = products.filter((p) =>
    p.nama.toLowerCase().includes(q.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <p className="text-xs tracking-[0.25em] text-[#0FA3A8]">PRODUCTS</p>
        <h1 className="text-2xl font-semibold text-[#0B4B50]">
          Manajemen Produk
        </h1>
        <p className="text-sm text-gray-600 mt-1">
          Kelola katalog, stok, dan harga produk KOJE24.
        </p>
      </div>

      {/* Action Bar */}
      <div className="flex justify-between items-center gap-3">
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Cari produk..."
          className="border rounded-xl px-4 py-2 text-sm w-64 focus:ring-2 focus:ring-[#0FA3A8]"
        />

        <button className="bg-[#0FA3A8] text-white px-5 py-2 rounded-xl text-sm font-semibold">
          + Tambah Produk
        </button>
      </div>

      {/* Product List */}
      <div className="rounded-2xl border bg-white overflow-hidden">
        {loading ? (
          <p className="p-6 text-sm text-gray-400">Loading produk...</p>
        ) : filtered.length === 0 ? (
          <p className="p-6 text-sm text-gray-400">Produk tidak ditemukan</p>
        ) : (
          <table className="w-full text-sm">
            <thead className="bg-gray-50 text-gray-600">
              <tr>
                <th className="px-4 py-3 text-left">Produk</th>
                <th className="text-center">Harga</th>
                <th className="text-center">Stok</th>
                <th className="text-center">Status</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((p) => (
                <tr key={p.id} className="border-t">
                  <td className="px-4 py-3 font-medium">{p.nama}</td>
                  <td className="text-center">
                    Rp {p.harga.toLocaleString("id-ID")}
                  </td>
                  <td className="text-center">{p.stok}</td>
                  <td className="text-center">
                    <span
                      className={`text-xs px-2 py-1 rounded-full ${
                        p.aktif === "YES"
                          ? "bg-green-100 text-green-700"
                          : "bg-gray-200 text-gray-500"
                      }`}
                    >
                      {p.aktif === "YES" ? "Aktif" : "Nonaktif"}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Note */}
      <div className="border rounded-2xl p-4 bg-[#F7FBFB]">
        <p className="text-sm font-semibold">Catatan</p>
        <p className="text-sm text-gray-600 mt-1">
          Data produk sudah aktif & tersambung ke sistem.
        </p>
      </div>
    </div>
  );
}
