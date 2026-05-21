"use client";

import { useEffect, useState, useRef } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { X, Upload, Image as ImageIcon } from "lucide-react";

const productSchema = z.object({
  nama: z.string().min(1, "Nama produk wajib diisi").max(100, "Nama maksimal 100 karakter"),
  slug: z.string().optional(),
  kategori: z.string().optional(),
  harga: z.number().min(1, "Harga harus lebih dari 0").max(999999999, "Harga terlalu besar"),
  stok: z.number().min(0, "Stok tidak boleh negatif").max(999999, "Stok terlalu besar"),
  aktif: z.enum(["YES", "NO"]),
  thumbnail: z.string().url("URL tidak valid").optional().or(z.literal("")),
  slogan: z.string().optional(),
  ingredients: z.string().optional(),
  benefits: z.string().optional(),
  goodFor: z.string().optional(),
  consumeTime: z.string().optional(),
  desc: z.string().optional(),
});

type ProductFormData = z.infer<typeof productSchema>;

type Product = {
  id: string;
  nama: string;
  kategori?: string;
  harga: number;
  stok: number;
  aktif: "YES" | "NO";
  thumbnail?: string;
  slogan?: string;
  ingredients?: string[];
  benefits?: string[];
  goodFor?: string[];
  consumeTime?: string;
  desc?: string;
};

function generateSlug(nama: string): string {
  return nama
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");
}

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
  const [uploading, setUploading] = useState(false);
  const modalRef = useRef<HTMLDivElement>(null);
  const [slugManuallyEdited, setSlugManuallyEdited] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors, isSubmitting, isDirty },
  } = useForm<ProductFormData>({
    resolver: zodResolver(productSchema),
    defaultValues: {
      nama: "",
      slug: "",
      kategori: "",
      harga: 0,
      stok: 0,
      aktif: "YES",
      thumbnail: "",
      slogan: "",
      ingredients: "",
      benefits: "",
      goodFor: "",
      consumeTime: "",
      desc: "",
    },
  });

  const thumbnailUrl = watch("thumbnail");
  const namaValue = watch("nama");

  useEffect(() => {
    if (mode === "add" && !slugManuallyEdited && namaValue) {
      const newSlug = generateSlug(namaValue);
      setValue("slug", newSlug);
    }
  }, [namaValue, slugManuallyEdited, mode, setValue]);

  useEffect(() => {
    if (!open) {
      reset({
        nama: "",
        slug: "",
        kategori: "",
        harga: 0,
        stok: 0,
        aktif: "YES",
        thumbnail: "",
        slogan: "",
        ingredients: "",
        benefits: "",
        goodFor: "",
        consumeTime: "",
        desc: "",
      });
      setSlugManuallyEdited(false);
    }
  }, [open, reset]);

  useEffect(() => {
    if (mode === "edit" && initialData && open) {
      reset({
        nama: initialData.nama || "",
        slug: initialData.id || generateSlug(initialData.nama),
        kategori: initialData.kategori || "",
        harga: initialData.harga || 0,
        stok: initialData.stok || 0,
        aktif: initialData.aktif || "YES",
        thumbnail: initialData.thumbnail || "",
        slogan: initialData.slogan || "",
        ingredients: initialData.ingredients?.join(", ") || "",
        benefits: initialData.benefits?.join(", ") || "",
        goodFor: initialData.goodFor?.join(", ") || "",
        consumeTime: initialData.consumeTime || "",
        desc: initialData.desc || "",
      });
      setSlugManuallyEdited(true);
    }
  }, [mode, initialData, open, reset]);

  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === "Escape" && open && !isSubmitting) {
        onClose();
      }
    };
    document.addEventListener("keydown", handleEsc);
    return () => document.removeEventListener("keydown", handleEsc);
  }, [open, isSubmitting, onClose]);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (modalRef.current && !modalRef.current.contains(e.target as Node) && !isSubmitting) {
        onClose();
      }
    };
    if (open) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [open, isSubmitting, onClose]);

  async function uploadImage(file: File) {
    setUploading(true);
    const fd = new FormData();
    fd.append("file", file);

    try {
      const res = await fetch("/api/dashboard/upload-image", {
        method: "POST",
        body: fd,
      });
      const json = await res.json();
      if (!json.success) throw new Error(json.message || "Upload gagal");
      setValue("thumbnail", json.url);
      toast.success("Gambar berhasil diupload");
    } catch (err: any) {
      toast.error(err.message || "Gagal upload gambar");
    } finally {
      setUploading(false);
    }
  }

  const onSubmit = async (data: ProductFormData) => {
    try {
      const payload = {
        nama: data.nama,
        slug: data.slug || generateSlug(data.nama),
        kategori: data.kategori || undefined,
        harga: data.harga,
        stok: data.stok,
        aktif: data.aktif,
        thumbnail: data.thumbnail || "",
        slogan: data.slogan || "",
        ingredients: data.ingredients ? data.ingredients.split(",").map(s => s.trim()).filter(Boolean) : [],
        benefits: data.benefits ? data.benefits.split(",").map(s => s.trim()).filter(Boolean) : [],
        goodFor: data.goodFor ? data.goodFor.split(",").map(s => s.trim()).filter(Boolean) : [],
        consumeTime: data.consumeTime || "",
        desc: data.desc || "",
      };

      if (mode === "add") {
        const res = await fetch("/api/dashboard/products", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
        const json = await res.json();
        if (!json.success) throw new Error(json.message || "Gagal tambah produk");
        toast.success("Produk berhasil ditambahkan");
      } else {
        if (!initialData?.id) throw new Error("ID produk tidak ditemukan");
        const res = await fetch(`/api/dashboard/products/${initialData.id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
        const json = await res.json();
        if (!json.success) throw new Error(json.message || "Gagal update produk");
        toast.success("Produk berhasil diupdate");
      }

      await onSuccess();
      onClose();
    } catch (err: any) {
      toast.error(err.message || "Terjadi kesalahan");
    }
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
      <div
        ref={modalRef}
        className="bg-white w-full max-w-md rounded-2xl shadow-xl overflow-hidden max-h-[90vh] flex flex-col animate-in fade-in zoom-in duration-200"
      >
        <div className="px-6 py-4 border-b bg-gray-50 flex justify-between items-center flex-shrink-0">
          <div>
            <h2 className="text-lg font-semibold text-gray-800">
              {mode === "add" ? "Tambah Produk" : "Edit Produk"}
            </h2>
            <p className="text-xs text-gray-500 mt-0.5">
              {mode === "add" ? "Isi data produk baru" : "Ubah data produk"}
            </p>
          </div>
          <button onClick={onClose} className="p-1 rounded-lg hover:bg-gray-200 transition" disabled={isSubmitting}>
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="flex-1 overflow-y-auto">
          <div className="p-6 space-y-4">
            {/* IMAGE UPLOAD */}
            <div className="space-y-2">
              {thumbnailUrl ? (
                <div className="relative">
                  <img src={thumbnailUrl} alt="Preview" className="w-full h-40 object-cover rounded-xl border" onError={(e) => { (e.target as HTMLImageElement).src = "https://placehold.co/400x200?text=Invalid+URL"; }} />
                  <button type="button" onClick={() => setValue("thumbnail", "")} className="absolute top-2 right-2 p-1 bg-black/50 rounded-full hover:bg-black/70 transition"><X className="w-4 h-4 text-white" /></button>
                </div>
              ) : (
                <div className="w-full h-40 rounded-xl border-2 border-dashed border-gray-200 flex flex-col items-center justify-center gap-2 text-gray-400">
                  <ImageIcon className="w-8 h-8" />
                  <p className="text-xs">Belum ada gambar</p>
                </div>
              )}
              <div className="flex gap-2">
                <label className="flex-1 cursor-pointer">
                  <input type="file" accept="image/*" className="hidden" onChange={(e) => e.target.files && uploadImage(e.target.files[0])} disabled={uploading} />
                  <span className={`flex items-center justify-center gap-2 w-full px-4 py-2 rounded-xl text-sm font-semibold border transition ${uploading ? "bg-gray-100 text-gray-400 cursor-not-allowed" : "bg-white text-[#0FA3A8] border-[#0FA3A8] hover:bg-[#F7FBFB]"}`}>
                    {uploading ? <><div className="w-4 h-4 border-2 border-gray-400 border-t-transparent rounded-full animate-spin" /> Uploading...</> : <><Upload className="w-4 h-4" /> Upload Gambar</>}
                  </span>
                </label>
                <input {...register("thumbnail")} placeholder="Atau URL gambar" className="flex-1 border rounded-xl px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#0FA3A8]" disabled={uploading} />
              </div>
              {errors.thumbnail && <p className="text-xs text-red-500">{errors.thumbnail.message}</p>}
            </div>

            {/* Nama Produk */}
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Nama Produk <span className="text-red-500">*</span></label>
              <input {...register("nama")} placeholder="Contoh: Red Vitality" className={`w-full border rounded-xl px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-[#0FA3A8] ${errors.nama ? "border-red-500" : "border-gray-200"}`} disabled={isSubmitting} autoFocus />
              {errors.nama && <p className="text-xs text-red-500 mt-1">{errors.nama.message}</p>}
            </div>

            <input type="hidden" {...register("slug")} />

            {/* Kategori */}
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Kategori</label>
              <input {...register("kategori")} placeholder="Contoh: Juice, Paket, Detox" className="w-full border border-gray-200 rounded-xl px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-[#0FA3A8]" disabled={isSubmitting} />
            </div>

            {/* Harga & Stok */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Harga <span className="text-red-500">*</span></label>
                <input type="number" {...register("harga", { valueAsNumber: true })} placeholder="Harga" className={`w-full border rounded-xl px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-[#0FA3A8] ${errors.harga ? "border-red-500" : "border-gray-200"}`} disabled={isSubmitting} />
                {errors.harga && <p className="text-xs text-red-500 mt-1">{errors.harga.message}</p>}
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Stok</label>
                <input type="number" {...register("stok", { valueAsNumber: true })} placeholder="Stok" className={`w-full border rounded-xl px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-[#0FA3A8] ${errors.stok ? "border-red-500" : "border-gray-200"}`} disabled={isSubmitting} />
                {errors.stok && <p className="text-xs text-red-500 mt-1">{errors.stok.message}</p>}
              </div>
            </div>

            {/* 🔥 FIELD BARU: Slogan */}
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Slogan</label>
              <input {...register("slogan")} placeholder="Contoh: Clean Your Body, Boost Your Day." className="w-full border border-gray-200 rounded-xl px-4 py-2.5" disabled={isSubmitting} />
            </div>

            {/* 🔥 FIELD BARU: Ingredients */}
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Ingredients (pisah dengan koma)</label>
              <input {...register("ingredients")} placeholder="Contoh: Kunyit, Wortel, Jahe, Jeruk, Lemon" className="w-full border border-gray-200 rounded-xl px-4 py-2.5" disabled={isSubmitting} />
            </div>

            {/* 🔥 FIELD BARU: Benefits */}
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Manfaat (pisah dengan koma)</label>
              <input {...register("benefits")} placeholder="Contoh: Detoks, Metabolisme, Imunitas" className="w-full border border-gray-200 rounded-xl px-4 py-2.5" disabled={isSubmitting} />
            </div>

            {/* 🔥 FIELD BARU: Good For */}
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Cocok untuk (pisah dengan koma)</label>
              <input {...register("goodFor")} placeholder="Contoh: Program detoks, Pola hidup sehat" className="w-full border border-gray-200 rounded-xl px-4 py-2.5" disabled={isSubmitting} />
            </div>

            {/* 🔥 FIELD BARU: Consume Time */}
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Waktu konsumsi terbaik</label>
              <input {...register("consumeTime")} placeholder="Contoh: Pagi hari atau sore hari" className="w-full border border-gray-200 rounded-xl px-4 py-2.5" disabled={isSubmitting} />
            </div>

            {/* 🔥 FIELD BARU: Deskripsi */}
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Deskripsi</label>
              <textarea {...register("desc")} rows={3} placeholder="Deskripsi lengkap produk..." className="w-full border border-gray-200 rounded-xl px-4 py-2.5" disabled={isSubmitting} />
            </div>

            {/* Status Aktif */}
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Status</label>
              <div className="flex gap-4">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="radio" value="YES" {...register("aktif")} disabled={isSubmitting} className="w-4 h-4 text-[#0FA3A8] accent-[#0FA3A8]" />
                  <span className="text-sm">Aktif</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="radio" value="NO" {...register("aktif")} disabled={isSubmitting} className="w-4 h-4 text-red-500" />
                  <span className="text-sm">Nonaktif</span>
                </label>
              </div>
            </div>
          </div>

          <div className="px-6 py-4 border-t bg-gray-50 flex justify-end gap-3 flex-shrink-0">
            <button type="button" onClick={onClose} disabled={isSubmitting} className="px-5 py-2 text-sm font-medium text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-xl transition disabled:opacity-50">Batal</button>
            <button type="submit" disabled={isSubmitting || (mode === "edit" && !isDirty)} className="bg-[#0FA3A8] hover:bg-[#0D8B8F] text-white px-5 py-2 rounded-xl text-sm font-semibold transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2">
              {isSubmitting ? <><div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> Menyimpan...</> : (mode === "add" ? "Tambah Produk" : "Simpan Perubahan")}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
