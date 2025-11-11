"use client"

export default function ProductCard({
  name,
  price,
  img,
}: {
  name: string
  price: number
  img: string
}) {
  return (
    <div className="bg-white rounded-2xl border border-[#e6eeee] shadow-sm overflow-hidden">
      <img src={img} alt={name} className="w-full h-40 object-cover" />
      <div className="p-4">
        <h3 className="font-semibold text-[#0B4B50]">{name}</h3>
        <p className="text-sm text-[#557577] mt-1">Rp {price.toLocaleString("id-ID")}</p>
      </div>
    </div>
  )
}
