"use client";

import { useEffect, useMemo, useState } from "react";
import AddProductModal from "./AddProductModal";

type Product = {
  id: string;
  nama: string;
  kategori?: string;
  harga: number;
  stok: number;
  aktif: "YES" | "NO";
  thumbnail?: string;
};

function rupiah(n: number) {
  return "Rp " + (n || 0).toLocaleString("id-ID");
}

export default function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  const [q, setQ] = useState("");

  // modal state
  const [openForm, setOpenForm] = useState(false);
  const [editData, setEditData] = useState<Product | null>(null);
  const [status, setStatus] = useState<"ALL" | "YES" | "NO">("ALL");
const [sort, setSort] = useState<"nama" | "harga" | "stok">("nama");
const [dir, setDir] = useState<"asc" | "desc">("asc");

  useEffect(() => {
    load();
  }, []);

  async function load() {
    setLoading(true);
    const res = await fetch("/api/dashboard/products", { cache: "no-store" });
    const json = await res.json();
    if (json.success) setProducts(json.products || []);
    setLoading(false);
  }

  const filtered = useMemo(() => {
  let data = [...products];

  // search
  const qq = q.toLowerCase().trim();
  if (qq) {
    data = data.filter((p) =>
      `${p.nama} ${p.kategori || ""}`.toLowerCase().includes(qq)
    );
  }

  // filter status
  if (status !== "ALL") {
    data = data.filter((p) => p.aktif === status);
  }

  // sort
  data.sort((a, b) => {
    let A: any = a[sort];
    let B: any = b[sort];

    if (typeof A === "string") {
      A = A.toLowerCase();
      B = B.toLowerCase();
    }

    if (A < B) return dir === "asc" ? -1 : 1;
    if (A > B) return dir === "asc" ? 1 : -1;
    return 0;
  });

  return data;
}, [products, q, status, sort, dir]);

  function openAdd() {
    setEditData(null);
    setOpenForm(true);
  }

  function openEdit(p: Product) {
    setEditData(p);
    setOpenForm(true);
  }

  async function remove(p: Product) {
    const ok = confirm(`Hapus (nonaktifkan) produk: "${p.nama}" ?`);
    if (!ok) return;

    const res = await fetch(`/api/dashboard/products/${p.id}`, {
      method: "DELETE",
    });
    const json = await res.json();
    if (!json.success) {
      alert(json.message || "Gagal hapus produk");
      return;
    }
    await load();
  }

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
      <div className="flex flex-wrap justify-between items-center gap-3">
  <div className="flex gap-2 flex-wrap">
    <input
      value={q}
      onChange={(e) => setQ(e.target.value)}
      placeholder="Cari produk..."
      className="border rounded-xl px-4 py-2 text-sm w-64"
    />

    <select
      value={status}
      onChange={(e) => setStatus(e.target.value as any)}
      className="border rounded-xl px-3 py-2 text-sm"
    >
      <option value="ALL">Semua Status</option>
      <option value="YES">Aktif</option>
      <option value="NO">Nonaktif</option>
    </select>

    <select
      value={sort}
      onChange={(e) => setSort(e.target.value as any)}
      className="border rounded-xl px-3 py-2 text-sm"
    >
      <option value="nama">Sort: Nama</option>
      <option value="harga">Sort: Harga</option>
      <option value="stok">Sort: Stok</option>
    </select>

    <button
      onClick={() => setDir(dir === "asc" ? "desc" : "asc")}
      className="border rounded-xl px-3 py-2 text-sm"
    >
      {dir === "asc" ? "⬆️ Asc" : "⬇️ Desc"}
    </button>
  </div>

  <button
    onClick={openAdd}
    className="bg-[#0FA3A8] text-white px-5 py-2 rounded-xl text-sm font-semibold"
  >
    + Tambah Produk
  </button>
</div>

      {/* Table */}
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
                <th className="px-4 py-3 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((p) => (
                <tr key={p.id} className="border-t hover:bg-gray-50/50">
                  <td className="px-4 py-3">
                    <div className="font-medium text-gray-900">{p.nama}</div>
                    {p.kategori ? (
                      <div className="text-xs text-gray-500">{p.kategori}</div>
                    ) : null}
                  </td>

                  <td className="text-center">{rupiah(p.harga)}</td>
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

                  <td className="px-4 py-3">
                    <div className="flex justify-end gap-2">
                      <button
                        onClick={() => openEdit(p)}
                        className="text-xs font-semibold text-[#0FA3A8] hover:underline"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => remove(p)}
                        className="text-xs font-semibold text-red-600 hover:underline"
                      >
                        Hapus
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Modal (Add / Edit) */}
      <AddProductModal
        open={openForm}
        mode={editData ? "edit" : "add"}
        initialData={editData}
        onClose={() => setOpenForm(false)}
        onSuccess={load}
      />
    </div>
  );
}
