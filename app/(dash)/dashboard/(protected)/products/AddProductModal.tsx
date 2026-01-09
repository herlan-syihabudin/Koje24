"use client";

import { useState } from "react";

export default function AddProductModal({
  open,
  onClose,
  onSuccess,
}: {
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
}) {
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    nama: "",
    kategori: "",
    harga: "",
    stok: "",
    aktif: "YES",
    thumbnail: "",
  });

  if (!open) return null;

  async function submit() {
    if (!form.nama) {
      alert("Nama produk wajib diisi");
      return;
    }

    setLoading(true);
    const res = await fetch("/api/dashboard/products", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        ...form,
        harga: Number(form.harga || 0),
        stok: Number(form.stok || 0),
      }),
    });

    const json = await res.json();
    setLoading(false);

    if (!json.success) {
      alert(json.message || "Gagal tambah produk");
      return;
    }

    onSuccess();
    onClose();
  }

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
      <div className="bg-white w-full max-w-md rounded-2xl p-6 space-y-4">
        <h2 className="text-lg font-semibold">Tambah Produk</h2>

        <input
          placeholder="Nama produk"
          className="border rounded-xl px-4 py-2 w-full"
          value={form.nama}
          onChange={(e) => setForm({ ...form, nama: e.target.value })}
        />

        <input
          placeholder="Kategori"
          className="border rounded-xl px-4 py-2 w-full"
          value={form.kategori}
          onChange={(e) => setForm({ ...form, kategori: e.target.value })}
        />

        <input
          placeholder="Harga"
          type="number"
          className="border rounded-xl px-4 py-2 w-full"
          value={form.harga}
          onChange={(e) => setForm({ ...form, harga: e.target.value })}
        />

        <input
          placeholder="Stok"
          type="number"
          className="border rounded-xl px-4 py-2 w-full"
          value={form.stok}
          onChange={(e) => setForm({ ...form, stok: e.target.value })}
        />

        <input
          placeholder="Thumbnail URL"
          className="border rounded-xl px-4 py-2 w-full"
          value={form.thumbnail}
          onChange={(e) => setForm({ ...form, thumbnail: e.target.value })}
        />

        <select
          className="border rounded-xl px-4 py-2 w-full"
          value={form.aktif}
          onChange={(e) => setForm({ ...form, aktif: e.target.value })}
        >
          <option value="YES">Aktif</option>
          <option value="NO">Nonaktif</option>
        </select>

        <div className="flex justify-end gap-3 pt-4">
          <button onClick={onClose} className="text-sm">
            Batal
          </button>
          <button
            onClick={submit}
            disabled={loading}
            className="bg-[#0FA3A8] text-white px-5 py-2 rounded-xl text-sm font-semibold"
          >
            {loading ? "Menyimpan..." : "Simpan"}
          </button>
        </div>
      </div>
    </div>
  );
}
