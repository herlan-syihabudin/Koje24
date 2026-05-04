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
  expiresAt?: Date
}

// ================== STATE ==================
interface CartState {
  items: CartItem[]
  promo: Promo | null
  shippingCost: number

  // ACTION
  addItem: (item: Omit<CartItem, "qty">) => void
  removeItem: (id: string) => void
  clearCart: () => void

  setPromo: (promo: Promo) => void
  clearPromo: () => void
  setShippingCost: (cost: number) => void

  // DERIVED
  totalQty: () => number
  totalPrice: () => number
  getDiscount: () => number
  getFinalTotal: () => number
}

// ================== STORE ==================
export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],
      promo: null,
      shippingCost: 0,

      // ================= CART =================
      addItem: (item) => {
        const items = [...get().items]
        const exist = items.find((i) => i.id === item.id)

        if (exist) exist.qty += 1
        else items.push({ ...item, qty: 1 })

        set({ items })
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

        set({
          items,
          // auto clear promo kalau cart kosong
          promo: items.length === 0 ? null : get().promo
        })
      },

      clearCart: () =>
        set({
          items: [],
          promo: null,
          shippingCost: 0
        }),

      // ================= PROMO =================
      setPromo: (promo) => {
        // validasi expired
        if (promo.expiresAt && new Date() > promo.expiresAt) {
          console.warn("Promo expired")
          return
        }

        set({ promo })
      },

      clearPromo: () => set({ promo: null }),

      setShippingCost: (cost) => set({ shippingCost: cost }),

      // ================= DERIVED =================
      totalQty: () =>
        get().items.reduce((sum, i) => sum + i.qty, 0),

      totalPrice: () =>
        get().items.reduce((sum, i) => sum + i.qty * i.price, 0),

      getDiscount: () => {
        const { promo, shippingCost } = get()
        const subtotal = get().totalPrice()

        if (!promo) return 0
        if (subtotal < promo.minimal) return 0

        let discount = 0

        switch (promo.tipe) {
          case "percent":
            discount = (subtotal * promo.nilai) / 100
            break
          case "flat":
            discount = promo.nilai
            break
          case "free_shipping":
            discount = shippingCost
            break
          case "cashback":
            discount = promo.nilai
            break
        }

        if (promo.maxDiskon) {
          discount = Math.min(discount, promo.maxDiskon)
        }

        return Math.floor(discount)
      },

      getFinalTotal: () => {
        const subtotal = get().totalPrice()
        const discount = get().getDiscount()
        return Math.max(subtotal - discount, 0)
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
