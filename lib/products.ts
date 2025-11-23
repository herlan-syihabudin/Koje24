export type Product = {
  id: string
  name: string
  desc?: string
  price: number
  img: string
  color?: string
  ingredients?: string[]
  slogan?: string
  isPackage?: boolean
}

export const products: Product[] = [
  {
    id: "golden-detox",
    name: "Golden Detox",
    price: 18000,
    img: "/images/products/golden-detox.png", // nanti bisa ganti fotonya
    color: "#F4B940",
    desc: "Kunyit • Wortel • Jahe • Jeruk • Lemon — racikan detoks kuat untuk mendukung metabolisme.",
    ingredients: ["Kunyit", "Wortel", "Jahe", "Jeruk", "Lemon"],
    slogan: "Clean Your Body, Boost Your Day.",
  },
  {
    id: "green-revive",
    name: "Green Revive",
    price: 18000,
    img: "/images/products/green-revive.png",
    color: "#4CAF50",
    desc: "Pakcoy • Nanas • Timun — segarkan tubuh, bantu hidrasi, dan tingkatkan vitalitas harian.",
    ingredients: ["Pakcoy", "Nanas", "Timun"],
    slogan: "Fresh Green Energy in Every Sip.",
  },
  {
    id: "sunrise-boost",
    name: "Sunrise Boost",
    price: 18000,
    img: "/images/products/sunrise-boost.png",
    color: "#FFA024",
    desc: "Wortel • Apel • Tomat — energi pagi kaya vitamin untuk bangkit lebih kuat.",
    ingredients: ["Wortel", "Apel", "Tomat"],
    slogan: "Start Your Day with Natural Power.",
  },
  {
    id: "lemongrass-fresh",
    name: "Lemongrass Fresh",
    price: 18000,
    img: "/images/products/lemongrass-fresh.png",
    color: "#E6F89A",
    desc: "Lemon • Serai — rasa segar menenangkan untuk mood lebih stabil dan tubuh terasa ringan.",
    ingredients: ["Lemon", "Serai"],
    slogan: "Calm. Fresh. Naturally Bright.",
  },
  {
    id: "yellow-immunity",
    name: "Yellow Immunity",
    price: 18000,
    img: "/images/products/yellow-immunity.png",
    color: "#FFE65A",
    desc: "Nanas • Lemon — vitamin C tinggi untuk bantu perkuat sistem imun secara alami.",
    ingredients: ["Nanas", "Lemon"],
    slogan: "Stronger Immunity, Brighter Day.",
  },
  {
    id: "red-vitality",
    name: "Red Vitality",
    price: 18000,
    img: "/images/products/red-vitality.png",
    color: "#C9253E",
    desc: "Bit • Nanas • Apel — stamina booster alami untuk aktivitas sepanjang hari.",
    ingredients: ["Bit", "Nanas", "Apel"],
    slogan: "Natural Strength from Within.",
  },
  {
    id: "paket-detox-3hari",
    name: "Paket Detox 3 Hari",
    desc: "6 botol/hari kombinasi varian sehat untuk detoks total selama 3 hari.",
    price: 320000,
    img: "/image/paket-detox.jpg",
    isPackage: true,
  },
]
