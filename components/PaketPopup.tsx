"use client"
import Image from "next/image"
import { useState, useEffect } from "react"
import { useCart } from "@/components/CartContext"

const products = [
  { id: 1, name: "Green Detox", price: 18000, img: "/image/juice-green.jpg" },
  { id: 2, name: "Yellow Immunity", price: 18000, img: "/image/juice-yellow.jpg" },
  { id: 3, name: "Red Series", price: 18000, img: "/image/juice-orange.jpg" },
  { id: 4, name: "Sunrise", price: 18000, img: "/image/juice-orange.jpg" },
  { id: 5, name: "Beetroot", price: 18000, img: "/image/juice-redseries.jpg" },
]

const planInfo = {
  "7hari": { title: "7 Hari Detox Plan", limit: 7, fixedPrice: 120000 },
  "14hari": { title: "14 Hari Vitality Plan", limit: 14, fixedPrice: 230000 },
  "30hari": { title: "30 Hari Premium Plan", limit: 30, fixedPrice: 450000 },
  reguler: { title: "Reguler Plan", limit: Infinity, fixedPrice: 0 },
}

export default function PaketPopup({ planId, onClose }: { planId: string; onClose: () => void }) {
  const { addItem } = useCart()
  const info = planInfo[planId as keyof typeof planInfo]
  const [selected, setSelected] = useState<Record<number, number>>({})
  const [show, setShow] = useState(false)

  useEffect(() => {
  const timer = setTimeout(() => setShow(true), 10)
  return () => clearTimeout(timer)
}, [])

  const totalSelected = Object.values(selected).reduce((a, b) => a + b, 0)
  const totalPrice =
    planId === "reguler"
      ? Object.entries(selected).reduce(
          (sum, [id, qty]) => sum + qty * (products.find((p) => p.id === Number(id))?.price || 0),
          0
        )
      : info.fixedPrice

  const handleAdd = (id: number) => {
    setSelected((prev) => {
      const totalNow = Object.values(prev).reduce((a, b) => a + b, 0)
      if (planId !== "reguler" && totalNow >= info.limit) return prev
      return { ...prev, [id]: (prev[id] || 0) + 1 }
    })
  }

  const handleRemove = (id: number) =>
    setSelected((prev) => {
      const next = { ...prev }
      if (next[id] > 1) next[id] -= 1
      else delete next[id]
      return next
    })

  const handleConfirm = () => {
    Object.entries(selected).forEach(([id, qty]) => {
      const prod = products.find((p) => p.id === Number(id))
      if (prod) addItem(prod.id, prod.name, prod.price)
    })
    setShow(false)
    setTimeout(() => onClose(), 300)
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end md:items-center justify-center bg-black/40 backdrop-blur-sm px-3">
      <div
        className={`bg-white w-full max-w-[520px] rounded-t-3xl md:rounded-3xl shadow-[0_10px_40px_rgba(15,163,168,0.12)] overflow-hidden transition-all duration-400 ease-out ${
          show ? "translate-y-0 opacity-100 md:scale-100" : "translate-y-full opacity-0 md:scale-95"
        }`}
        style={{ maxHeight: "90vh", display: "flex", flexDirection: "column" }}
      >
        {/* Close */}
        <button
          onClick={() => {
            setShow(false)
            setTimeout(() => onClose(), 300)
          }}
          className="absolute top-3 right-3 bg-[#0FA3A8] text-white w-8 h-8 rounded-full text-sm font-bold hover:bg-[#0DC1C7]"
        >
          ✕
        </button>

        {/* Header */}
        <div className="p-5 md:p-6 text-center border-b border-[#e6eeee]/60 bg-gradient-to-r from-[#f9fbfb] to-white">
          <h3 className="font-playfair text-xl md:text-2xl font-semibold text-[#0B4B50] mb-1">
            {info.title}
          </h3>
          <p className="text-gray-600 text-xs md:text-sm">
            {planId === "reguler"
              ? "Pilih produk sesukamu — total harga otomatis muncul."
              : `Pilih ${info.limit} botol sesuai selera kamu.`}
          </p>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-5 md:p-6 bg-[#f9fbfb]">
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mb-4">
            {products.map((p) => (
              <div
                key={p.id}
                className="group border border-[#e6eeee]/70 rounded-2xl bg-white shadow-sm hover:shadow-[0_6px_20px_rgba(15,163,168,0.12)] hover:-translate-y-0.5 transition-all duration-300 overflow-hidden"
              >
                <div className="relative w-full h-[85px]">
                  <Image
                    src={p.img}
                    alt={p.name}
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/15 to-transparent" />
                </div>
                <div className="p-2.5 flex flex-col text-center items-center">
                  <h4 className="font-semibold text-[#0B4B50] text-xs mb-1">{p.name}</h4>
                  <div className="flex items-center justify-center gap-1.5">
                    <button
                      onClick={() => handleRemove(p.id)}
                      className="bg-[#E8C46B] text-[#0B4B50] px-2 py-0.5 rounded-full text-xs font-semibold hover:brightness-95 active:scale-95"
                    >
                      –
                    </button>
                    <span className="font-bold w-4 text-center text-xs">
                      {selected[p.id] || 0}
                    </span>
                    <button
                      onClick={() => handleAdd(p.id)}
                      className="bg-gradient-to-r from-[#0FA3A8] to-[#0B4B50] text-white px-2 py-0.5 rounded-full text-xs font-semibold shadow-sm hover:brightness-110 active:scale-95"
                    >
                      +
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Footer */}
        <div className="border-t border-[#e6eeee]/60 bg-white p-4 text-center sticky bottom-0">
          <p className="text-xs text-gray-600 mb-0.5">
            Total produk: <b>{totalSelected}</b>{" "}
            {planId !== "reguler" && `/ ${info.limit} botol`}
          </p>
          <p className="text-base font-bold text-[#0FA3A8] mb-2">
            Total:{" "}
            {totalPrice.toLocaleString("id-ID", { style: "currency", currency: "IDR" })}
          </p>
          <button
            onClick={handleConfirm}
            disabled={planId !== "reguler" && totalSelected !== info.limit}
            className={`px-8 py-2.5 rounded-full font-semibold text-white text-sm transition-all ${
              planId !== "reguler" && totalSelected !== info.limit
                ? "bg-gray-300 cursor-not-allowed"
                : "bg-gradient-to-r from-[#0FA3A8] to-[#0B4B50] hover:shadow-[0_0_18px_rgba(15,163,168,0.3)]"
            }`}
          >
            {planId === "reguler" ? "Pesan Sekarang" : "Ambil Paket"}
          </button>
        </div>
      </div>
    </div>
  )
}
