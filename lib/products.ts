// lib/products.ts

export type Product = {
  id: string
  name: string
  desc?: string
  description?: string
  price: number
  img: string
  color?: string
  ingredients?: string[]
  slogan?: string
  isPackage?: boolean

  // SEO & AI FRIENDLY
  category?: string
  benefits?: string[]
  goodFor?: string[]
  consumeTime?: string

  // ✅ TAMBAHAN UNTUK GOOGLE SHOPPING / STRUCTURED DATA
  brand?: string
  shippingDetails?: {
    area: string
    cost: string
    estimatedDays: string
  }
  returnPolicy?: string
}

export const products: Product[] = [
  {
    id: "golden-detox",
    name: "Golden Detox",
    price: 18000,
    img: "/product/Golden-detox.webp",
    color: "#F4B940",
    slogan: "Clean Your Body, Boost Your Day.",
    ingredients: ["Kunyit", "Wortel", "Jahe", "Jeruk", "Lemon"],
    desc: "Detoks kuat untuk mendukung metabolisme & membantu membersihkan tubuh dari dalam.",
    description: "Detoks kuat untuk mendukung metabolisme & membantu membersihkan tubuh dari dalam.",

    category: "Detox & Metabolisme",
    benefits: [
      "Membantu proses detoks alami",
      "Mendukung metabolisme tubuh",
      "Membantu membersihkan tubuh dari dalam",
    ],
    goodFor: ["Program detoks", "Pola hidup sehat", "Konsumsi setelah makan berat"],
    consumeTime: "Pagi hari atau sore hari",

    // ✅ TAMBAHAN
    brand: "KOJE24",
    shippingDetails: {
      area: "Jabodetabek",
      cost: "Gratis untuk pembelian 3+ botol",
      estimatedDays: "1-2 hari"
    },
    returnPolicy: "Tidak bisa retur untuk produk minuman segar"
  },

  {
    id: "green-revive",
    name: "Green Revive",
    price: 18000,
    img: "/product/green-revive.webp",
    color: "#4CAF50",
    slogan: "Fresh Green Energy in Every Sip.",
    ingredients: ["Pakcoy", "Nanas", "Timun"],
    desc: "Memberikan hidrasi, energi hijau, dan rasa segar alami sepanjang hari.",
    description: "Memberikan hidrasi, energi hijau, dan rasa segar alami sepanjang hari.",

    category: "Detox & Pencernaan",
    benefits: [
      "Membantu proses detoks alami",
      "Mendukung pencernaan",
      "Memberikan energi ringan & segar",
    ],
    goodFor: ["Pekerja aktif", "Gaya hidup sehat", "Konsumsi harian"],
    consumeTime: "Pagi hari atau siang hari",

    // ✅ TAMBAHAN
    brand: "KOJE24",
    shippingDetails: {
      area: "Jabodetabek",
      cost: "Gratis untuk pembelian 3+ botol",
      estimatedDays: "1-2 hari"
    },
    returnPolicy: "Tidak bisa retur untuk produk minuman segar"
  },

  {
    id: "sunrise-boost",
    name: "Sunrise Boost",
    price: 18000,
    img: "/product/Sunrise-Boost.webp",
    color: "#FFA024",
    slogan: "Start Your Day with Natural Power.",
    ingredients: ["Wortel", "Apel", "Tomat"],
    desc: "Energi pagi kaya vitamin untuk bantu tubuh lebih siap memulai hari.",
    description: "Energi pagi kaya vitamin untuk bantu tubuh lebih siap memulai hari.",

    category: "Energi & Vitalitas",
    benefits: [
      "Memberikan energi alami",
      "Mendukung aktivitas pagi",
      "Kaya vitamin untuk tubuh",
    ],
    goodFor: ["Sarapan sehat", "Aktivitas pagi", "Pekerja & pelajar"],
    consumeTime: "Pagi hari",

    // ✅ TAMBAHAN
    brand: "KOJE24",
    shippingDetails: {
      area: "Jabodetabek",
      cost: "Gratis untuk pembelian 3+ botol",
      estimatedDays: "1-2 hari"
    },
    returnPolicy: "Tidak bisa retur untuk produk minuman segar"
  },

  {
    id: "lemongrass-fresh",
    name: "Lemongrass Fresh",
    price: 18000,
    img: "/product/lemongrass-fresh.webp",
    color: "#E6F89A",
    slogan: "Calm. Fresh. Naturally Bright.",
    ingredients: ["Lemon", "Serai"],
    desc: "Rasa segar menenangkan untuk mood lebih stabil dan tubuh terasa lebih ringan.",
    description: "Rasa segar menenangkan untuk mood lebih stabil dan tubuh terasa lebih ringan.",

    category: "Relaksasi & Mood",
    benefits: [
      "Membantu menenangkan tubuh",
      "Memberikan rasa segar alami",
      "Mendukung keseimbangan mood",
    ],
    goodFor: ["Relaksasi", "Stres ringan", "Konsumsi sore hari"],
    consumeTime: "Sore hari atau malam hari",

    // ✅ TAMBAHAN
    brand: "KOJE24",
    shippingDetails: {
      area: "Jabodetabek",
      cost: "Gratis untuk pembelian 3+ botol",
      estimatedDays: "1-2 hari"
    },
    returnPolicy: "Tidak bisa retur untuk produk minuman segar"
  },

  {
    id: "yellow-immunity",
    name: "Yellow Immunity",
    price: 18000,
    img: "/product/Yellow-Immunity.webp",
    color: "#FFE65A",
    slogan: "Stronger Immunity, Brighter Day.",
    ingredients: ["Nanas", "Lemon"],
    desc: "Vitamin C tinggi yang membantu memperkuat sistem imun secara alami.",
    description: "Vitamin C tinggi yang membantu memperkuat sistem imun secara alami.",

    category: "Imunitas",
    benefits: [
      "Membantu meningkatkan daya tahan tubuh",
      "Sumber vitamin C alami",
      "Mendukung kesehatan harian",
    ],
    goodFor: ["Daya tahan tubuh", "Cuaca tidak menentu", "Konsumsi harian"],
    consumeTime: "Pagi hari atau siang hari",

    // ✅ TAMBAHAN
    brand: "KOJE24",
    shippingDetails: {
      area: "Jabodetabek",
      cost: "Gratis untuk pembelian 3+ botol",
      estimatedDays: "1-2 hari"
    },
    returnPolicy: "Tidak bisa retur untuk produk minuman segar"
  },

  {
    id: "red-vitality",
    name: "Red Vitality",
    price: 18000,
    img: "/product/Red-Vitality.webp",
    color: "#C9253E",
    slogan: "Natural Strength from Within.",
    ingredients: ["Bit", "Nanas", "Apel"],
    desc: "Booster stamina alami untuk menjaga performa tubuh sepanjang hari.",
    description: "Booster stamina alami untuk menjaga performa tubuh sepanjang hari.",

    category: "Stamina & Vitalitas",
    benefits: [
      "Membantu meningkatkan stamina",
      "Mendukung performa tubuh",
      "Energi alami tanpa gula tambahan",
    ],
    goodFor: ["Aktivitas fisik", "Hari padat aktivitas", "Daya tahan tubuh"],
    consumeTime: "Siang hari atau sore hari",

    // ✅ TAMBAHAN
    brand: "KOJE24",
    shippingDetails: {
      area: "Jabodetabek",
      cost: "Gratis untuk pembelian 3+ botol",
      estimatedDays: "1-2 hari"
    },
    returnPolicy: "Tidak bisa retur untuk produk minuman segar"
  },

  {
    id: "paket-detox-3hari",
    name: "Paket Detox 3 Hari",
    price: 320000,
    img: "/image/paket-detox.webp",
    isPackage: true,
    desc: "6 botol/hari kombinasi varian sehat untuk detoks total selama 3 hari.",
    description: "6 botol/hari kombinasi varian sehat untuk detoks total selama 3 hari.",

    category: "Program Detox",
    benefits: [
      "Program detoks terstruktur",
      "Kombinasi varian terbaik",
      "Membantu reset tubuh secara alami",
    ],
    goodFor: ["Program detoks", "Reset tubuh", "Gaya hidup sehat"],
    consumeTime: "Sesuai jadwal program",

    // ✅ TAMBAHAN (khusus paket)
    brand: "KOJE24",
    shippingDetails: {
      area: "Jabodetabek",
      cost: "Gratis ongkir untuk semua paket",
      estimatedDays: "1-2 hari"
    },
    returnPolicy: "Tidak bisa retur untuk paket detox (produk minuman segar)"
  },
]

// ⭐ FUNGSI UNTUK AKSES DATA
export function getAllProducts(): Product[] {
  return products
}

export function getProductBySlug(slug: string): Product | undefined {
  return products.find((product) => product.id === slug)
}

export function getProductById(id: string): Product | undefined {
  return products.find((product) => product.id === id)
}
