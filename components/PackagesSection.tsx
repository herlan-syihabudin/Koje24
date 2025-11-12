"use client"

const plans = [
  { id: "7", name: "7 Hari Detox Plan", price: 120000, desc: "Cocok untuk start ringan." },
  { id: "14", name: "14 Hari Vitality", price: 230000, desc: "Stamina & kebiasaan sehat." },
  { id: "30", name: "30 Hari Premium Plan", price: 450000, desc: "Perubahan terasa maksimal." },
]

export default function PackagesSection() {
  const openPackage = (name: string, price: number) => {
    window.dispatchEvent(new CustomEvent("open-package", { detail: { name, price } }))
  }

  return (
    <section id="langganan" className="bg-white py-16 md:py-24 px-6 md:px-14 lg:px-24">
      <div className="text-center mb-10">
        <h2 className="font-playfair text-3xl md:text-4xl font-semibold mb-3 text-[#0B4B50]">
          Paket Hemat KOJE24
        </h2>
        <p className="text-gray-600 max-w-2xl mx-auto">
          Pilih paket siap minum — langsung checkout via WhatsApp tanpa masuk keranjang.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
        {plans.map((p) => (
          <div
            key={p.id}
            className="border border-[#e6eeee] rounded-2xl p-6 bg-[#f9fbfb] text-center md:text-left shadow-sm hover:shadow-[0_6px_25px_rgba(15,163,168,0.1)] transition-all duration-300"
          >
            <h3 className="text-lg font-semibold text-[#0B4B50] mb-1">{p.name}</h3>
            <p className="text-sm text-gray-600 mb-4">{p.desc}</p>
            <div className="text-2xl font-bold text-[#0FA3A8] mb-4">
              Rp{p.price.toLocaleString("id-ID")}
            </div>
            <button
              onClick={() => openPackage(p.name, p.price)}
              className="w-full bg-[#0FA3A8] text-white py-2.5 rounded-full font-semibold hover:bg-[#0DC1C7] transition-all"
            >
              Ambil Paket
            </button>
          </div>
        ))}
      </div>
    </section>
  )
}
