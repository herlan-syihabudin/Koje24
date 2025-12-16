"use client";

import { useEffect, useState } from "react";
import { fetchPromos } from "@/lib/promos";
import { useCartStore } from "@/stores/cartStore";

export default function PromoPopup() {
  const [promos, setPromos] = useState<any[]>([]);
  const [index, setIndex] = useState(0);
  const [open, setOpen] = useState(false);

  const promo = useCartStore((s) => s.promo);
  const setPromo = useCartStore((s) => s.setPromo);

  // ===============================
  // AUTO OPEN SAAT FIRST VISIT (1x)
  // ===============================
  useEffect(() => {
    if (typeof window === "undefined") return;

    const seen = localStorage.getItem("koje24_promo_seen");
    if (seen) return;

    setOpen(true);
    localStorage.setItem("koje24_promo_seen", "1");
  }, []);

  // ===============================
  // OPEN VIA MANUAL EVENT (OPTIONAL)
  // ===============================
  useEffect(() => {
    if (typeof window === "undefined") return;
    const handler = () => setOpen(true);
    window.addEventListener("open-promo-popup", handler);
    return () => window.removeEventListener("open-promo-popup", handler);
  }, []);

  // ===============================
  // LOAD PROMO
  // ===============================
  useEffect(() => {
    const load = async () => {
      try {
        const data = await fetchPromos();
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

  const apply = () => {
    // kalau promo yang sama sudah aktif
    if (promo && promo.kode === p.kode) {
      setOpen(false);
      return;
    }

    // SET PROMO (FINAL)
    setPromo({
      kode: p.kode,
      tipe: p.tipe,
      nilai: Number(p.nilai),
      minimal: Number(p.minimal),
      maxDiskon: p.maxDiskon ? Number(p.maxDiskon) : null,
    });

    // buka cart biar user lihat efeknya
    window.dispatchEvent(new Event("open-cart"));

    setOpen(false);
  };

  const next = () => {
    setIndex((i) => (i + 1) % promos.length);
  };

  const close = () => setOpen(false);

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
          <p className="text-sm text-gray-600 mb-1">Gunakan promo:</p>
          <div className="text-2xl font-bold tracking-wide text-[#0FA3A8]">
            {p.kode}
          </div>
          <p className="text-xs text-gray-500 mt-1">
            {p.tipe === "percent"
              ? `Diskon ${p.nilai}%`
              : `Potongan Rp ${Number(p.nilai).toLocaleString("id-ID")}`}
          </p>
        </div>

        <button
          onClick={apply}
          className="w-full bg-[#0FA3A8] text-white py-3 rounded-full font-semibold shadow-md hover:bg-[#0DC1C7] active:scale-95 transition-all"
        >
          Ambil Promo 🚀
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
