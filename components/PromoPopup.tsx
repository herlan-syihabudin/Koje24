"use client";

import { useEffect, useState } from "react";
import { fetchPromos } from "@/lib/promos";
import { useCartStore } from "@/stores/cartStore";

export default function PromoPopup() {
  const [promos, setPromos] = useState<any[]>([]);
  const [index, setIndex] = useState(0);
  const [open, setOpen] = useState(false);

  const promoAktif = useCartStore((s) => s.promo);
  const setPromo = useCartStore((s) => s.setPromo);

  // ✅ Auto open 1x saat first visit (opsional)
  useEffect(() => {
    if (typeof window === "undefined") return;
    const KEY = "koje24_promo_seen";
    const seen = localStorage.getItem(KEY);
    if (!seen) {
      localStorage.setItem(KEY, "1");
      setOpen(true);
    }
  }, []);

  // ✅ Bisa juga dibuka manual via event
  useEffect(() => {
    if (typeof window === "undefined") return;
    const handler = () => setOpen(true);
    window.addEventListener("open-promo-popup", handler);
    return () => window.removeEventListener("open-promo-popup", handler);
  }, []);

  // Load promo
  useEffect(() => {
    const load = async () => {
      try {
        const data = await fetchPromos();
        if (Array.isArray(data)) setPromos(data.filter(Boolean));
      } catch (err) {
        console.error("PROMO POPUP – FETCH ERROR:", err);
      }
    };
    load();
  }, []);

  if (!open || promos.length === 0) return null;

  const p = promos[index];

  const close = () => setOpen(false);
  const next = () => setIndex((i) => (i + 1) % promos.length);

  const normalizeType = (t: string) => {
    const tt = String(t || "").toLowerCase();
    if (tt.includes("persen") || tt.includes("percent")) return "percent";
    if (tt.includes("nominal") || tt.includes("flat")) return "flat";
    return "flat";
  };

  const apply = () => {
    // kalau promo sama sudah aktif → close
    if (promoAktif?.kode && promoAktif.kode === p.kode) {
      close();
      return;
    }

    setPromo({
      kode: String(p.kode || "").toUpperCase(),
      tipe: normalizeType(p.tipe),
      nilai: Number(p.nilai || 0),
      minimal: Number(p.minimal || 0),
      maxDiskon: p.maxDiskon === null ? null : Number(p.maxDiskon || 0),
    });

    close();
  };

  return (
    <div
      className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-[99999]"
      onClick={close}
    >
      <div
        className="bg-white rounded-3xl p-7 max-w-sm mx-auto shadow-2xl relative"
        onClick={(e) => e.stopPropagation()}
      >
        <h2 className="font-playfair text-xl font-semibold text-[#0B4B50] mb-3 text-center">
          Promo Spesial Untuk Kamu 🎁
        </h2>

        <div className="text-center mb-4">
          <p className="text-sm text-gray-600 mb-1">Gunakan kode:</p>
          <div className="text-2xl font-bold tracking-wide text-[#0FA3A8]">
            {String(p.kode || "").toUpperCase()}
          </div>
          <p className="text-xs text-gray-500 mt-1">
            {normalizeType(p.tipe)} • {Number(p.nilai || 0)}
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
