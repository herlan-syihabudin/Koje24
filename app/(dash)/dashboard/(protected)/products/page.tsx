"use client";

import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
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

  // 🔥 FIX 2: busy state per row pake Set (independent)
  const [busyIds, setBusyIds] = useState<Set<string>>(new Set());

  function isBusy(id: string) {
    return busyIds.has(id);
  }

  function addBusy(id: string) {
    setBusyIds((prev) => new Set(prev).add(id));
  }

  function removeBusy(id: string) {
    setBusyIds((prev) => {
      const next = new Set(prev);
      next.delete(id);
      return next;
    });
  }

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
    if (isBusy(p.id)) return;
    addBusy(p.id);

    const next = p.aktif === "YES" ? "NO" : "YES";
    const oldStatus = p.aktif;

    // optimistic UI
    setProducts((prev) =>
      prev.map((x) => (x.id === p.id ? { ...x, aktif: next } : x))
    );

    try {
      const res = await fetch(`/api/dashboard/products/${p.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ aktif: next }),
      });

      const json = await res.json();

      if (!json.success) {
        throw new Error(json.message || "Gagal update status");
      }

      toast.success(`Status produk "${p.nama}" berhasil diupdate`);
    } catch (err: any) {
      // rollback
      setProducts((prev) =>
        prev.map((x) => (x.id === p.id ? { ...x, aktif: oldStatus } : x))
      );
      toast.error(err.message || "Gagal update status");
    } finally {
      removeBusy(p.id);
    }
  }

  async function saveStock(p: Product) {
    if (isBusy(p.id)) return;
    addBusy(p.id);

    const oldStock = p.stok;
    const newStock = stockValue;

    // optimistic UI
    setProducts((prev) =>
      prev.map((x) =>
        x.id === p.id ? { ...x, stok: newStock } : x
      )
    );

    try {
      const res = await fetch(`/api/dashboard/products/${p.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ stok: newStock }),
      });

      const json = await res.json();

      if (!json.success) {
        throw new Error(json.message || "Gagal update stok");
      }

      toast.success(`Stok "${p.nama}" diupdate menjadi ${newStock}`);
      setEditingStock(null);
    } catch (err: any) {
      // rollback
      setProducts((prev) =>
        prev.map((x) =>
          x.id === p.id ? { ...x, stok: oldStock } : x
        )
      );
      toast.error(err.message || "Gagal update stok");
    } finally {
      removeBusy(p.id);
    }
  }

  // 🔥 FIX 1: Optimistic delete dengan rollback tanpa reload
  async function remove(p: Product) {
    if (!confirm(`Hapus produk "${p.nama}"?`)) return;
    if (isBusy(p.id)) return;
    
    addBusy(p.id);
    
    // backup untuk rollback
    const oldProducts = [...products];
    
    // optimistic UI delete
    setProducts((prev) => prev.filter((x) => x.id !== p.id));

    try {
      const res = await fetch(`/api/dashboard/products/${p.id}`, {
        method: "DELETE",
      });

      const json = await res.json();

      if (!json.success) {
        throw new Error(json.message || "Gagal hapus produk");
      }

      toast.success(`Produk "${p.nama}" berhasil dihapus`);
    } catch (err: any) {
      // rollback tanpa reload
      setProducts(oldProducts);
      toast.error(err.message || "Gagal hapus produk");
    } finally {
      removeBusy(p.id);
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
            className="border rounded-xl px-4 py-2 text-sm w-64 focus:outline-none focus:ring-2 focus:ring-[#0FA3A8]"
          />

          <select
            value={status}
            onChange={(e) => setStatus(e.target.value as any)}
            className="border rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#0FA3A8]"
          >
            <option value="ALL">Semua Status</option>
            <option value="YES">Aktif</option>
            <option value="NO">Nonaktif</option>
          </select>

          <select
            value={sort}
            onChange={(e) => setSort(e.target.value as any)}
            className="border rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#0FA3A8]"
          >
            <option value="nama">Sort: Nama</option>
            <option value="harga">Sort: Harga</option>
            <option value="stok">Sort: Stok</option>
          </select>

          <button
            onClick={() => setDir(dir === "asc" ? "desc" : "asc")}
            className="border rounded-xl px-3 py-2 text-sm hover:bg-gray-50 transition"
          >
            {dir === "asc" ? "⬆️ Asc" : "⬇️ Desc"}
          </button>
        </div>

        <button
          onClick={openAdd}
          className="bg-[#0FA3A8] text-white px-5 py-2 rounded-xl text-sm font-semibold hover:bg-[#0D8B8F] transition"
        >
          + Tambah Produk
        </button>
      </div>

      {/* Table */}
      <div className="rounded-2xl border bg-white overflow-hidden shadow-sm">
        {loading ? (
          <div className="p-6 text-sm text-gray-400 flex items-center justify-center gap-2">
            <div className="w-4 h-4 border-2 border-[#0FA3A8] border-t-transparent rounded-full animate-spin" />
            Memuat produk...
          </div>
        ) : filtered.length === 0 ? (
          <div className="p-6 text-sm text-gray-400 text-center">
            {q || status !== "ALL" 
              ? "Produk tidak ditemukan dengan filter ini" 
              : "Belum ada produk. Klik 'Tambah Produk' untuk mulai."}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 text-gray-600 border-b">
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
                  <tr key={p.id} className="border-t hover:bg-gray-50/50 transition">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        {p.thumbnail ? (
                          <img
                            src={p.thumbnail}
                            alt={p.nama}
                            className="w-10 h-10 rounded-lg object-cover border"
                            onError={(e) => {
                              (e.target as HTMLImageElement).style.display = "none";
                            }}
                          />
                        ) : (
                          <div className="w-10 h-10 rounded-lg bg-gray-100 flex items-center justify-center text-xs text-gray-400">
                            📷
                          </div>
                        )}

                        <div>
                          <div className="font-medium text-gray-800">{p.nama}</div>
                          {p.kategori && (
                            <div className="text-xs text-gray-400">
                              {p.kategori}
                            </div>
                          )}
                        </div>
                      </div>
                    </td>

                    <td className="text-center font-semibold text-gray-700">
                      {rupiah(p.harga)}
                    </td>

                    <td className="text-center">
                      {editingStock === p.id ? (
                        <input
                          type="number"
                          className="border rounded-lg px-2 py-1 w-20 text-center focus:outline-none focus:ring-2 focus:ring-[#0FA3A8]"
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
                          className="cursor-pointer hover:text-[#0FA3A8] hover:underline transition"
                          title="Klik untuk edit stok"
                        >
                          {p.stok}
                        </span>
                      )}
                     </td>

                    <td className="text-center">
                      <button
                        onClick={() => toggleStatus(p)}
                        disabled={isBusy(p.id)}
                        className={`cursor-pointer text-xs px-2 py-1 rounded-full transition ${
                          p.aktif === "YES"
                            ? "bg-green-100 text-green-700 hover:bg-green-200"
                            : "bg-gray-200 text-gray-500 hover:bg-gray-300"
                        } disabled:opacity-50 disabled:cursor-not-allowed`}
                      >
                        {p.aktif === "YES" ? "Aktif" : "Nonaktif"}
                      </button>
                    </td>

                    <td className="px-4 py-3">
                      <div className="flex justify-end gap-3">
                        <button
                          onClick={() => openEdit(p)}
                          disabled={isBusy(p.id)}
                          className="text-xs font-semibold text-[#0FA3A8] hover:underline transition disabled:opacity-50"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => remove(p)}
                          disabled={isBusy(p.id)}
                          className="text-xs font-semibold text-red-500 hover:text-red-700 transition disabled:opacity-50"
                        >
                          Hapus
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
        
        {/* Info jumlah produk */}
        {!loading && filtered.length > 0 && (
          <div className="px-4 py-3 border-t bg-gray-50 text-xs text-gray-500">
            Menampilkan {filtered.length} dari {products.length} produk
          </div>
        )}
      </div>

      {/* Modal Add/Edit Product */}
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
