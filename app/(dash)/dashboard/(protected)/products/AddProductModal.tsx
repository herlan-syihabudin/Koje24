"use client";

import { useEffect, useMemo, useState } from "react";

type Product = {
  id: string;
  nama: string;
  kategori?: string;
  harga: number;
  stok: number;
  aktif: "YES" | "NO";
  thumbnail?: string;
};

export default function AddProductModal({
  open,
  mode,
  initialData,
  onClose,
  onSuccess,
}: {
  open: boolean;
  mode: "add" | "edit";
  initialData: Product | null;
  onClose: () => void;
  onSuccess: () => void | Promise<void>;
}) {
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);

  const emptyForm = useMemo(
    () => ({
      nama: "",
      kategori: "",
      harga: "",
      stok: "",
      aktif: "YES" as "YES" | "NO",
      thumbnail: "",
    }),
    []
  );

  const [form, setForm] = useState(emptyForm);

  useEffect(() => {
    if (!open) return;

    if (mode === "edit" && initialData) {
      setForm({
        nama: initialData.nama || "",
        kategori: initialData.kategori || "",
        harga: String(initialData.harga ?? ""),
        stok: String(initialData.stok ?? ""),
        aktif: initialData.aktif || "YES",
        thumbnail: initialData.thumbnail || "",
      });
    } else {
      setForm(emptyForm);
    }
  }, [open, mode, initialData, emptyForm]);

  if (!open) return null;

  /* =====================
     UPLOAD IMAGE
  ===================== */
  async function uploadImage(file: File) {
    setUploading(true);

    const fd = new FormData();
    fd.append("file", file);

    const res = await fetch("/api/dashboard/upload-image", {
      method: "POST",
      body: fd,
    });

    const json = await res.json();
    setUploading(false);

    if (!json.success) {
      alert(json.message || "Upload gagal");
      return;
    }

    setForm((f) => ({ ...f, thumbnail: json.url }));
  }

  /* =====================
     SUBMIT
  ===================== */
  async function submit() {
    if (!form.nama.trim()) {
      alert("Nama produk wajib diisi");
      return;
    }

    setLoading(true);

    try {
      const payload = {
        ...form,
        harga: Number(form.harga || 0),
        stok: Number(form.stok || 0),
      };

      if (mode === "add") {
        const res = await fetch("/api/dashboard/products", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });

        const json = await res.json();
        if (!json.success) {
          alert(json.message || "Gagal tambah produk");
          return;
        }
      }

      if (mode === "edit") {
        if (!initialData?.id) {
          alert("ID produk tidak ditemukan");
          return;
        }

        const res = await fetch(
          `/api/dashboard/products/${initialData.id}`,
          {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload),
          }
        );

        const json = await res.json();
        if (!json.success) {
          alert(json.message || "Gagal update produk");
          return;
        }
      }

      await onSuccess();
      onClose();
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
      <div className="bg-white w-full max-w-md rounded-2xl p-6 space-y-4">
        <h2 className="text-lg font-semibold">
          {mode === "add" ? "Tambah Produk" : "Edit Produk"}
        </h2>

        {/* IMAGE UPLOAD */}
        <div className="space-y-2">
          {form.thumbnail ? (
            <img
              src={form.thumbnail}
              className="w-full h-40 object-cover rounded-xl border"
            />
          ) : (
            <div className="w-full h-40 rounded-xl border border-dashed flex items-center justify-center text-sm text-gray-400">
              Belum ada gambar
            </div>
          )}

          <label className="block">
            <input
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(e) =>
                e.target.files && uploadImage(e.target.files[0])
              }
            />
            <span className="inline-block cursor-pointer text-sm text-[#0FA3A8] font-semibold">
              {uploading ? "Uploading..." : "Upload Gambar"}
            </span>
          </label>
        </div>

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

        <select
          className="border rounded-xl px-4 py-2 w-full"
          value={form.aktif}
          onChange={(e) =>
            setForm({ ...form, aktif: e.target.value as "YES" | "NO" })
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
            disabled={loading || uploading}
            className="bg-[#0FA3A8] text-white px-5 py-2 rounded-xl text-sm font-semibold"
          >
            {loading ? "Menyimpan..." : "Simpan"}
          </button>
        </div>
      </div>
    </div>
  );
}
