// stores/cartStore.ts
import { create } from "zustand"
import { persist, createJSONStorage } from "zustand/middleware"

// ================== TYPE CART ==================
export type CartItem = {
  id: string
  name: string
  price: number
  img?: string
  qty: number
}

export type Promo = {
  kode: string
  tipe: string // "persen" | "nominal"
  nilai: string // contoh "20" atau "15000"
  minimal: number
  maxDiskon: number | null
}

// ================== STATE INTERFACE ==================
export interface CartState {
  items: CartItem[]
  totalQty: number
  totalPrice: number

  // PROMO LIST (jika mau lebih dari satu yang disimpan user)
  promos: Promo[]

  // PROMO AKTIF (yang dipakai untuk perhitungan)
  promoLabel: string
  promoAmount: number

  addItem: (item: Omit<CartItem, "qty">) => void
  removeItem: (id: string) => void
  clearCart: () => void
  getQty: (id: string) => number
  getTotalForItem: (id: string) => number

  addPromo: (promo: Promo) => void
  removePromo: (kode: string) => void
  clearPromos: () => void

  setPromo: (label: string, amount: number) => void
  clearPromo: () => void
}

// ======================================================
// 🧠 STORE
// ======================================================
export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],
      totalQty: 0,
      totalPrice: 0,

      promos: [],

      // PROMO AKTIF YANG DIPAKAI DI CHECKOUT
      promoLabel: "",
      promoAmount: 0,

      // ======================
      // CART CORE
      // ======================
      addItem: (item) => {
        const items = [...get().items]
        const exist = items.find((i) => i.id === item.id)

        if (exist) exist.qty += 1
        else items.push({ ...item, qty: 1 })

        const totalQty = items.reduce((s, i) => s + i.qty, 0)
        const totalPrice = items.reduce((s, i) => s + i.qty * i.price, 0)
        set({ items, totalQty, totalPrice })
      },

      removeItem: (id) => {
        let items = [...get().items]
        const exist = items.find((i) => i.id === id)

        if (!exist) return
        if (exist.qty > 1) exist.qty -= 1
        else items = items.filter((i) => i.id !== id)

        const totalQty = items.reduce((s, i) => s + i.qty, 0)
        const totalPrice = items.reduce((s, i) => s + i.qty * i.price, 0)
        set({ items, totalQty, totalPrice })
      },

      clearCart: () =>
        set({
          items: [],
          totalQty: 0,
          totalPrice: 0,
          promos: [],
          promoLabel: "",
          promoAmount: 0,
        }),

      getQty: (id) => {
        const item = get().items.find((i) => i.id === id)
        return item?.qty || 0
      },

      getTotalForItem: (id) => {
        const item = get().items.find((i) => i.id === id)
        return item ? item.qty * item.price : 0
      },

      // ======================
      // PROMO LIST SYSTEM
      // ======================
      addPromo: (promo) =>
        set((s) =>
          s.promos.find((p) => p.kode === promo.kode)
            ? s
            : { promos: [...s.promos, promo] }
        ),

      removePromo: (kode) =>
        set((s) => ({
          promos: s.promos.filter((p) => p.kode !== kode),
        })),

      clearPromos: () => set({ promos: [] }),

      // ======================
      // PROMO AKTIF UTAMA
      // ======================
      setPromo: (label, amount) =>
        set({ promoLabel: label, promoAmount: amount }),

      clearPromo: () =>
        set({ promoLabel: "", promoAmount: 0 }),
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
