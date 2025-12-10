"use client";

import { useEffect, useState } from "react";
import { fetchPromos } from "@/lib/promos";
import { useCartStore } from "@/stores/cartStore";

export default function PromoPopup() {
  const [promos, setPromos] = useState<any[]>([]);
  const [index, setIndex] = useState(0);
  const [open, setOpen] = useState(false);

  const addPromo = useCartStore((s: any) => s.addPromo);
  const currentPromoLabel = useCartStore((s: any) => s.promoLabel);

  // ▶️ Popup dibuka manual dari tombol "Lihat Promo"
  useEffect(() => {
    if (typeof window === "undefined") return;
    const handler = () => setOpen(true);
    window.addEventListener("open-promo-popup", handler);
    return () => window.removeEventListener("open-promo-popup", handler);
  }, []);

  // ▶️ Load promo dari API hanya sekali saat component mount
  useEffect(() => {
    const load = async () => {
      try {
        const data = await fetchPromos(); // sudah hanya ambil promo aktif
        if (Array.isArray(data) && data.length > 0) {
          setPromos(data);
        }
      } catch (err) {
        console.error("PROMO POPUP – FETCH ERROR:", err);
      }
    };
    load();
  }, []);

  if (!open || promos.length === 0) return null;

  const p = promos[index];

  const next = () => {
    setIndex((i) => (i + 1) % promos.length);
  };

  const close = () => setOpen(false);

  const apply = () => {
    // ❗ Jika promo yang sama sudah dipakai, langsung tutup
    if (currentPromoLabel && currentPromoLabel === p.kode) {
      setOpen(false);
      return;
    }

    // Masukkan promo ke cart store
    addPromo({
      label: p.kode,
      tipe: p.tipe,
      nilai: p.nilai,
      minimal: p.minimal,
      maxDiskon: p.maxDiskon,
    });

    // 🔥 Langsung close setelah berhasil dipakai
    setOpen(false);
  };

  return (
    <div
      className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-[99999]"
      onClick={close} // Tutup kalau klik area gelap
    >
      <div
        className="bg-white rounded-3xl p-7 max-w-sm mx-auto shadow-2xl relative"
        onClick={(e) => e.stopPropagation()} // Biar klik di dalam box nggak nutup
      >
        <h2 className="font-playfair text-xl font-semibold text-[#0B4B50] mb-3 text-center">
          Promo Spesial Untuk Kamu 🎁
        </h2>

        <div className="text-center mb-4">
          <p className="text-sm text-gray-600 mb-1">Gunakan kode:</p>
          <div className="text-2xl font-bold tracking-wide text-[#0FA3A8]">
            {p.kode}
          </div>
          <p className="text-xs text-gray-500 mt-1">
            {p.tipe} • {p.nilai}
          </p>
        </div>

        <button
          onClick={apply}
          className="w-full bg-[#0FA3A8] text-white py-3 rounded-full font-semibold shadow-md hover:bg-[#0DC1C7] active:scale-95 transition-all"
        >
          Gunakan Promo 🚀
        </button>

        <button
          onClick={close}
          className="w-full mt-3 text-gray-500 text-sm hover:text-[#0FA3A8]"
        >
          Nanti dulu
        </button>

        {promos.length > 1 && (
          <button
            onClick={next}
            className="absolute top-3 right-4 text-xs text-gray-400 hover:text-[#0FA3A8]"
          >
            ➜ next
          </button>
        )}
      </div>
    </div>
  );
}
