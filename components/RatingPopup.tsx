"use client";

import { useEffect, useState } from "react";
import TulisTestimoniForm from "./TulisTestimoniForm";

export default function RatingPopup() {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(true);

  // Popup muncul maksimal 1x setiap 3 hari
  const POPUP_KEY = "koje24_testi_popup_last";

  useEffect(() => {
    const last = localStorage.getItem(POPUP_KEY);
    if (last) {
      const lastTime = new Date(last).getTime();
      const diff = Date.now() - lastTime;
      // kalau belum lewat 3 hari → stop
      if (diff < 1000 * 60 * 60 * 24 * 3) {
        setLoading(false);
        return;
      }
    }

    const load = async () => {
      try {
        // ambil transaksi
        const res = await fetch("/api/transaksi", { cache: "no-store" });
        const json = await res.json();

        // sort by newest first
        json.reverse();

        // cek transaksi yg lebih dari 7 hari
        const sevenDays = 1000 * 60 * 60 * 24 * 7;
        const target = json.find((trx: any) => {
          const d = new Date(trx.Tanggal); // format C
          return Date.now() - d.getTime() > sevenDays;
        });

        if (!target) {
          setLoading(false);
          return;
        }

        const namaUser = target.Nama?.trim()?.toLowerCase() || "";
        if (!namaUser) {
          setLoading(false);
          return;
        }

        // cek apakah user sudah pernah kirim testimoni
        const resT = await fetch("/api/testimonial", { cache: "no-store" });
        const testi = await resT.json();

        const hasTesti = testi.some(
          (t: any) =>
            (t.nama || "").trim().toLowerCase() === namaUser &&
            ["true", "1", "yes", "ya"].includes(
              String(t.active).trim().toLowerCase()
            )
        );

        if (hasTesti) {
          setLoading(false);
          return;
        }

        // lolos semua syarat → tampilkan popup
        setOpen(true);
      } catch (err) {
        console.error("Popup err", err);
      } finally {
        setLoading(false);
      }
    };

    load();
  }, []);

  const closePopup = () => {
    setOpen(false);
    localStorage.setItem(POPUP_KEY, new Date().toISOString()); // simpan waktu popup muncul
  };

  if (loading) return null;
  if (!open) return null;

  return (
    <div
      className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[999998] flex items-center justify-center p-4"
      onClick={closePopup}
    >
      <div
        className="bg-white rounded-3xl shadow-2xl p-6 relative max-w-md w-full animate-[fadeIn_0.3s_ease]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Tombol tutup manual */}
        <button
          onClick={closePopup}
          className="absolute top-3 right-4 text-2xl text-gray-500 hover:text-[#0FA3A8]"
        >
          ✕
        </button>

        <h3 className="text-xl font-semibold text-[#0B4B50] mb-2">
          Kasih Rating Minuman Kamu 🥤
        </h3>
        <p className="text-sm text-gray-500 mb-5">
          Kamu sudah pernah order KOJE24. Ceritakan pengalaman kamu, yuk!
        </p>

        {/* FORM TESTIMONI */}
        <TulisTestimoniForm
          onSuccess={() => {
            closePopup();
          }}
        />
      </div>
    </div>
  );
}
