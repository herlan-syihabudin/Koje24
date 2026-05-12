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

  // AUTO OPEN 1x SAAT FIRST VISIT
  useEffect(() => {
    if (typeof window === "undefined") return;
    const KEY = "koje24_promo_seen";
    const seen = localStorage.getItem(KEY);
    if (!seen) {
      localStorage.setItem(KEY, "1");
      setOpen(true);
    }
  }, []);

  // OPEN MANUAL VIA EVENT
  useEffect(() => {
    if (typeof window === "undefined") return;
    const handler = () => setOpen(true);
    window.addEventListener("open-promo-popup", handler);
    return () => window.removeEventListener("open-promo-popup", handler);
  }, []);

  // LOAD PROMO DARI API
  useEffect(() => {
    const load = async () => {
      try {
        const data = await fetchPromos();
        if (Array.isArray(data)) {
          setPromos(data.filter(Boolean));
        }
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

  // NORMALIZE TIPE PROMO
  const normalizeType = (
    tipe: string
  ): "percent" | "flat" | "free_shipping" | "cashback" => {
    const t = String(tipe || "").toLowerCase();

    if (t.includes("percent") || t.includes("diskon") || t.includes("%")) return "percent";
    if (t.includes("flat") || t.includes("potongan") || t.includes("rp")) return "flat";
    if (t.includes("free") || t.includes("ongkir") || t.includes("shipping")) return "free_shipping";
    if (t.includes("cashback")) return "cashback";

    return "flat";
  };

  // APPLY PROMO KE CART STORE
  const apply = () => {
    const { totalPrice } = useCartStore.getState()
    const minimal = Number(p.minimal || 0)
    
    // CEK MINIMAL BELANJA
    if (minimal > 0 && totalPrice < minimal) {
      alert(`Minimal belanja Rp ${minimal.toLocaleString("id-ID")} untuk menggunakan promo ini`)
      return
    }
    
    // Jika promo yang sama sudah aktif → tutup saja
    if (promoAktif?.kode && promoAktif.kode === p.kode) {
      close();
      return;
    }

    setPromo({
      kode: String(p.kode || "").toUpperCase(),
      tipe: normalizeType(p.tipe),
      nilai: Number(p.nilai || 0),
      minimal: Number(p.minimal || 0),
      maxDiskon: p.maxDiskon === null || p.maxDiskon === undefined ? null : Number(p.maxDiskon || 0),
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
            {p.tipe} • {Number(p.nilai || 0).toLocaleString("id-ID")}
          </p>
          
          {/* Minimal Belanja */}
          {Number(p.minimal || 0) > 0 && (
            <p className="text-xs text-gray-400 mt-1">
              Min. belanja Rp {Number(p.minimal || 0).toLocaleString("id-ID")}
            </p>
          )}
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
