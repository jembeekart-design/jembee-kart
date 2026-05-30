import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';
import { Product } from '@/seller/types';

interface ProductState {
  products: Product[];
  currentProduct: Product | null;
  loading: boolean;
  error: string | null;
  setProducts: (products: Product[]) => void;
  setCurrentProduct: (product: Product | null) => void;
  addProduct: (product: Product) => void;
  updateProduct: (id: string, updates: Partial<Product>) => void;
  deleteProduct: (id: string) => void;
  fetchProducts: (sellerId: string) => Promise<void>;
  fetchProductById: (id: string, sellerId: string) => Promise<void>;
  clearProducts: () => void;
}

const useProductStore = create<ProductState>(
  devtools(
    persist(
      (set) => ({
        products: [],
        currentProduct: null,
        loading: false,
        error: null,

        setProducts: (products: Product[]) => {
          set({ products, error: null });
        },

        setCurrentProduct: (product: Product | null) => {
          set({ currentProduct: product });
        },

        addProduct: (product: Product) => {
          set((state) => ({
            products: [product, ...state.products],
            error: null,
          }));
        },

        updateProduct: (id: string, updates: Partial<Product>) => {
          set((state) => ({
            products: state.products.map((p) =>
              p.id === id ? { ...p, ...updates } : p
            ),
            currentProduct:
              state.currentProduct?.id === id
                ? { ...state.currentProduct, ...updates }
                : state.currentProduct,
            error: null,
          }));
        },

        deleteProduct: (id: string) => {
          set((state) => ({
            products: state.products.filter((p) => p.id !== id),
            currentProduct:
              state.currentProduct?.id === id ? null : state.currentProduct,
            error: null,
          }));
        },

        fetchProducts: async (sellerId: string) => {
          set({ loading: true, error: null });
          try {
            // Fetched via hooks
            set({ loading: false });
          } catch (error) {
            set({
              error: error instanceof Error ? error.message : 'Failed to fetch products',
              loading: false,
            });
          }
        },

        fetchProductById: async (id: string, sellerId: string) => {
          set({ loading: true, error: null });
          try {
            // Fetched via hooks
            set({ loading: false });
          } catch (error) {
            set({
              error: error instanceof Error ? error.message : 'Failed to fetch product',
              loading: false,
            });
          }
        },

        clearProducts: () => {
          set({ products: [], currentProduct: null, error: null });
        },
      }),
      { name: 'ProductStore' }
    ),
    { name: 'ProductStore' }
  )
);

export default useProductStore;
