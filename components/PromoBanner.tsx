"use client"
import { useEffect, useState } from "react"
import { fetchPromos } from "@/lib/promos"

export default function PromoBanner() {
  const [promos, setPromos] = useState<any[]>([])

  useEffect(() => {
    const load = async () => {
      const data = await fetchPromos()
      const active = data.filter((p) => (p.status?.toLowerCase?.() || "") === "aktif")
      setPromos(active)
    }
    load()
  }, [])

  if (promos.length === 0) return null

  const openPopup = () => {
    if (typeof window !== "undefined") {
      window.dispatchEvent(new CustomEvent("open-promo-popup"))
    }
  }

  return (
    <div
      className="bg-[#0FA3A8] text-white py-3 overflow-hidden cursor-pointer select-none"
      onClick={openPopup}
    >
      <div className="whitespace-nowrap flex gap-10 animate-promo-scroll font-inter text-sm px-6">
        {promos.map((p, i) => (
          <span key={i}>🔥 {p.kode} — {p.tipe} {p.nilai}</span>
        ))}
      </div>

      <style jsx global>{`
        @keyframes promo-scroll {
          0% { transform: translateX(100%); }
          100% { transform: translateX(-100%); }
        }
        .animate-promo-scroll {
          animation: promo-scroll 18s linear infinite;
        }
      `}</style>
    </div>
  )
}
