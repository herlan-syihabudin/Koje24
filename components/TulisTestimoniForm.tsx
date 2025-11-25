"use client";

import { useState, useEffect } from "react";
import { updateRating } from "@/lib/bestseller";

type Props = { onSuccess?: () => void };

// VARIAN → PRODUCT ID MAPPING (untuk rating bestseller)
const VARIAN_ID_MAP: Record<string, number> = {
  "Golden Detox": 1,
  "Yellow Immunity": 2,
  "Green Revive": 3,
  "Sunrise Boost": 4,
  "Lemongrass Fresh": 5,
  "Red Vitality": 6,
};

export default function TulisTestimoniForm({ onSuccess }: Props) {
  const [show, setShow] = useState(false);
  const [sending, setSending] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [lastSubmit, setLastSubmit] = useState<number | null>(null);
  const [statusMsg, setStatusMsg] = useState<string | null>(null);
  const [hoverRating, setHoverRating] = useState<number | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [file, setFile] = useState<File | null>(null);

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

  /* === AUTO CLOSE LISTENER dari HEADER === */
  useEffect(() => {
    const handler = () => setShow(false);
    window.addEventListener("close-testimoni-modal", handler);
    return () =>
      window.removeEventListener("close-testimoni-modal", handler);
  }, []);

  /* BODY LOCK */
  useEffect(() => {
    if (show) document.body.classList.add("body-lock");
    else document.body.classList.remove("body-lock");
    return () => document.body.classList.remove("body-lock");
  }, [show]);

  /* VALIDATION */
  const validate = () => {
    const err: Record<string, string> = {};
    if (form.nama.trim().length < 2) err.nama = "Nama minimal 2 karakter";
    if (form.kota.trim().length < 2) err.kota = "Kota minimal 2 karakter";
    if (form.pesan.trim().length < 10) err.pesan = "Minimal 10 karakter";
    if (!form.varian) err.varian = "Pilih varian";
    setErrors(err);
    return Object.keys(err).length === 0;
  };

  const uploadFileToBlob = async () => {
    if (!file) return "";
    const fd = new FormData();
    fd.append("file", file);
    const res = await fetch("/api/upload", { method: "POST", body: fd });
    const json = await res.json();
    return json.url || "";
  };

  const handleSubmit = async (e: any) => {
    e.preventDefault();
    setStatusMsg(null);

    if (!validate()) return;

    if (lastSubmit && Date.now() - lastSubmit < 6000) {
      setStatusMsg("Tunggu sebentar sebelum mengirim lagi…");
      return;
    }

    setSending(true);

    try {
      let imageUrl = "";
      if (file) imageUrl = await uploadFileToBlob();

      const newForm = {
        ...form,
        active: form.rating > 3,
        showOnHome: form.rating > 3,
        img: imageUrl,
      };

      // 🔥 AUTO BEST SELLER UPDATE
      const productId = VARIAN_ID_MAP[form.varian] || 0;
      if (productId > 0) {
        updateRating(productId, form.rating);
      }

      await fetch("/api/testimonial", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newForm),
      });

      setLastSubmit(Date.now());
      setStatusMsg("Terima kasih! Testimoni kamu terkirim 🙌");
      onSuccess?.();

      setTimeout(() => setShow(false), 900);
    } catch (err) {
      console.error(err);
      setStatusMsg("Terjadi kesalahan, coba lagi.");
    } finally {
      setSending(false);
    }
  };

  return (
    <>
      <button
        onClick={() => setShow(true)}
        className="px-5 py-2 bg-[#0FA3A8] text-white rounded-full shadow-md hover:shadow-lg text-sm md:text-base transition-all"
      >
        + Tulis Testimoni
      </button>

      {show && (
        <div
          onClick={() => setShow(false)}
          className="
            fixed inset-0 bg-black/60 backdrop-blur-sm
            z-[999999] overflow-y-auto
            flex items-start md:items-center justify-center
            pt-20 md:pt-0 pb-10 koje-modal-overlay
          "
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="
              relative w-[92%] sm:w-full max-w-md
              bg-white rounded-3xl shadow-xl
              p-6 z-[1000000] max-h-[85vh]
              overflow-y-auto koje-modal-box
            "
          >
            <button
              type="button"
              onClick={() => setShow(false)}
              className="absolute right-4 top-4 text-2xl text-gray-500 hover:text-[#0FA3A8] z-[1000002]"
            >
              ✕
            </button>

            <h3 className="text-xl font-semibold mb-1 text-[#0B4B50]">
              Tulis Testimoni Kamu 💬
            </h3>
            <p className="text-xs text-gray-500 mb-4">
              Ceritakan pengalamanmu setelah minum KOJE24.
            </p>

            <form onSubmit={handleSubmit} className="space-y-3 pb-3">
              {/* --- INPUT FIELDS --- */}
              <div>
                <label className="text-xs text-gray-600">Nama Lengkap</label>
                <input
                  value={form.nama}
                  onChange={(e) =>
                    setForm({ ...form, nama: e.target.value })
                  }
                  placeholder="Contoh: Herlan S."
                  className="mt-1 border p-2 rounded-lg w-full text-sm"
                />
                {errors.nama && (
                  <p className="text-[11px] text-red-500">{errors.nama}</p>
                )}
              </div>

              <div>
                <label className="text-xs text-gray-600">Kota / Domisili</label>
                <input
                  value={form.kota}
                  onChange={(e) =>
                    setForm({ ...form, kota: e.target.value })
                  }
                  placeholder="Contoh: Bekasi"
                  className="mt-1 border p-2 rounded-lg w-full text-sm"
                />
                {errors.kota && (
                  <p className="text-[11px] text-red-500">{errors.kota}</p>
                )}
              </div>

              <div>
                <label className="text-xs text-gray-600">
                  Ceritakan Pengalamanmu
                </label>
                <textarea
                  value={form.pesan}
                  onChange={(e) =>
                    setForm({ ...form, pesan: e.target.value })
                  }
                  placeholder="Contoh: Setelah rutin minum KOJE24..."
                  rows={3}
                  className="mt-1 border p-2 rounded-lg w-full text-sm resize-none"
                />
                {errors.pesan && (
                  <p className="text-[11px] text-red-500">{errors.pesan}</p>
                )}
              </div>

              <div>
                <label className="text-xs text-gray-600">Varian Favorit</label>
                <select
                  value={form.varian}
                  onChange={(e) =>
                    setForm({ ...form, varian: e.target.value })
                  }
                  className="mt-1 border p-2 rounded-lg w-full text-sm"
                >
                  <option value="">Pilih Varian</option>
                  <option>Golden Detox</option>
                  <option>Yellow Immunity</option>
                  <option>Green Revive</option>
                  <option>Sunrise Boost</option>
                  <option>Lemongrass Fresh</option>
                  <option>Red Vitality</option>
                </select>
                {errors.varian && (
                  <p className="text-[11px] text-red-500">{errors.varian}</p>
                )}
              </div>

              <div>
                <label className="text-xs text-gray-600">
                  Rating Kepuasan
                </label>
                <div className="flex gap-1 mt-1">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onMouseEnter={() => setHoverRating(star)}
                      onMouseLeave={() => setHoverRating(null)}
                      onClick={() =>
                        setForm({ ...form, rating: star })
                      }
                      className="text-xl"
                    >
                      <span
                        className={
                          (hoverRating ?? form.rating) >= star
                            ? "text-yellow-400"
                            : "text-gray-300"
                        }
                      >
                        ★
                      </span>
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="text-xs text-gray-600">
                  Foto (opsional)
                </label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => {
                    const f = e.target.files?.[0] || null;
                    setFile(f);
                    if (f) setPreview(URL.createObjectURL(f));
                  }}
                  className="mt-1 border p-2 rounded-lg w-full text-sm"
                />
                {preview && (
                  <img
                    src={preview}
                    className="w-20 h-20 rounded-lg object-cover mt-2 border"
                  />
                )}
              </div>

              {statusMsg && (
                <p className="text-[11px] text-center text-gray-600">
                  {statusMsg}
                </p>
              )}

              <button
                type="submit"
                disabled={sending}
                className="w-full bg-[#0FA3A8] text-white py-2.5 rounded-full text-sm font-medium"
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
