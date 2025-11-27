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
    img: "/product/Golden-detox.jpg",
    color: "#F4B940",
    slogan: "Clean Your Body, Boost Your Day.",
    ingredients: ["Kunyit", "Wortel", "Jahe", "Jeruk", "Lemon"],
    desc: "Detoks kuat untuk mendukung metabolisme & membantu membersihkan tubuh dari dalam.",
  },
  {
    id: "green-revive",
    name: "Green Revive",
    price: 18000,
    img: "/images/products/green-revive.png",
    color: "#4CAF50",
    slogan: "Fresh Green Energy in Every Sip.",
    ingredients: ["Pakcoy", "Nanas", "Timun"],
    desc: "Memberikan hidrasi, energi hijau, dan rasa segar alami sepanjang hari.",
  },
  {
    id: "sunrise-boost",
    name: "Sunrise Boost",
    price: 18000,
    img: "/product/Sunrise-Boost.jpg",
    color: "#FFA024",
    slogan: "Start Your Day with Natural Power.",
    ingredients: ["Wortel", "Apel", "Tomat"],
    desc: "Energi pagi kaya vitamin untuk bantu tubuh lebih siap memulai hari.",
  },
  {
    id: "lemongrass-fresh",
    name: "Lemongrass Fresh",
    price: 18000,
    img: "/product/juice-redseries.jpg",
    color: "#E6F89A",
    slogan: "Calm. Fresh. Naturally Bright.",
    ingredients: ["Lemon", "Serai"],
    desc: "Rasa segar menenangkan untuk mood lebih stabil dan tubuh terasa lebih ringan.",
  },
  {
    id: "yellow-immunity",
    name: "Yellow Immunity",
    price: 18000,
    img: "/product/Yellow-Immunity.jpg",
    color: "#FFE65A",
    slogan: "Stronger Immunity, Brighter Day.",
    ingredients: ["Nanas", "Lemon"],
    desc: "Vitamin C tinggi yang membantu memperkuat sistem imun secara alami.",
  },
  {
    id: "red-vitality",
    name: "Red Vitality",
    price: 18000,
    img: "/product/Red-Vitality.jpg",
    color: "#C9253E",
    slogan: "Natural Strength from Within.",
    ingredients: ["Bit", "Nanas", "Apel"],
    desc: "Booster stamina alami untuk menjaga performa tubuh sepanjang hari.",
  },
  {
    id: "paket-detox-3hari",
    name: "Paket Detox 3 Hari",
    price: 320000,
    img: "/image/paket-detox.jpg",
    isPackage: true,
    desc: "6 botol/hari kombinasi varian sehat untuk detoks total selama 3 hari.",
  },
]
