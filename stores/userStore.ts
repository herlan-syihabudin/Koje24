// stores/userStore.ts
import { create } from 'zustand';

interface UserStore {
  user: { name: string; email: string; initial: string } | null;
  setUser: (user: UserStore['user']) => void;
}

export const useUserStore = create<UserStore>((set) => ({
  user: null,
  setUser: (user) => set({ user }),
}));

// Di layout
<TopbarClient user={user} /> // Tetap pass dari server

// Di komponen lain bisa akses:
const user = useUserStore((state) => state.user);
