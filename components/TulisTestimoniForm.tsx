"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { Star, X } from "lucide-react";
import { updateRating } from "@/lib/bestSeller";

type Props = { onSuccess?: () => void };

// VARIAN → PRODUCT ID MAPPING
const VARIAN_ID_MAP: Record<string, number> = {
  "Golden Detox": 1,
  "Yellow Immunity": 2,
  "Green Revive": 3,
  "Sunrise Boost": 4,
  "Lemongrass Fresh": 5,
  "Red Vitality": 6,
};

const VARIANTS = Object.keys(VARIAN_ID_MAP);

const COOLDOWN_MS = 6000; // 6 detik
const MIN_NAME_LENGTH = 2;
const MIN_MESSAGE_LENGTH = 10;

export default function TulisTestimoniForm({ onSuccess }: Props) {
  const [show, setShow] = useState(false);
  const [sending, setSending] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [lastSubmit, setLastSubmit] = useState<number | null>(null);
  const [statusMsg, setStatusMsg] = useState<string | null>(null);
  const [hoverRating, setHoverRating] = useState<number | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [file, setFile] = useState<File | null>(null);

  const abortControllerRef = useRef<AbortController | null>(null);

  const [form, setForm] = useState({
    nama: "",
    kota: "",
    pesan: "",
    rating: 5,
    varian: "",
    img: "",
    active: false,
    showOnHome: false,
  });

  // Cleanup preview URL on unmount
  useEffect(() => {
    return () => {
      if (preview) URL.revokeObjectURL(preview);
    };
  }, [preview]);

  // Auto close listener
  useEffect(() => {
    const handler = () => setShow(false);
    window.addEventListener("close-testimoni-modal", handler);
    return () => window.removeEventListener("close-testimoni-modal", handler);
  }, []);

  // Body lock
  useEffect(() => {
    if (show) {
      document.body.classList.add("body-lock");
    } else {
      document.body.classList.remove("body-lock");
      // Cleanup abort controller
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
        abortControllerRef.current = null;
      }
    }
    return () => document.body.classList.remove("body-lock");
  }, [show]);

  // Validation
  const validate = useCallback(() => {
    const err: Record<string, string> = {};
    
    const nameRegex = /^[a-zA-Z\s]{2,50}$/;
    if (!nameRegex.test(form.nama.trim())) {
      err.nama = "Nama hanya huruf dan spasi (2-50 karakter)";
    }
    
    const cityRegex = /^[a-zA-Z\s]{2,50}$/;
    if (!cityRegex.test(form.kota.trim())) {
      err.kota = "Kota hanya huruf dan spasi (2-50 karakter)";
    }
    
    if (form.pesan.trim().length < MIN_MESSAGE_LENGTH) {
      err.pesan = `Minimal ${MIN_MESSAGE_LENGTH} karakter`;
    }
    
    if (!form.varian) {
      err.varian = "Pilih varian yang kamu minum";
    }
    
    setErrors(err);
    return Object.keys(err).length === 0;
  }, [form]);

  // File handler with cleanup
  const handleFileChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0] || null;
    setFile(f);
    
    // Cleanup old preview
    if (preview) URL.revokeObjectURL(preview);
    
    if (f) {
      // Validate file size (max 2MB)
      if (f.size > 2 * 1024 * 1024) {
        setErrors(prev => ({ ...prev, file: "Maksimal ukuran file 2MB" }));
        setFile(null);
        setPreview(null);
        return;
      }
      
      // Validate file type
      if (!f.type.startsWith("image/")) {
        setErrors(prev => ({ ...prev, file: "File harus berupa gambar" }));
        setFile(null);
        setPreview(null);
        return;
      }
      
      const newPreview = URL.createObjectURL(f);
      setPreview(newPreview);
      setErrors(prev => {
        const { file, ...rest } = prev;
        return rest;
      });
    } else {
      setPreview(null);
    }
  }, [preview]);

  // Upload file
  const uploadFileToBlob = async (signal?: AbortSignal) => {
    if (!file) return "";
    
    const fd = new FormData();
    fd.append("file", file);

    const res = await fetch("/api/upload", {
      method: "POST",
      body: fd,
      signal,
    });
    
    if (!res.ok) {
      const text = await res.text();
      throw new Error(`Upload gagal: ${res.status}`);
    }
    
    const json = await res.json();
    if (!json.success) {
      throw new Error(json.message || "Upload foto gagal");
    }

    return json.url;
  };

  // Submit
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setStatusMsg(null);

    if (!validate()) return;

    // Anti spam
    if (lastSubmit && Date.now() - lastSubmit < COOLDOWN_MS) {
      const waitSeconds = Math.ceil((COOLDOWN_MS - (Date.now() - lastSubmit)) / 1000);
      setStatusMsg(`Tunggu ${waitSeconds} detik sebelum mengirim lagi…`);
      return;
    }

    setSending(true);
    
    // Create abort controller
    const controller = new AbortController();
    abortControllerRef.current = controller;

    try {
      // Upload foto dulu
      const imageUrl = await uploadFileToBlob(controller.signal);

      // Payload testimoni
      const payload = {
        ...form,
        img: imageUrl || "",
        active: false,
        showOnHome: false,
      };

      // Kirim testimoni
      const res = await fetch("/api/testimonial", {
        signal: controller.signal,
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) throw new Error(`HTTP ${res.status}`);

      // Update best seller rating (tidak blocking)
      const productId = VARIAN_ID_MAP[form.varian];
      if (typeof productId === "number" && productId > 0) {
        updateRating(String(productId), form.rating);
      }

      setLastSubmit(Date.now());
      setStatusMsg("Terima kasih! Testimoni kamu terkirim 🙌");
      onSuccess?.();

      // Reset form
      setForm({
        nama: "",
        kota: "",
        pesan: "",
        rating: 5,
        varian: "",
        img: "",
        active: false,
        showOnHome: false,
      });
      
      // Cleanup file
      if (preview) URL.revokeObjectURL(preview);
      setFile(null);
      setPreview(null);

      setTimeout(() => setShow(false), 900);
    } catch (err: any) {
      if (err?.name === "AbortError") return;
      
      console.error("Submit error:", err);
      setStatusMsg(err?.message || "Terjadi kesalahan, coba lagi.");
    } finally {
      setSending(false);
      abortControllerRef.current = null;
    }
  };

  const isInvalid = !form.nama || !form.kota || !form.pesan || !form.varian;

  return (
    <>
      <button
        onClick={() => setShow(true)}
        className="bg-[#0FA3A8] hover:bg-[#0B4B50] text-white font-semibold px-6 py-3 rounded-full shadow-lg transition-all"
      >
        + Tulis Testimoni
      </button>

      {show && (
        <div
          onClick={() => setShow(false)}
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[999999] flex items-center justify-center p-4"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-md bg-white rounded-3xl shadow-xl p-6 relative"
          >
            {/* Close button */}
            <button
              onClick={() => setShow(false)}
              className="absolute top-4 right-4 p-1 rounded-full hover:bg-gray-100"
            >
              <X size={20} className="text-gray-500" />
            </button>

            <h3 className="text-xl font-semibold mb-1 text-[#0B4B50]">
              Tulis Testimoni Kamu 💬
            </h3>
            <p className="text-xs text-gray-500 mb-4">
              Ceritakan pengalamanmu setelah minum KOJE24.
            </p>

            <form onSubmit={handleSubmit} className="space-y-3">
              {/* Nama */}
              <div>
                <input
                  placeholder="Nama *"
                  value={form.nama}
                  onChange={(e) =>
                    setForm({ ...form, nama: e.target.value })
                  }
                  className={`border p-2 rounded-lg w-full text-sm ${
                    errors.nama ? "border-red-500" : ""
                  }`}
                />
                {errors.nama && (
                  <p className="text-xs text-red-500 mt-1">{errors.nama}</p>
                )}
              </div>

              {/* Kota */}
              <div>
                <input
                  placeholder="Kota *"
                  value={form.kota}
                  onChange={(e) =>
                    setForm({ ...form, kota: e.target.value })
                  }
                  className={`border p-2 rounded-lg w-full text-sm ${
                    errors.kota ? "border-red-500" : ""
                  }`}
                />
                {errors.kota && (
                  <p className="text-xs text-red-500 mt-1">{errors.kota}</p>
                )}
              </div>

              {/* Pesan */}
              <div>
                <textarea
                  placeholder="Ceritakan pengalamanmu *"
                  rows={3}
                  value={form.pesan}
                  onChange={(e) =>
                    setForm({ ...form, pesan: e.target.value })
                  }
                  className={`border p-2 rounded-lg w-full text-sm ${
                    errors.pesan ? "border-red-500" : ""
                  }`}
                />
                {errors.pesan && (
                  <p className="text-xs text-red-500 mt-1">{errors.pesan}</p>
                )}
              </div>

              {/* Varian */}
              <div>
                <select
                  value={form.varian}
                  onChange={(e) =>
                    setForm({ ...form, varian: e.target.value })
                  }
                  className={`border p-2 rounded-lg w-full text-sm ${
                    errors.varian ? "border-red-500" : ""
                  }`}
                >
                  <option value="">Pilih Varian *</option>
                  {VARIANTS.map((v) => (
                    <option key={v}>{v}</option>
                  ))}
                </select>
                {errors.varian && (
                  <p className="text-xs text-red-500 mt-1">{errors.varian}</p>
                )}
              </div>

              {/* Rating */}
              <div>
                <p className="text-sm text-gray-600 mb-1">Rating *</p>
                <div className="flex gap-1">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onMouseEnter={() => setHoverRating(star)}
                      onMouseLeave={() => setHoverRating(null)}
                      onClick={() => setForm({ ...form, rating: star })}
                      className="p-1"
                    >
                      <Star
                        size={24}
                        className={
                          (hoverRating ?? form.rating) >= star
                            ? "fill-yellow-400 text-yellow-400"
                            : "text-gray-300"
                        }
                      />
                    </button>
                  ))}
                </div>
              </div>

              {/* Foto Opsional */}
              <div>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleFileChange}
                  className="border p-2 rounded-lg w-full text-sm"
                />
                {errors.file && (
                  <p className="text-xs text-red-500 mt-1">{errors.file}</p>
                )}
              </div>

              {/* Preview */}
              {preview && (
                <div className="relative w-20 h-20">
                  <img
                    src={preview}
                    alt="Preview"
                    className="w-20 h-20 rounded-lg object-cover border"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      if (preview) URL.revokeObjectURL(preview);
                      setPreview(null);
                      setFile(null);
                    }}
                    className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1"
                  >
                    <X size={12} />
                  </button>
                </div>
              )}

              {/* Status message */}
              {statusMsg && (
                <p className="text-xs text-center text-gray-600">
                  {statusMsg}
                </p>
              )}

              {/* Submit button */}
              <button
                type="submit"
                disabled={sending || isInvalid || Object.keys(errors).length > 0}
                className="w-full bg-[#0FA3A8] text-white py-2.5 rounded-full text-sm font-medium disabled:bg-gray-300 transition-all"
              >
                {sending ? "Mengirim…" : "Kirim Testimoni"}
              </button>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
