"use client"
import { createContext, useContext, useMemo, useState } from "react"

type CartItem = { id: number; name: string; price: number; qty: number }
type CartContextType = {
  cart: Record<number, CartItem>
  addItem: (id: number, name: string, price: number) => void
  removeItem: (id: number) => void
  totalQty: number
  totalPrice: number
}

// 👉 default context supaya nggak pernah undefined
const CartContext = createContext<CartContextType>({
  cart: {},
  addItem: () => {},
  removeItem: () => {},
  totalQty: 0,
  totalPrice: 0,
})

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [cart, setCart] = useState<Record<number, CartItem>>({})

  const addItem = (id: number, name: string, price: number) => {
    setCart(prev => {
      const exist = prev[id]
      const qty = (exist?.qty || 0) + 1
      return { ...prev, [id]: { id, name, price, qty } }
    })
  }

  const removeItem = (id: number) => {
    setCart(prev => {
      const next = { ...prev }
      const exist = next[id]
      if (!exist) return prev
      if (exist.qty <= 1) delete next[id]
      else next[id] = { ...exist, qty: exist.qty - 1 }
      return next
    })
  }

  const totalQty = useMemo(() => Object.values(cart).reduce((a, b) => a + b.qty, 0), [cart])
  const totalPrice = useMemo(() => Object.values(cart).reduce((a, b) => a + b.price * b.qty, 0), [cart])

  return (
    <CartContext.Provider value={{ cart, addItem, removeItem, totalQty, totalPrice }}>
      {children}
    </CartContext.Provider>
  )
}

export const useCart = () => useContext(CartContext)
