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
  totalPrice: number
  totalQty: number // ✅ ditambahkan biar StickyCartBar bisa baca
}

const CartContext = createContext<CartContextType | undefined>(undefined)

export function CartProvider({ children }: { children: ReactNode }) {
  const [cart, setCart] = useState<CartItem[]>([])

  // ✅ Tambah item ke cart
  const addItem = (item: CartItem) => {
    setCart((prev) => {
      const existing = prev.find((p) => p.id === item.id)
      if (existing) {
        return prev.map((p) =>
          p.id === item.id ? { ...p, qty: p.qty + item.qty } : p
        )
      } else {
        return [...prev, item]
      }
    })
  }

  // ✅ Hapus item
  const removeItem = (id: number) => {
    setCart((prev) => prev.filter((p) => p.id !== id))
  }

  // ✅ Kosongkan cart
  const clearCart = () => setCart([])

  // ✅ Hitung total harga & total qty otomatis
  const totalPrice = cart.reduce((sum, item) => sum + item.price * item.qty, 0)
  const totalQty = cart.reduce((sum, item) => sum + item.qty, 0) // ✅ baru ditambah

  return (
    <CartContext.Provider
      value={{ cart, addItem, removeItem, clearCart, totalPrice, totalQty }} // ✅ pastikan totalQty ikut di sini
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
