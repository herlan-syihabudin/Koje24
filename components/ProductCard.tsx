"use client";

import { useBestSellerRanking } from "@/lib/bestSeller";

export default function ProductCard({
  id,
  name,
  price,
  img,
}: {
  id: number;
  name: string;
  price: number;
  img: string;
}) {
  // Ambil data bestseller realtime
  const ranking = useBestSellerRanking();
  const isBest = ranking[id]?.isBestSeller === true;

  return (
    <div className="relative bg-white rounded-2xl border border-[#e6eeee] shadow-sm overflow-hidden">

      {/* 🔥 BADGE BEST SELLER */}
      {isBest && (
        <div className="
          absolute top-3 left-3 
          bg-[#F4B400] text-white text-[11px] font-semibold 
          px-2 py-1 rounded-full shadow-md z-20
          animate-pulse
        ">
          ⭐ Best Seller
        </div>
      )}

      <img src={img} alt={name} className="w-full h-40 object-cover" />

      <div className="p-4">
        <h3 className="font-semibold text-[#0B4B50]">{name}</h3>
        <p className="text-sm text-[#557577] mt-1">
          Rp {price.toLocaleString("id-ID")}
        </p>
      </div>
    </div>
  );
}
