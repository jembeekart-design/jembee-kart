import { create } from "zustand";

interface AuthStore {
  user: any;
  setUser: (user: any) => void;
}

export const useAuthStore = create<AuthStore>((set) => ({
  user: null,
  setUser: (user) => set({ user }),
}));

// THEME ADMIN PANEL SE CHANGE HOGA
