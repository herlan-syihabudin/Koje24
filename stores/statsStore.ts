"use client"

import { create } from "zustand"
import { persist, createJSONStorage } from "zustand/middleware"

const memoryStorage = {
  getItem: () => null,
  setItem: () => {},
  removeItem: () => {},
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
    {
      name: "koje-stats",

      // 🔥 FIX PALING AMAN — jika SSR, jangan pakai storage
      storage:
        typeof window !== "undefined"
          ? createJSONStorage(() => localStorage)
          : undefined,
    }
  )
)
