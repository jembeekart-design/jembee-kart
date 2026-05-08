import { create } from 'zustand';
import { devtools } from 'zustand/middleware';

interface DashboardMetrics {
  totalRevenue: number;
  totalOrders: number;
  totalProducts: number;
  pendingOrders: number;
  lowStockProducts: number;
}

interface DashboardState {
  metrics: DashboardMetrics | null;
  loading: boolean;
  error: string | null;
  lastUpdated: Date | null;
  initializeMetrics: (sellerId: string) => Promise<void>;
  updateMetrics: (metrics: DashboardMetrics) => void;
  resetMetrics: () => void;
}

const useDashboardStore = create<DashboardState>(
  devtools(
    (set) => ({
      metrics: null,
      loading: false,
      error: null,
      lastUpdated: null,

      initializeMetrics: async (sellerId: string) => {
        set({ loading: true, error: null });
        try {
          // Metrics will be fetched via hooks
          set({ loading: false });
        } catch (error) {
          set({
            error: error instanceof Error ? error.message : 'Failed to initialize metrics',
            loading: false,
          });
        }
      },

      updateMetrics: (metrics: DashboardMetrics) => {
        set({
          metrics,
          lastUpdated: new Date(),
          error: null,
        });
      },

      resetMetrics: () => {
        set({
          metrics: null,
          loading: false,
          error: null,
          lastUpdated: null,
        });
      },
    }),
    { name: 'DashboardStore' }
  )
);

export default useDashboardStore;
