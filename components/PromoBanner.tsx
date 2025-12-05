"use client";
import { useEffect, useState } from "react";
import { fetchPromos } from "@/lib/promos";

export default function PromoBanner() {
  const [promos, setPromos] = useState<any[]>([]);

  // load hanya promo aktif (API sudah filter)
  useEffect(() => {
    const load = async () => {
      try {
        const data = await fetchPromos();
        if (Array.isArray(data) && data.length > 0) setPromos(data);
      } catch (err) {
        console.error("PROMO BANNER — fetch failed:", err);
      }
    };
    load();
  }, []);

  if (promos.length === 0) return null;

  const openPopup = () => {
    if (typeof window !== "undefined") {
      window.dispatchEvent(new CustomEvent("open-promo-popup"));
    }
  };

  return (
    <div
      className="bg-[#0FA3A8] text-white py-2 md:py-3 overflow-hidden cursor-pointer select-none"
      onClick={openPopup}
    >
      <div className="whitespace-nowrap flex gap-10 animate-promo-scroll font-inter text-xs md:text-sm px-6">
        {promos.map((p, i) => (
          <span key={i}>🔥 {p.kode} — {p.tipe} {p.nilai}</span>
        ))}
      </div>

      <style jsx global>{`
        @keyframes promo-scroll {
          0% {
            transform: translateX(100%);
          }
          100% {
            transform: translateX(-100%);
          }
        }
        .animate-promo-scroll {
          animation: promo-scroll 26s linear infinite; /* lebih smooth */
        }
      `}</style>
    </div>
  );
}
