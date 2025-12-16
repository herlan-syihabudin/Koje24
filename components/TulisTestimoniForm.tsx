"use client";

import { useState, useEffect } from "react";
import { updateRating } from "@/lib/bestSeller";

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

  /* === AUTO CLOSE LISTENER === */
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
    if (form.pesan.trim().length < 10)
      err.pesan = "Minimal 10 karakter";
    if (!form.varian) err.varian = "Pilih varian";
    setErrors(err);
    return Object.keys(err).length === 0;
  };

  /* UPLOAD FOTO (OPSIONAL) */
  const uploadFileToBlob = async () => {
    if (!file) return ""; // 🔑 FOTO OPSIONAL
    const fd = new FormData();
    fd.append("file", file);

    const res = await fetch("/api/upload", {
      method: "POST",
      body: fd,
    });
    const json = await res.json();

    if (!json.success) {
      throw new Error(json.message || "Upload foto gagal");
    }

    return json.url;
  };

  /* SUBMIT */
  const handleSubmit = async (e: any) => {
    e.preventDefault();
    setStatusMsg(null);

    if (!validate()) return;

    // anti spam
    if (lastSubmit && Date.now() - lastSubmit < 6000) {
      setStatusMsg("Tunggu sebentar sebelum mengirim lagi…");
      return;
    }

    setSending(true);

    try {
      // 1️⃣ upload foto dulu (kalau ada)
      const imageUrl = await uploadFileToBlob();

      // 2️⃣ payload testimoni (PENDING)
      const payload = {
        ...form,
        img: imageUrl || "", // 🔑 boleh kosong
        active: false,
        showOnHome: false,
      };

      // 3️⃣ update rating bestseller (tidak blocking)
      const productId = VARIAN_ID_MAP[form.varian];
      if (typeof productId === "number" && productId > 0) {
        updateRating(String(productId), form.rating);
      }

      // 4️⃣ kirim testimoni
      await fetch("/api/testimonial", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      setLastSubmit(Date.now());
      setStatusMsg("Terima kasih! Testimoni kamu terkirim 🙌");
      onSuccess?.();

      // 5️⃣ reset form
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
      setFile(null);
      setPreview(null);

      setTimeout(() => setShow(false), 900);
    } catch (err: any) {
      console.error(err);
      setStatusMsg(err?.message || "Terjadi kesalahan, coba lagi.");
    } finally {
      setSending(false);
    }
  };

  const isInvalid =
    !form.nama || !form.kota || !form.pesan || !form.varian;

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
            className="w-full max-w-md bg-white rounded-3xl shadow-xl p-6"
          >
            <h3 className="text-xl font-semibold mb-1 text-[#0B4B50]">
              Tulis Testimoni Kamu 💬
            </h3>
            <p className="text-xs text-gray-500 mb-4">
              Ceritakan pengalamanmu setelah minum KOJE24.
            </p>

            <form onSubmit={handleSubmit} className="space-y-3">
              <input
                placeholder="Nama"
                value={form.nama}
                onChange={(e) =>
                  setForm({ ...form, nama: e.target.value })
                }
                className="border p-2 rounded-lg w-full text-sm"
              />

              <input
                placeholder="Kota"
                value={form.kota}
                onChange={(e) =>
                  setForm({ ...form, kota: e.target.value })
                }
                className="border p-2 rounded-lg w-full text-sm"
              />

              <textarea
                placeholder="Ceritakan pengalamanmu"
                rows={3}
                value={form.pesan}
                onChange={(e) =>
                  setForm({ ...form, pesan: e.target.value })
                }
                className="border p-2 rounded-lg w-full text-sm"
              />

              <select
                value={form.varian}
                onChange={(e) =>
                  setForm({ ...form, varian: e.target.value })
                }
                className="border p-2 rounded-lg w-full text-sm"
              >
                <option value="">Pilih Varian</option>
                {Object.keys(VARIAN_ID_MAP).map((v) => (
                  <option key={v}>{v}</option>
                ))}
              </select>

              {/* RATING */}
              <div className="flex gap-1">
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

              {/* FOTO OPSIONAL */}
              <input
                type="file"
                accept="image/*"
                onChange={(e) => {
                  const f = e.target.files?.[0] || null;
                  setFile(f);
                  if (f) setPreview(URL.createObjectURL(f));
                }}
                className="border p-2 rounded-lg w-full text-sm"
              />

              {preview && (
                <img
                  src={preview}
                  className="w-20 h-20 rounded-lg object-cover border"
                />
              )}

              {statusMsg && (
                <p className="text-xs text-center text-gray-600">
                  {statusMsg}
                </p>
              )}

              <button
                type="submit"
                disabled={sending || isInvalid}
                className="w-full bg-[#0FA3A8] text-white py-2.5 rounded-full text-sm font-medium disabled:bg-gray-300"
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
