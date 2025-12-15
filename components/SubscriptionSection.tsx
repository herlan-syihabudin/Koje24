"use client"

type Plan = {
  id: string
  title: string
  desc: string
  price: number
  popular?: boolean
}

const plans: Plan[] = [
  {
    id: "7hari",
    title: "7 Hari Detox Plan",
    desc: "Paket pemula untuk detoks ringan — segar dan ringan setiap hari.",
    price: 120000,
  },
  {
    id: "14hari",
    title: "14 Hari Vitality Plan",
    desc: "Cocok untuk menjaga energi & metabolisme tetap seimbang sepanjang minggu.",
    price: 230000,
    popular: true, // ⭐ PALING DIREKOMENDASIKAN
  },
  {
    id: "30hari",
    title: "30 Hari Premium Plan",
    desc: "Program detoks maksimal selama satu bulan penuh untuk hasil optimal dan berkelanjutan.",
    price: 450000,
  },
  {
    id: "reguler",
    title: "Reguler Plan",
    desc: "Pilih varian favoritmu — fleksibel, praktis, dan tetap sehat setiap hari.",
    price: 18000,
  },
]

export default function SubscriptionSection() {
  const openPackage = (name: string, price: number) => {
    window.dispatchEvent(
      new CustomEvent("open-package" as any, {
        detail: { name, price },
      } as any)
    )
  }

  return (
    <section
      id="langganan"
      className="relative bg-gradient-to-b from-[#f9fdfd] to-[#f1fafa] text-[#0B4B50] py-24 px-6 md:px-14 lg:px-24 overflow-hidden"
    >
      {/* Background gradasi lembut */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_bottom_right,rgba(15,163,168,0.08),transparent_70%)] pointer-events-none" />

      {/* Header */}
      <div className="text-center mb-16 relative z-10">
        <h2 className="font-playfair text-3xl md:text-4xl font-semibold mb-4 text-[#0B4B50]">
          Langganan Paket KOJE24
        </h2>
        <p className="font-inter text-gray-600 text-base md:text-lg max-w-2xl mx-auto leading-relaxed">
          Pilih paket sesuai kebutuhan <b>detoks & energi harianmu</b> — praktis,
          hemat, dan tetap alami.
          <br />
          Nikmati{" "}
          <span className="text-[#0FA3A8] font-semibold">
            #SehatBarengKOJE
          </span>{" "}
          setiap hari 🍃
        </p>
      </div>

      {/* Grid Paket */}
      <div className="relative z-10 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 max-w-[1280px] mx-auto">
        {plans.map((p) => (
          <div
            key={p.id}
            className="
              group bg-white rounded-3xl border border-[#e6eeee]/60
              shadow-[0_5px_25px_rgba(0,0,0,0.05)]
              hover:-translate-y-3
              hover:shadow-[0_10px_35px_rgba(15,163,168,0.25)]
              transition-all duration-500
              flex flex-col p-6 text-center relative overflow-hidden
            "
          >
            {/* BADGE POPULAR */}
            {p.popular && (
  <span
    className="
      absolute top-1 left-1
      bg-[#0FA3A8]/90 text-white
      text-[11px] font-semibold
      px-3 py-1 rounded-full
      shadow-sm
      backdrop-blur
    "
  >
    Favorit
  </span>
)}

            {/* Accent line */}
            <div className="absolute inset-x-0 top-0 h-[5px] bg-gradient-to-r from-[#0FA3A8] to-[#E8C46B] opacity-70 group-hover:opacity-100 transition-opacity duration-500" />

            <h3 className="font-playfair text-xl font-semibold mb-3 text-[#0B4B50]">
              {p.title}
            </h3>

            <p className="font-inter text-sm text-gray-700 mb-5 flex-1 leading-relaxed px-2">
              {p.desc}
            </p>

            <div className="text-lg font-bold text-[#0FA3A8] mb-6 tracking-tight">
              {p.id === "reguler"
                ? "Harga per botol Rp18.000"
                : `Rp${p.price.toLocaleString("id-ID")}`}
            </div>

            <button
              onClick={() => openPackage(p.title, p.price)}
              className="
                bg-[#0FA3A8] hover:bg-[#0DC1C7]
                text-white font-semibold rounded-full
                py-2.5 px-7
                shadow-[0_4px_15px_rgba(15,163,168,0.3)]
                hover:shadow-[0_6px_25px_rgba(15,163,168,0.4)]
                transition-all duration-300
                active:scale-95
              "
            >
              Ambil Paket
            </button>
          </div>
        ))}
      </div>
    </section>
  )
}
