import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';

interface SellerProfile {
  uid: string;
  email: string;
  sellerName: string;
  storeName: string;
  profileImage?: string;
  verified: boolean;
  createdAt: Date;
  updatedAt: Date;
}

interface SellerState {
  currentSeller: SellerProfile | null;
  loading: boolean;
  error: string | null;
  setCurrentSeller: (seller: SellerProfile | null) => void;
  updateSellerProfile: (updates: Partial<SellerProfile>) => void;
  clearSeller: () => void;
}

const useSellerStore = create<SellerState>(
  devtools(
    persist(
      (set) => ({
        currentSeller: null,
        loading: false,
        error: null,

        setCurrentSeller: (seller: SellerProfile | null) => {
          set({ currentSeller: seller, error: null });
        },

        updateSellerProfile: (updates: Partial<SellerProfile>) => {
          set((state) => ({
            currentSeller: state.currentSeller
              ? { ...state.currentSeller, ...updates }
              : null,
            error: null,
          }));
        },

        clearSeller: () => {
          set({ currentSeller: null, error: null });
        },
      }),
      { name: 'SellerStore' }
    ),
    { name: 'SellerStore' }
  )
);

export default useSellerStore;
