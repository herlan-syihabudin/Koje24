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

// 🔥 Tipe promo (belum dipakai hitung harga — disimpan dulu)
export type Promo = {
  kode: string
  tipe: string
  nilai: string
  minimal: number
  maxDiskon: number | null
}

export interface CartState {
  items: CartItem[]
  totalQty: number
  totalPrice: number
  addItem: (item: Omit<CartItem, "qty">) => void
  removeItem: (id: string) => void
  clearCart: () => void

  // Optional
  getQty: (id: string) => number
  getTotalForItem: (id: string) => number

  // 🔥 Promo
  promos: Promo[]
  addPromo: (promo: Promo) => void
  removePromo: (kode: string) => void
  clearPromos: () => void
}

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],
      totalQty: 0,
      totalPrice: 0,

      addItem: (item) => {
        const items = [...get().items]
        const exist = items.find((i) => i.id === item.id)

        if (exist) {
          exist.qty += 1
        } else {
          items.push({ ...item, qty: 1 })
        }

        const totalQty = items.reduce((s, i) => s + i.qty, 0)
        const totalPrice = items.reduce((s, i) => s + i.qty * i.price, 0)

        set({ items, totalQty, totalPrice })
      },

      removeItem: (id) => {
        let items = [...get().items]
        const exist = items.find((i) => i.id === id)
        if (!exist) return

        if (exist.qty > 1) {
          exist.qty -= 1
        } else {
          items = items.filter((i) => i.id !== id)
        }

        const totalQty = items.reduce((s, i) => s + i.qty, 0)
        const totalPrice = items.reduce((s, i) => s + i.qty * i.price, 0)

        set({ items, totalQty, totalPrice })
      },

      clearCart: () =>
        set({ items: [], totalQty: 0, totalPrice: 0, promos: [] }),

      // 🔥 Utility
      getQty: (id) => {
        const item = get().items.find((i) => i.id === id)
        return item?.qty || 0
      },

      getTotalForItem: (id) => {
        const item = get().items.find((i) => i.id === id)
        return item ? item.qty * item.price : 0
      },

      // 🔥 PROMO — tidak menghitung harga, hanya menyimpan dulu
      promos: [],
      addPromo: (promo) =>
        set((s) => {
          // no duplicate kode promo
          if (s.promos.find((p) => p.kode === promo.kode)) return s
          return { promos: [...s.promos, promo] }
        }),

      removePromo: (kode) =>
        set((s) => ({
          promos: s.promos.filter((p) => p.kode !== kode),
        })),

      clearPromos: () => set({ promos: [] }),
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
