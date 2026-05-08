import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import { Order } from '@/seller/types';

interface OrderState {
  orders: Order[];
  currentOrder: Order | null;
  loading: boolean;
  error: string | null;
  setOrders: (orders: Order[]) => void;
  setCurrentOrder: (order: Order | null) => void;
  updateOrderStatus: (id: string, status: string) => void;
  fetchOrders: (sellerId: string, filters?: any) => Promise<void>;
  fetchOrderById: (id: string, sellerId: string) => Promise<void>;
  clearOrders: () => void;
}

const useOrderStore = create<OrderState>(
  devtools(
    (set) => ({
      orders: [],
      currentOrder: null,
      loading: false,
      error: null,

      setOrders: (orders: Order[]) => {
        set({ orders, error: null });
      },

      setCurrentOrder: (order: Order | null) => {
        set({ currentOrder: order });
      },

      updateOrderStatus: (id: string, status: string) => {
        set((state) => ({
          orders: state.orders.map((o) =>
            o.id === id ? { ...o, status } : o
          ),
          currentOrder:
            state.currentOrder?.id === id
              ? { ...state.currentOrder, status }
              : state.currentOrder,
          error: null,
        }));
      },

      fetchOrders: async (sellerId: string, filters?: any) => {
        set({ loading: true, error: null });
        try {
          // Fetched via hooks
          set({ loading: false });
        } catch (error) {
          set({
            error: error instanceof Error ? error.message : 'Failed to fetch orders',
            loading: false,
          });
        }
      },

      fetchOrderById: async (id: string, sellerId: string) => {
        set({ loading: true, error: null });
        try {
          // Fetched via hooks
          set({ loading: false });
        } catch (error) {
          set({
            error: error instanceof Error ? error.message : 'Failed to fetch order',
            loading: false,
          });
        }
      },

      clearOrders: () => {
        set({ orders: [], currentOrder: null, error: null });
      },
    }),
    { name: 'OrderStore' }
  )
);

export default useOrderStore;
