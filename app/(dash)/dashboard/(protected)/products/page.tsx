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
  const [status, setStatus] = useState<"ALL" | "YES" | "NO">("ALL");
  const [sort, setSort] = useState<"nama" | "harga" | "stok">("nama");
  const [dir, setDir] = useState<"asc" | "desc">("asc");

  const [openForm, setOpenForm] = useState(false);
  const [editData, setEditData] = useState<Product | null>(null);

  // inline stok
  const [editingStock, setEditingStock] = useState<string | null>(null);
  const [stockValue, setStockValue] = useState<number>(0);

  // action lock
  const [busyId, setBusyId] = useState<string | null>(null);

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

    if (q.trim()) {
      const qq = q.toLowerCase();
      data = data.filter((p) =>
        `${p.nama} ${p.kategori || ""}`.toLowerCase().includes(qq)
      );
    }

    if (status !== "ALL") {
      data = data.filter((p) => p.aktif === status);
    }

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

  /* =====================
     INLINE ACTIONS
  ===================== */

  async function toggleStatus(p: Product) {
    if (busyId) return;
    setBusyId(p.id);

    const next = p.aktif === "YES" ? "NO" : "YES";

    // optimistic UI
    setProducts((prev) =>
      prev.map((x) => (x.id === p.id ? { ...x, aktif: next } : x))
    );

    const res = await fetch(`/api/dashboard/products/${p.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ aktif: next }),
    });

    const json = await res.json();
    if (!json.success) {
      // rollback
      setProducts((prev) =>
        prev.map((x) => (x.id === p.id ? { ...x, aktif: p.aktif } : x))
      );
      alert(json.message || "Gagal update status");
    }

    setBusyId(null);
  }

  async function saveStock(p: Product) {
    if (busyId) return;
    setBusyId(p.id);

    const old = p.stok;

    setProducts((prev) =>
      prev.map((x) =>
        x.id === p.id ? { ...x, stok: stockValue } : x
      )
    );

    const res = await fetch(`/api/dashboard/products/${p.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ stok: stockValue }),
    });

    const json = await res.json();
    if (!json.success) {
      setProducts((prev) =>
        prev.map((x) =>
          x.id === p.id ? { ...x, stok: old } : x
        )
      );
      alert(json.message || "Gagal update stok");
    }

    setEditingStock(null);
    setBusyId(null);
  }

  async function remove(p: Product) {
    if (!confirm(`Nonaktifkan produk "${p.nama}"?`)) return;

    setProducts((prev) => prev.filter((x) => x.id !== p.id));

    const res = await fetch(`/api/dashboard/products/${p.id}`, {
      method: "DELETE",
    });

    const json = await res.json();
    if (!json.success) {
      alert(json.message || "Gagal hapus produk");
      load(); // fallback reload
    }
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
      <div className="flex flex-wrap justify-between gap-3">
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
                    <div className="flex items-center gap-3">
                      {p.thumbnail ? (
                        <img
                          src={p.thumbnail}
                          className="w-10 h-10 rounded-lg object-cover border"
                        />
                      ) : (
                        <div className="w-10 h-10 rounded-lg bg-gray-100 flex items-center justify-center text-xs text-gray-400">
                          —
                        </div>
                      )}

                      <div>
                        <div className="font-medium">{p.nama}</div>
                        {p.kategori && (
                          <div className="text-xs text-gray-500">
                            {p.kategori}
                          </div>
                        )}
                      </div>
                    </div>
                  </td>

                  <td className="text-center">{rupiah(p.harga)}</td>

                  <td className="text-center">
                    {editingStock === p.id ? (
                      <input
                        type="number"
                        className="border rounded px-2 py-1 w-20 text-center"
                        value={stockValue}
                        onChange={(e) =>
                          setStockValue(Number(e.target.value))
                        }
                        onBlur={() => saveStock(p)}
                        onKeyDown={(e) => {
                          if (e.key === "Enter") saveStock(p);
                          if (e.key === "Escape")
                            setEditingStock(null);
                        }}
                        autoFocus
                      />
                    ) : (
                      <span
                        onClick={() => {
                          setEditingStock(p.id);
                          setStockValue(p.stok);
                        }}
                        className="cursor-pointer hover:underline"
                      >
                        {p.stok}
                      </span>
                    )}
                  </td>

                  <td className="text-center">
                    <span
                      onClick={() => toggleStatus(p)}
                      className={`cursor-pointer text-xs px-2 py-1 rounded-full ${
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
                        className="text-xs font-semibold text-[#0FA3A8]"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => remove(p)}
                        className="text-xs font-semibold text-red-600"
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
