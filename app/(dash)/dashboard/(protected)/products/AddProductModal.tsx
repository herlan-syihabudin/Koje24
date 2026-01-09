"use client";

import { useState } from "react";

type Props = {
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
};

export default function AddProductModal({ open, onClose, onSuccess }: Props) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [form, setForm] = useState({
    nama: "",
    kategori: "",
    harga: "",
    stok: "",
    aktif: "YES",
    thumbnail: "",
  });

  if (!open) return null;

  function resetForm() {
    setForm({
      nama: "",
      kategori: "",
      harga: "",
      stok: "",
      aktif: "YES",
      thumbnail: "",
    });
    setError(null);
  }

  async function submit() {
    if (!form.nama.trim()) {
      setError("Nama produk wajib diisi");
      return;
    }

    setLoading(true);
    setError(null);

    try {
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

      if (!json.success) {
        setError(json.message || "Gagal tambah produk");
        setLoading(false);
        return;
      }

      onSuccess();
      resetForm();
      onClose();
    } catch (e) {
      setError("Terjadi kesalahan jaringan");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
      <div
        className="bg-white w-full max-w-md rounded-2xl p-6 space-y-4"
        onKeyDown={(e) => e.key === "Enter" && submit()}
      >
        <h2 className="text-lg font-semibold">Tambah Produk</h2>

        {error && (
          <div className="bg-red-50 text-red-600 text-sm px-4 py-2 rounded-xl">
            {error}
          </div>
        )}

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
          <button
            onClick={() => {
              if (!loading) {
                resetForm();
                onClose();
              }
            }}
            disabled={loading}
            className="text-sm text-gray-500"
          >
            Batal
          </button>

          <button
            onClick={submit}
            disabled={loading}
            className="bg-[#0FA3A8] text-white px-5 py-2 rounded-xl text-sm font-semibold disabled:opacity-60"
          >
            {loading ? "Menyimpan..." : "Simpan"}
          </button>
        </div>
      </div>
    </div>
  );
}
