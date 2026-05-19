"use client";

import { useEffect, useState, useRef, useCallback } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";

// ========== ZOD SCHEMA ==========
const productSchema = z.object({
  id: z.string().optional(),
  nama: z.string().min(1, "Nama produk wajib diisi").max(100, "Nama maksimal 100 karakter"),
  kategori: z.string().min(1, "Kategori wajib dipilih"),
  harga: z.number().min(1, "Harga harus lebih dari 0").max(999999999, "Harga terlalu besar"),
  stok: z.number().min(0, "Stok tidak boleh negatif").max(999999, "Stok terlalu besar"),
  aktif: z.enum(["YES", "NO"]),
  thumbnail: z.string().url("URL tidak valid").optional().or(z.literal("")),
});

type ProductFormData = z.infer<typeof productSchema>;

type Product = {
  id?: string;
  nama: string;
  kategori: string;
  harga: number;
  stok: number;
  aktif: "YES" | "NO";
  thumbnail?: string;
};

const initialForm: ProductFormData = {
  nama: "",
  kategori: "",
  harga: 0,
  stok: 0,
  aktif: "YES",
  thumbnail: "",
};

// ========== ABORT CONTROLLER HOOK ==========
function useAbortController() {
  const controllerRef = useRef<AbortController | null>(null);

  const getSignal = useCallback(() => {
    if (controllerRef.current) {
      controllerRef.current.abort();
    }
    controllerRef.current = new AbortController();
    return controllerRef.current.signal;
  }, []);

  const abort = useCallback(() => {
    if (controllerRef.current) {
      controllerRef.current.abort();
      controllerRef.current = null;
    }
  }, []);

  useEffect(() => {
    return () => abort();
  }, [abort]);

  return { getSignal, abort };
}

// ========== MAIN COMPONENT ==========
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
  const [isLoading, setIsLoading] = useState(false);
  const [thumbnailPreview, setThumbnailPreview] = useState<string>("");
  const modalRef = useRef<HTMLDivElement>(null);
  const { getSignal, abort } = useAbortController();

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors, isDirty, isValid },
  } = useForm<ProductFormData>({
    resolver: zodResolver(productSchema),
    defaultValues: initialForm,
    mode: "onChange",
  });

  const thumbnailUrl = watch("thumbnail");

  // Preview thumbnail
  useEffect(() => {
    if (thumbnailUrl && thumbnailUrl.match(/^https?:\/\/.+/)) {
      setThumbnailPreview(thumbnailUrl);
    } else {
      setThumbnailPreview("");
    }
  }, [thumbnailUrl]);

  // Reset form saat modal dibuka/ditutup
  useEffect(() => {
    if (!open) {
      reset(initialForm);
      setThumbnailPreview("");
      abort();
    }
  }, [open, reset, abort]);

  // Isi data saat EDIT
  useEffect(() => {
    if (mode === "edit" && initialData && open) {
      reset({
        id: initialData.id,
        nama: initialData.nama,
        kategori: initialData.kategori,
        harga: initialData.harga,
        stok: initialData.stok,
        aktif: initialData.aktif,
        thumbnail: initialData.thumbnail || "",
      });
      if (initialData.thumbnail) {
        setThumbnailPreview(initialData.thumbnail);
      }
    }
  }, [mode, initialData, open, reset]);

  // Close on ESC
  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === "Escape" && open && !isLoading) {
        onClose();
      }
    };
    document.addEventListener("keydown", handleEsc);
    return () => document.removeEventListener("keydown", handleEsc);
  }, [open, isLoading, onClose]);

  // Close on click outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (modalRef.current && !modalRef.current.contains(e.target as Node) && !isLoading) {
        onClose();
      }
    };
    if (open) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [open, isLoading, onClose]);

  // Prevent body scroll when modal open
  useEffect(() => {
    if (open) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  const onSubmit = async (data: ProductFormData) => {
    setIsLoading(true);
    const signal = getSignal();

    try {
      const url =
        mode === "add"
          ? "/api/dashboard/products"
          : `/api/dashboard/products/${data.id}`;

      const res = await fetch(url, {
        method: mode === "add" ? "POST" : "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
        signal,
      });

      const json = await res.json();

      if (!res.ok || !json.success) {
        throw new Error(json.message || "Gagal menyimpan produk");
      }

      toast.success(`Produk berhasil ${mode === "add" ? "ditambahkan" : "diupdate"}`, {
        duration: 3000,
        icon: "✅",
      });

      onSuccess();
      onClose();
    } catch (error: any) {
      if (error.name === "AbortError") {
        console.log("Request cancelled");
        return;
      }
      toast.error(error.message || "Terjadi kesalahan jaringan", {
        duration: 4000,
        icon: "❌",
      });
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
      <div
        ref={modalRef}
        className="bg-white w-full max-w-md rounded-2xl shadow-xl overflow-hidden animate-in fade-in zoom-in duration-200 max-h-[90vh] flex flex-col"
      >
        {/* HEADER */}
        <div className="px-6 py-4 border-b bg-gray-50 flex-shrink-0">
          <h2 className="text-lg font-semibold text-gray-800">
            {mode === "add" ? "Tambah Produk Baru" : "Edit Produk"}
          </h2>
          <p className="text-xs text-gray-500 mt-0.5">
            {mode === "add" ? "Isi data produk di bawah ini" : "Ubah data produk"}
          </p>
        </div>

        {/* FORM - Scrollable */}
        <form onSubmit={handleSubmit(onSubmit)} className="flex-1 overflow-y-auto">
          <div className="p-6 space-y-4">
            {/* Nama Produk */}
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">
                Nama Produk <span className="text-red-500">*</span>
              </label>
              <input
                {...register("nama")}
                placeholder="Contoh: Red Vitality"
                className={`border rounded-xl px-4 py-2.5 w-full focus:outline-none focus:ring-2 focus:ring-[#0FA3A8] focus:border-transparent ${
                  errors.nama ? "border-red-500" : "border-gray-200"
                }`}
                disabled={isLoading}
                autoFocus
              />
              {errors.nama && (
                <p className="text-xs text-red-500 mt-1">{errors.nama.message}</p>
              )}
            </div>

            {/* Kategori */}
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">
                Kategori <span className="text-red-500">*</span>
              </label>
              <select
                {...register("kategori")}
                className={`border rounded-xl px-4 py-2.5 w-full focus:outline-none focus:ring-2 focus:ring-[#0FA3A8] bg-white ${
                  errors.kategori ? "border-red-500" : "border-gray-200"
                }`}
                disabled={isLoading}
              >
                <option value="">Pilih kategori</option>
                <option value="Juice">🥤 Juice</option>
                <option value="Paket">📦 Paket</option>
                <option value="Detox">🌿 Detox</option>
              </select>
              {errors.kategori && (
                <p className="text-xs text-red-500 mt-1">{errors.kategori.message}</p>
              )}
            </div>

            {/* Harga & Stok */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">
                  Harga <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  {...register("harga", { valueAsNumber: true })}
                  placeholder="Harga"
                  className={`border rounded-xl px-4 py-2.5 w-full focus:outline-none focus:ring-2 focus:ring-[#0FA3A8] ${
                    errors.harga ? "border-red-500" : "border-gray-200"
                  }`}
                  disabled={isLoading}
                />
                {errors.harga && (
                  <p className="text-xs text-red-500 mt-1">{errors.harga.message}</p>
                )}
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">
                  Stok
                </label>
                <input
                  type="number"
                  {...register("stok", { valueAsNumber: true })}
                  placeholder="Stok"
                  className={`border rounded-xl px-4 py-2.5 w-full focus:outline-none focus:ring-2 focus:ring-[#0FA3A8] ${
                    errors.stok ? "border-red-500" : "border-gray-200"
                  }`}
                  disabled={isLoading}
                />
                {errors.stok && (
                  <p className="text-xs text-red-500 mt-1">{errors.stok.message}</p>
                )}
              </div>
            </div>

            {/* Thumbnail URL */}
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">
                Thumbnail URL (opsional)
              </label>
              <input
                {...register("thumbnail")}
                placeholder="https://.../gambar.jpg"
                className={`border rounded-xl px-4 py-2.5 w-full focus:outline-none focus:ring-2 focus:ring-[#0FA3A8] ${
                  errors.thumbnail ? "border-red-500" : "border-gray-200"
                }`}
                disabled={isLoading}
              />
              {errors.thumbnail && (
                <p className="text-xs text-red-500 mt-1">{errors.thumbnail.message}</p>
              )}
              
              {/* Preview thumbnail */}
              {thumbnailPreview && (
                <div className="mt-2">
                  <img
                    src={thumbnailPreview}
                    alt="Preview"
                    className="w-16 h-16 object-cover rounded-lg border"
                    onError={(e) => {
                      (e.target as HTMLImageElement).style.display = "none";
                      toast.error("Gambar tidak dapat dimuat", { duration: 2000 });
                    }}
                  />
                </div>
              )}
            </div>

            {/* Status Aktif */}
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">
                Status
              </label>
              <div className="flex gap-4">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    value="YES"
                    {...register("aktif")}
                    disabled={isLoading}
                    className="w-4 h-4 text-[#0FA3A8] accent-[#0FA3A8]"
                  />
                  <span className="text-sm">Aktif</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    value="NO"
                    {...register("aktif")}
                    disabled={isLoading}
                    className="w-4 h-4 text-red-500"
                  />
                  <span className="text-sm">Nonaktif</span>
                </label>
              </div>
            </div>
          </div>

          {/* FOOTER */}
          <div className="px-6 py-4 border-t bg-gray-50 flex justify-end gap-3 flex-shrink-0">
            <button
              type="button"
              onClick={onClose}
              disabled={isLoading}
              className="px-5 py-2 text-sm font-medium text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-xl transition disabled:opacity-50"
            >
              Batal
            </button>
            <button
              type="submit"
              disabled={isLoading || !isDirty || !isValid}
              className="bg-[#0FA3A8] hover:bg-[#0D8B8F] text-white px-5 py-2 rounded-xl text-sm font-semibold transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              {isLoading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Menyimpan...
                </>
              ) : (
                mode === "add" ? "Tambah Produk" : "Simpan Perubahan"
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
