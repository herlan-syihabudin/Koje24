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

  // event listener dari tombol "lihat promo"
  useEffect(() => {
    if (typeof window === "undefined") return;
    const handler = () => setOpen(true);
    window.addEventListener("open-promo-popup", handler);
    return () => window.removeEventListener("open-promo-popup", handler);
  }, []);

  // load promo hanya sekali
  useEffect(() => {
    const load = async () => {
      try {
        const data = await fetchPromos(); // sudah hanya promo aktif
        if (Array.isArray(data) && data.length > 0) {
          setPromos(data);
          setOpen(true);
        }
      } catch (err) {
        console.error("PROMO POPUP – fetch failed:", err);
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
    // cegah promo dobel di cart
    if (currentPromoLabel && currentPromoLabel === p.kode) {
      next();                      // lanjut promo lain kalau ada
      if (promos.length === 1) setOpen(false);
      return;
    }

    addPromo({
      label: p.kode,
      tipe: p.tipe,
      nilai: p.nilai,
      minimal: p.minimal,
      maxDiskon: p.maxDiskon,
    });

    next();
    if (promos.length === 1) setOpen(false);
  };

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-[99999]">
      <div className="bg-white rounded-3xl p-7 max-w-sm mx-auto shadow-2xl relative">

        <h2 className="font-playfair text-xl font-semibold text-[#0B4B50] mb-3 text-center">
          Promo Spesial Untuk Kamu 🎁
        </h2>

        <div className="text-center mb-4">
          <p className="text-sm text-gray-600 mb-1">Gunakan kode:</p>
          <div className="text-2xl font-bold tracking-wide text-[#0FA3A8]">
            {p.kode}
          </div>
          <p className="text-xs text-gray-500 mt-1">
            {p.tipe} — {p.nilai}
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
