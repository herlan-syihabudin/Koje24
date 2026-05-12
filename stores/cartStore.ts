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
  tipe: "percent" | "flat" | "free_shipping"
  nilai: number
  minimal: number
  maxDiskon: number | null
  expiresAt?: string // ISO string
}

interface CartState {
  items: CartItem[]
  promo: Promo | null
  shippingCost: number

  totalQty: number
  totalPrice: number

  addItem: (item: Omit<CartItem, "qty">) => void
  decreaseItem: (id: string) => void
  removeItem: (id: string) => void

  clearCart: () => void

  setPromo: (promo: Promo) => void
  clearPromo: () => void

  setShippingCost: (cost: number) => void

  getDiscount: () => number
  getFinalTotal: () => number
}

const calculateTotals = (items: CartItem[]) => ({
  totalQty: items.reduce((sum, item) => sum + item.qty, 0),
  totalPrice: items.reduce(
    (sum, item) => sum + item.qty * item.price,
    0
  ),
})

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],
      promo: null,
      shippingCost: 0,

      totalQty: 0,
      totalPrice: 0,

      // =========================
      // ADD ITEM
      // =========================
      addItem: (item) => {
        const existing = get().items.find((i) => i.id === item.id)

        const items = existing
          ? get().items.map((i) =>
              i.id === item.id
                ? { ...i, qty: i.qty + 1 }
                : i
            )
          : [...get().items, { ...item, qty: 1 }]

        const { totalQty, totalPrice } = calculateTotals(items)

        set({
          items,
          totalQty,
          totalPrice,
        })
      },

      // =========================
      // DECREASE ITEM QTY
      // =========================
      decreaseItem: (id) => {
        const items = get()
          .items
          .map((i) =>
            i.id === id
              ? { ...i, qty: i.qty - 1 }
              : i
          )
          .filter((i) => i.qty > 0)

        const { totalQty, totalPrice } = calculateTotals(items)

        set({
          items,
          totalQty,
          totalPrice,
          promo: items.length === 0 ? null : get().promo,
          shippingCost: items.length === 0 ? 0 : get().shippingCost,
        })
      },

      // =========================
      // REMOVE ITEM COMPLETELY
      // =========================
      removeItem: (id) => {
        const items = get().items.filter((i) => i.id !== id)

        const { totalQty, totalPrice } = calculateTotals(items)

        set({
          items,
          totalQty,
          totalPrice,
          promo: items.length === 0 ? null : get().promo,
          shippingCost: items.length === 0 ? 0 : get().shippingCost,
        })
      },

      // =========================
      // CLEAR CART
      // =========================
      clearCart: () =>
        set({
          items: [],
          promo: null,
          shippingCost: 0,
          totalQty: 0,
          totalPrice: 0,
        }),

      // =========================
      // PROMO
      // =========================
      setPromo: (promo) => {
        // cek expired
        if (
          promo.expiresAt &&
          new Date() > new Date(promo.expiresAt)
        ) {
          console.warn("Promo expired")
          return
        }

        // cek minimum transaksi
        if (get().totalPrice < promo.minimal) {
          console.warn("Minimum transaction not reached")
          return
        }

        set({ promo })
      },

      clearPromo: () => set({ promo: null }),

      // =========================
      // SHIPPING
      // =========================
      setShippingCost: (cost) =>
        set({
          shippingCost: Math.max(cost, 0),
        }),

      // =========================
      // DISCOUNT
      // =========================
      getDiscount: () => {
        const { promo, shippingCost, totalPrice } = get()

        if (!promo) return 0
        if (totalPrice < promo.minimal) return 0

        let discount = 0

        switch (promo.tipe) {
          case "percent":
            discount = (totalPrice * promo.nilai) / 100
            break

          case "flat":
            discount = promo.nilai
            break

          case "free_shipping":
            discount = shippingCost
            break
        }

        // limit max diskon
        if (promo.maxDiskon !== null) {
          discount = Math.min(discount, promo.maxDiskon)
        }

        // diskon tidak boleh lebih besar dari subtotal + ongkir
        discount = Math.min(
          discount,
          totalPrice + shippingCost
        )

        return Math.floor(discount)
      },

      // =========================
      // FINAL TOTAL
      // =========================
      getFinalTotal: () => {
        const {
          totalPrice,
          shippingCost,
          getDiscount,
        } = get()

        return Math.max(
          totalPrice + shippingCost - getDiscount(),
          0
        )
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
