// stores/statsStore.ts
import { create } from "zustand"
import { persist, createJSONStorage } from "zustand/middleware"

type StatsState = {
  orders: Record<string, number>
  addOrder: (id: string, qty: number) => void

  // 🔥 Utility opsional — tidak ubah logic
  getOrderCount: (id: string) => number
}

export const useStatsStore = create<StatsState>()(
  persist(
    (set, get) => ({
      orders: {},

      addOrder: (id, qty) =>
        set((state) => ({
          orders: {
            ...state.orders,
            [id]: (state.orders[id] || 0) + qty,
          },
        })),

      // 🔥 Utility aman
      getOrderCount: (id) => get().orders[id] || 0,
    }),
    {
      name: "koje-stats",
      storage:
        typeof window !== "undefined"
          ? createJSONStorage(() => localStorage)
          : undefined,
    }
  )
)
