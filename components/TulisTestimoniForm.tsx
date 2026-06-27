"use client";

import { useState, useEffect, useRef } from "react";  // ← WAJIB ADA useEffect
import { Star, X, Upload } from "lucide-react";
import { updateRating } from "@/lib/bestSeller";
import { toast } from "sonner";  // ← pake sonner

type Props = { onSuccess?: () => void };

const VARIAN_ID_MAP: Record<string, number> = {
  "Golden Detox": 1,
  "Yellow Immunity": 2,
  "Green Revive": 3,
  "Sunrise Boost": 4,
  "Lemongrass Fresh": 5,
  "Red Vitality": 6,
};

const VARIANTS = Object.keys(VARIAN_ID_MAP);
const MIN_MESSAGE_LENGTH = 10;

export default function TulisTestimoniForm({ onSuccess }: Props) {
  const [show, setShow] = useState(false);
  const [sending, setSending] = useState(false);
  const [preview, setPreview] = useState<string | null>(null);
  const [hoverRating, setHoverRating] = useState<number | null>(null);
  
  const [form, setForm] = useState({
    nama: "",
    kota: "",
    pesan: "",
    rating: 5,
    varian: "",
  });
  
  const [file, setFile] = useState<File | null>(null);

  // ✅ Body lock - WAJIB ADA
  useEffect(() => {
    if (show) {
      document.body.classList.add("body-lock");
    } else {
      document.body.classList.remove("body-lock");
      setForm({ nama: "", kota: "", pesan: "", rating: 5, varian: "" });
      setFile(null);
      if (preview) URL.revokeObjectURL(preview);
      setPreview(null);
    }
    return () => document.body.classList.remove("body-lock");
  }, [show, preview]);

  // ✅ Close handler - WAJIB ADA
  useEffect(() => {
    const handler = () => setShow(false);
    window.addEventListener("close-testimoni-modal", handler);
    return () => window.removeEventListener("close-testimoni-modal", handler);
  }, []);

  // Simple validation
  const isValid = () => {
    if (!form.nama.trim()) {
      toast.error("Nama harus diisi");
      return false;
    }
    if (!form.kota.trim()) {
      toast.error("Kota harus diisi");
      return false;
    }
    if (form.pesan.trim().length < MIN_MESSAGE_LENGTH) {
      toast.error(`Cerita minimal ${MIN_MESSAGE_LENGTH} karakter`);
      return false;
    }
    if (!form.varian) {
      toast.error("Pilih varian yang kamu minum");
      return false;
    }
    return true;
  };

  // File handler
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (!f) return;
    
    if (f.size > 2 * 1024 * 1024) {
      toast.error("Maksimal ukuran file 2MB");
      return;
    }
    
    if (!f.type.startsWith("image/")) {
      toast.error("File harus berupa gambar");
      return;
    }
    
    if (preview) URL.revokeObjectURL(preview);
    setFile(f);
    setPreview(URL.createObjectURL(f));
  };

  // Submit
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isValid()) return;
    if (sending) return;
    
    setSending(true);
    
    try {
      let imageUrl = "";
      if (file) {
        const fd = new FormData();
        fd.append("file", file);
        const res = await fetch("/api/upload", { method: "POST", body: fd });
        const json = await res.json();
        if (json.success) imageUrl = json.url;
      }
      
      const payload = {
        ...form,
        img: imageUrl,
        active: false,
        showOnHome: false,
      };
      
      const res = await fetch("/api/testimonial", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      
      if (!res.ok) throw new Error();
      
      const productId = VARIAN_ID_MAP[form.varian];
      if (productId) updateRating(String(productId), form.rating);
      
      toast.success("Testimoni terkirim! Terima kasih 🙌");
      onSuccess?.();
      
      setTimeout(() => setShow(false), 1500);
      
    } catch (error) {
      toast.error("Gagal mengirim, coba lagi");
    } finally {
      setSending(false);
    }
  };

  return (
    <>
      <button
        onClick={() => setShow(true)}
        className="bg-[#0FA3A8] hover:bg-[#0B4B50] text-white font-semibold px-6 py-3 rounded-full shadow transition"
      >
        + Tulis Testimoni
      </button>

      {show && (
        <div
          onClick={() => setShow(false)}
          className="fixed inset-0 bg-black/50 z-[999] flex items-center justify-center p-4"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-md bg-white rounded-2xl shadow-xl overflow-hidden"
          >
            <div className="flex justify-between items-center p-5 border-b">
              <div>
                <h3 className="text-lg font-semibold text-[#0B4B50]">Tulis Testimoni</h3>
                <p className="text-xs text-gray-500">Ceritakan pengalamanmu dengan KOJE24</p>
              </div>
              <button onClick={() => setShow(false)} className="p-1 rounded-full hover:bg-gray-100">
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-5 space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <input
                  type="text"
                  placeholder="Nama *"
                  value={form.nama}
                  onChange={(e) => setForm({ ...form, nama: e.target.value })}
                  className="border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-[#0FA3A8]"
                />
                <input
                  type="text"
                  placeholder="Kota *"
                  value={form.kota}
                  onChange={(e) => setForm({ ...form, kota: e.target.value })}
                  className="border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-[#0FA3A8]"
                />
              </div>

              <select
                value={form.varian}
                onChange={(e) => setForm({ ...form, varian: e.target.value })}
                className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-[#0FA3A8]"
              >
                <option value="">Pilih varian *</option>
                {VARIANTS.map((v) => (
                  <option key={v}>{v}</option>
                ))}
              </select>

              <div>
                <textarea
                  placeholder="Ceritakan pengalamanmu..."
                  rows={3}
                  value={form.pesan}
                  onChange={(e) => setForm({ ...form, pesan: e.target.value })}
                  className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-[#0FA3A8] resize-none"
                />
                <p className="text-xs text-gray-400 text-right mt-1">
                  {form.pesan.length}/{MIN_MESSAGE_LENGTH}+
                </p>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-600">Rating:</span>
                <div className="flex gap-1">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onMouseEnter={() => setHoverRating(star)}
                      onMouseLeave={() => setHoverRating(null)}
                      onClick={() => setForm({ ...form, rating: star })}
                    >
                      <Star
                        size={22}
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

              <div>
                <label className="flex items-center gap-2 text-sm text-gray-600 cursor-pointer">
                  <Upload size={16} />
                  <span>Tambah foto (opsional)</span>
                  <input type="file" accept="image/*" onChange={handleFileChange} className="hidden" />
                </label>
                {preview && (
                  <div className="relative w-16 h-16 mt-2">
                    <img src={preview} alt="Preview" className="w-16 h-16 rounded-lg object-cover border" />
                    <button
                      type="button"
                      onClick={() => {
                        if (preview) URL.revokeObjectURL(preview);
                        setPreview(null);
                        setFile(null);
                      }}
                      className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-0.5"
                    >
                      <X size={12} />
                    </button>
                  </div>
                )}
              </div>

              <button
                type="submit"
                disabled={sending}
                className="w-full bg-[#0FA3A8] hover:bg-[#0B4B50] text-white font-semibold py-2.5 rounded-xl transition disabled:bg-gray-300"
              >
                {sending ? "Mengirim..." : "Kirim Testimoni"}
              </button>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
