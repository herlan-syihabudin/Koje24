// stores/cartStore.ts
import { create } from "zustand"
import { persist, createJSONStorage } from "zustand/middleware"

export type CartItem = {
  id: string
  name: string
  price: number
  img?: string
  qty: number
}

export type Promo = {
  kode: string
  tipe: "percent" | "flat" | "free_shipping" | "cashback"
  nilai: number
  minimal: number
  maxDiskon: number | null
  expiresAt?: Date
}

interface CartState {
  items: CartItem[]
  promo: Promo | null
  shippingCost: number
  
  // ✅ SEKARANG JADI STATE (BUKAN FUNGSI)
  totalQty: number
  totalPrice: number

  addItem: (item: Omit<CartItem, "qty">) => void
  removeItem: (id: string) => void
  clearCart: () => void
  setPromo: (promo: Promo) => void
  clearPromo: () => void
  setShippingCost: (cost: number) => void

  // ✅ TETAP FUNGSI UNTUK YANG BUTUH PERHITUNGAN DINAMIS
  getDiscount: () => number
  getFinalTotal: () => number
}

// Helper untuk hitung total
const calculateTotals = (items: CartItem[]) => ({
  totalQty: items.reduce((sum, i) => sum + i.qty, 0),
  totalPrice: items.reduce((sum, i) => sum + i.qty * i.price, 0),
})

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],
      promo: null,
      shippingCost: 0,
      totalQty: 0,
      totalPrice: 0,

      addItem: (item) => {
        const items = [...get().items]
        const exist = items.find((i) => i.id === item.id)
        if (exist) exist.qty += 1
        else items.push({ ...item, qty: 1 })
        const { totalQty, totalPrice } = calculateTotals(items)
        set({ items, totalQty, totalPrice })
      },

      removeItem: (id) => {
        let items = [...get().items]
        const exist = items.find((i) => i.id === id)
        if (!exist) return
        if (exist.qty > 1) exist.qty -= 1
        else items = items.filter((i) => i.id !== id)
        const { totalQty, totalPrice } = calculateTotals(items)
        set({ items, totalQty, totalPrice, promo: items.length === 0 ? null : get().promo })
      },

      clearCart: () => set({ items: [], totalQty: 0, totalPrice: 0, promo: null, shippingCost: 0 }),

      setPromo: (promo) => {
        if (promo.expiresAt && new Date() > promo.expiresAt) {
          console.warn("Promo expired")
          return
        }
        set({ promo })
      },

      clearPromo: () => set({ promo: null }),
      setShippingCost: (cost) => set({ shippingCost: cost }),

      getDiscount: () => {
        const { promo, shippingCost, totalPrice } = get()
        if (!promo || totalPrice < promo.minimal) return 0
        let discount = 0
        switch (promo.tipe) {
          case "percent": discount = (totalPrice * promo.nilai) / 100; break
          case "flat": discount = promo.nilai; break
          case "free_shipping": discount = shippingCost; break
          case "cashback": discount = promo.nilai; break
        }
        if (promo.maxDiskon) discount = Math.min(discount, promo.maxDiskon)
        return Math.floor(discount)
      },

      getFinalTotal: () => Math.max(get().totalPrice - get().getDiscount(), 0),
    }),
    {
      name: "koje24-cart",
      storage: typeof window !== "undefined" ? createJSONStorage(() => localStorage) : undefined,
    }
  )
)
