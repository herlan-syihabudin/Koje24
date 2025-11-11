import { createContext, useContext, useMemo, useState, ReactNode } from "react"

type CartItem = { id: number; name: string; price: number; qty: number }

type CartContextType = {
  cart: Record<number, CartItem>
  addItem: (item: CartItem) => void
  removeItem: (id: number) => void
  totalPrice: number
}

const CartContext = createContext<CartContextType | undefined>(undefined)

export const CartProvider = ({ children }: { children: ReactNode }) => {
  const [cart, setCart] = useState<Record<number, CartItem>>({})

  const addItem = (item: CartItem) => {
    setCart((prev) => ({ ...prev, [item.id]: item }))
  }

  const removeItem = (id: number) => {
    setCart((prev) => {
      const copy = { ...prev }
      delete copy[id]
      return copy
    })
  }

  const totalPrice = useMemo(() => {
    return Object.values(cart).reduce((acc, item) => acc + item.price * item.qty, 0)
  }, [cart])

  const value = useMemo(() => ({ cart, addItem, removeItem, totalPrice }), [cart, totalPrice])

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>
}

export const useCart = () => {
  const ctx = useContext(CartContext)
  if (!ctx) throw new Error("useCart must be used within a CartProvider")
  return ctx
}
