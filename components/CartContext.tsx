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
  updateItemQty: (id: number, qty: number) => void // ✅ bisa revisi qty
  clearCart: () => void
  totalPrice: number
  totalQty: number
}

const CartContext = createContext<CartContextType | undefined>(undefined)

export function CartProvider({ children }: { children: ReactNode }) {
  const [cart, setCart] = useState<CartItem[]>([])

  // ✅ Tambah item
  const addItem = (item: CartItem) => {
    setCart(prev => {
      const existing = prev.find(p => p.id === item.id)
      if (existing) {
        return prev.map(p =>
          p.id === item.id ? { ...p, qty: p.qty + item.qty } : p
        )
      } else {
        return [...prev, item]
      }
    })
  }

  // ✅ Hapus item
  const removeItem = (id: number) => {
    setCart(prev => prev.filter(p => p.id !== id))
  }

  // ✅ Update qty manual (misal dari 8 ke 5)
  const updateItemQty = (id: number, qty: number) => {
    setCart(prev => {
      if (qty <= 0) return prev.filter(p => p.id !== id)
      return prev.map(p => (p.id === id ? { ...p, qty } : p))
    })
  }

  // ✅ Kosongkan cart
  const clearCart = () => setCart([])

  // ✅ Hitung total
  const totalPrice = cart.reduce((sum, item) => sum + item.price * item.qty, 0)
  const totalQty = cart.reduce((sum, item) => sum + item.qty, 0)

  return (
    <CartContext.Provider
      value={{
        cart,
        addItem,
        removeItem,
        updateItemQty, // ✅ pastikan disertakan
        clearCart,
        totalPrice,
        totalQty,
      }}
    >
      {children}
    </CartContext.Provider>
  )
}

export const useCart = () => {
  const ctx = useContext(CartContext)
  if (!ctx) throw new Error("useCart must be used within CartProvider")
  return ctx
}
