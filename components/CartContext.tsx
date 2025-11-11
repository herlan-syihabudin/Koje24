"use client"
import { createContext, useContext, useState, ReactNode } from "react"

type CartItem = {
  id: number
  name: string
  price: number
  qty: number
}

type CartContextType = {
  cart: CartItem[]
  addItem: (item: CartItem) => void
  removeItem: (id: number) => void
  clearCart: () => void
}

const CartContext = createContext<CartContextType | undefined>(undefined)

export function CartProvider({ children }: { children: ReactNode }) {
  const [cart, setCart] = useState<CartItem[]>([])

  const addItem = (item: CartItem) => {
    setCart((prev) => {
      const existing = prev.find((p) => p.id === item.id)
      if (existing) {
        return prev.map((p) =>
          p.id === item.id ? { ...p, qty: p.qty + item.qty } : p
        )
      }
      return [...prev, item]
    })
  }

  const removeItem = (id: number) =>
    setCart((prev) => prev.filter((p) => p.id !== id))

  const clearCart = () => setCart([])

  return (
    <CartContext.Provider value={{ cart, addItem, removeItem, clearCart }}>
      {children}
    </CartContext.Provider>
  )
}

export const useCart = () => {
  const ctx = useContext(CartContext)
  if (!ctx) throw new Error("useCart must be used within CartProvider")
  return ctx
}
