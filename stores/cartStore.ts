import { create } from "zustand"
import { persist, createJSONStorage, StateStorage } from "zustand/middleware"

export type CartItem = {
  id: string
  name: string
  price: number
  img?: string       // ✅ FIX 1 — tambahkan img (opsional biar aman)
  qty: number
}

export interface CartState {
  items: CartItem[]
  totalQty: number
  totalPrice: number
  addItem: (item: Omit<CartItem, "qty">) => void   // tetap sama, img ikut kebawa
  removeItem: (id: string) => void
  clearCart: () => void
}

const storage: StateStorage = {
  getItem: (name) => {
    if (typeof window === "undefined") return null
    return localStorage.getItem(name)
  },
  setItem: (name, value) => {
    if (typeof window === "undefined") return
    localStorage.setItem(name, value)
  },
  removeItem: (name) => {
    if (typeof window === "undefined") return
    localStorage.removeItem(name)
  },
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
          // ✅ FIX 2 — img akan ikut masuk di sini
          items.push({ ...item, qty: 1 })
        }

        const totalQty = items.reduce((sum, i) => sum + i.qty, 0)
        const totalPrice = items.reduce((sum, i) => sum + i.qty * i.price, 0)

        set({ items, totalQty, totalPrice })
      },

      removeItem: (id) => {
        let items = [...get().items]
        const exist = items.find((i) => i.id === id)

        if (!exist) return
        if (exist.qty > 1) exist.qty -= 1
        else items = items.filter((i) => i.id !== id)

        const totalQty = items.reduce((sum, i) => sum + i.qty, 0)
        const totalPrice = items.reduce((sum, i) => sum + i.qty * i.price, 0)

        set({ items, totalQty, totalPrice })
      },

      clearCart: () => set({ items: [], totalQty: 0, totalPrice: 0 }),
    }),
    {
      name: "koje24-cart",
      storage: createJSONStorage(() => storage),
    }
  )
)
