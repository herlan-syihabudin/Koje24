// stores/cartStore.ts
import { create } from "zustand"
import { persist, createJSONStorage } from "zustand/middleware"

// ================== TYPE ==================
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
}

// ================== STATE ==================
interface CartState {
  items: CartItem[]
  totalQty: number
  totalPrice: number

  promo: Promo | null

  addItem: (item: Omit<CartItem, "qty">) => void
  removeItem: (id: string) => void
  clearCart: () => void

  setPromo: (promo: Promo) => void
  clearPromo: () => void

  getDiscount: () => number
  getFinalTotal: () => number
}

// ================== STORE ==================
export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],
      totalQty: 0,
      totalPrice: 0,

      promo: null,

      // ================= CART =================
      addItem: (item) => {
        const items = [...get().items]
        const exist = items.find((i) => i.id === item.id)

        if (exist) exist.qty += 1
        else items.push({ ...item, qty: 1 })

        set({
          items,
          totalQty: items.reduce((s, i) => s + i.qty, 0),
          totalPrice: items.reduce((s, i) => s + i.qty * i.price, 0),
        })
      },

      removeItem: (id) => {
        let items = [...get().items]
        const exist = items.find((i) => i.id === id)

        if (!exist) return
        if (exist.qty > 1) exist.qty -= 1
        else items = items.filter((i) => i.id !== id)

        set({
          items,
          totalQty: items.reduce((s, i) => s + i.qty, 0),
          totalPrice: items.reduce((s, i) => s + i.qty * i.price, 0),
        })
      },

      clearCart: () =>
        set({
          items: [],
          totalQty: 0,
          totalPrice: 0,
          promo: null,
        }),

      // ================= PROMO =================
      setPromo: (promo) => set({ promo }),
      clearPromo: () => set({ promo: null }),

      // ================= CALC =================
      getDiscount: () => {
        const { promo, totalPrice } = get()
        if (!promo) return 0
        if (totalPrice < promo.minimal) return 0

        let d = 0
        if (promo.tipe === "percent") {
          d = (totalPrice * promo.nilai) / 100
        } else if (promo.tipe === "flat") {
          d = promo.nilai
        }

        if (promo.maxDiskon) d = Math.min(d, promo.maxDiskon)
        return Math.floor(d)
      },

      getFinalTotal: () => {
        const { totalPrice } = get()
        return Math.max(totalPrice - get().getDiscount(), 0)
      },
    }),
    {
      name: "koje24-cart",
      storage:
        typeof window !== "undefined"
          ? createJSONStorage(() => localStorage)
          : undefined,
    }
  )
)
