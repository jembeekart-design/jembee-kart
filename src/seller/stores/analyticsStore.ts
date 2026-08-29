import { create } from 'zustand';
import { devtools } from 'zustand/middleware';

interface AnalyticsMetrics {
  totalRevenue: number;
  totalOrders: number;
  totalProducts: number;
  averageOrderValue: number;
  conversionRate: number;
  topProducts: any[];
  revenueByPeriod: { date: string; revenue: number }[];
}

interface AnalyticsState {
  metrics: AnalyticsMetrics | null;
  loading: boolean;
  error: string | null;
  selectedPeriod: 'week' | 'month' | 'year';
  updateMetrics: (metrics: AnalyticsMetrics) => void;
  setPeriod: (period: 'week' | 'month' | 'year') => void;
  fetchAnalytics: (sellerId: string) => Promise<void>;
  resetAnalytics: () => void;
}

const useAnalyticsStore = create<AnalyticsState>(
  devtools(
    (set) => ({
      metrics: null,
      loading: false,
      error: null,
      selectedPeriod: 'month',

      updateMetrics: (metrics: AnalyticsMetrics) => {
        set({ metrics, error: null });
      },

      setPeriod: (period: 'week' | 'month' | 'year') => {
        set({ selectedPeriod: period });
      },

      fetchAnalytics: async (sellerId: string) => {
        set({ loading: true, error: null });
        try {
          // Fetched via hooks
          set({ loading: false });
        } catch (error) {
          set({
            error: error instanceof Error ? error.message : 'Failed to fetch analytics',
            loading: false,
          });
        }
      },

      resetAnalytics: () => {
        set({
          metrics: null,
          loading: false,
          error: null,
        });
      },
    }),
    { name: 'AnalyticsStore' }
  )
);

export default useAnalyticsStore;
