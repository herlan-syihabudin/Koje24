import { create } from "zustand"

type CartItem = {
  id: string
  name: string
  price: number
  img: string
  qty: number
}

type CartState = {
  items: CartItem[]
  totalQty: number
  totalPrice: number

  addItem: (item: Omit<CartItem, "qty">) => void
  removeItem: (id: string) => void
  clearCart: () => void
}

export const useCartStore = create<CartState>((set, get) => ({
  items: [],
  totalQty: 0,
  totalPrice: 0,

  addItem: (item) => {
    const { items } = get()
    const existing = items.find((x) => x.id === item.id)

    let updatedItems: CartItem[]
    if (existing) {
      updatedItems = items.map((x) =>
        x.id === item.id ? { ...x, qty: x.qty + 1 } : x
      )
    } else {
      updatedItems = [...items, { ...item, qty: 1 }]
    }

    const totalQty = updatedItems.reduce((acc, i) => acc + i.qty, 0)
    const totalPrice = updatedItems.reduce((acc, i) => acc + i.qty * i.price, 0)

    set({
      items: updatedItems,
      totalQty,
      totalPrice,
    })
  },

  removeItem: (id) => {
    const updatedItems = get().items.filter((i) => i.id !== id)

    const totalQty = updatedItems.reduce((acc, i) => acc + i.qty, 0)
    const totalPrice = updatedItems.reduce((acc, i) => acc + i.qty * i.price, 0)

    set({
      items: updatedItems,
      totalQty,
      totalPrice,
    })
  },

  clearCart: () => {
    set({
      items: [],
      totalQty: 0,
      totalPrice: 0,
    })
  },
}))
