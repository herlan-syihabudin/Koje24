"use client"
import { create } from "zustand"
import { persist } from "zustand/middleware"

const safeStorage = {
  getItem: (name: string) => (typeof window === "undefined" ? null : localStorage.getItem(name)),
  setItem: (name: string, value: string) =>
    typeof window !== "undefined" && localStorage.setItem(name, value),
  removeItem: (name: string) =>
    typeof window !== "undefined" && localStorage.removeItem(name),
}

type StatsState = {
  orders: Record<string, number>
  addOrder: (id: string, qty: number) => void
}

export const useStatsStore = create<StatsState>()(
  persist(
    (set) => ({
      orders: {},

      addOrder: (id, qty) =>
        set((state) => ({
          orders: {
            ...state.orders,
            [id]: (state.orders[id] || 0) + qty,
          },
        })),
    }),
    { name: "koje-stats", storage: safeStorage }
  )
)
