import { create } from "zustand";

interface AppStore {
  loading: boolean;
  setLoading: (value: boolean) => void;
}

export const useAppStore = create<AppStore>((set) => ({
  loading: false,
  setLoading: (value) => set({ loading: value }),
}));

// THEME ADMIN PANEL SE CHANGE HOGA
