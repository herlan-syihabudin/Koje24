"use client";

import { useEffect, useState } from "react";

type Product = {
  id?: string;
  nama: string;
  kategori: string;
  harga: number;
  stok: number;
  aktif: "YES" | "NO";
  thumbnail?: string;
};

export default function ProductFormModal({
  open,
  mode,
  initialData,
  onClose,
  onSuccess,
}: {
  open: boolean;
  mode: "add" | "edit";
  initialData?: Product | null;
  onClose: () => void;
  onSuccess: () => void;
}) {
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState<Product>({
    nama: "",
    kategori: "",
    harga: 0,
    stok: 0,
    aktif: "YES",
    thumbnail: "",
  });

  // 🔁 isi data saat EDIT
  useEffect(() => {
    if (mode === "edit" && initialData) {
      setForm(initialData);
    }
  }, [mode, initialData]);

  if (!open) return null;

  async function submit() {
    if (!form.nama) {
      alert("Nama produk wajib diisi");
      return;
    }
    if (form.harga <= 0) {
      alert("Harga harus lebih dari 0");
      return;
    }

    setLoading(true);

    const res = await fetch(
      mode === "add"
        ? "/api/dashboard/products"
        : `/api/dashboard/products/${form.id}`,
      {
        method: mode === "add" ? "POST" : "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      }
    );

    const json = await res.json();
    setLoading(false);

    if (!json.success) {
      alert(json.message || "Gagal menyimpan produk");
      return;
    }

    onSuccess();
    onClose();
  }

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
      <div className="bg-white w-full max-w-md rounded-2xl p-6 space-y-4">
        <h2 className="text-lg font-semibold">
          {mode === "add" ? "Tambah Produk" : "Edit Produk"}
        </h2>

        <input
          placeholder="Nama produk"
          className="border rounded-xl px-4 py-2 w-full"
          value={form.nama}
          onChange={(e) => setForm({ ...form, nama: e.target.value })}
        />

        <select
          className="border rounded-xl px-4 py-2 w-full"
          value={form.kategori}
          onChange={(e) => setForm({ ...form, kategori: e.target.value })}
        >
          <option value="">Pilih kategori</option>
          <option value="Juice">Juice</option>
          <option value="Paket">Paket</option>
          <option value="Detox">Detox</option>
        </select>

        <input
          type="number"
          placeholder="Harga"
          className="border rounded-xl px-4 py-2 w-full"
          value={form.harga}
          onChange={(e) =>
            setForm({ ...form, harga: Number(e.target.value) })
          }
        />

        <input
          type="number"
          placeholder="Stok"
          className="border rounded-xl px-4 py-2 w-full"
          value={form.stok}
          onChange={(e) =>
            setForm({ ...form, stok: Number(e.target.value) })
          }
        />

        <input
          placeholder="Thumbnail URL (opsional)"
          className="border rounded-xl px-4 py-2 w-full"
          value={form.thumbnail || ""}
          onChange={(e) =>
            setForm({ ...form, thumbnail: e.target.value })
          }
        />

        <select
          className="border rounded-xl px-4 py-2 w-full"
          value={form.aktif}
          onChange={(e) =>
            setForm({ ...form, aktif: e.target.value as any })
          }
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
