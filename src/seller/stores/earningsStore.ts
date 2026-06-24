import { create } from 'zustand';
import { devtools } from 'zustand/middleware';

interface EarningsMetrics {
  totalEarnings: number;
  pendingPayment: number;
  completedPayouts: number;
  earningsByPeriod: { date: string; amount: number }[];
  nextPayoutDate: Date | null;
}

interface EarningsState {
  earnings: EarningsMetrics | null;
  loading: boolean;
  error: string | null;
  payoutHistory: any[];
  updateEarnings: (earnings: EarningsMetrics) => void;
  fetchEarnings: (sellerId: string) => Promise<void>;
  fetchPayoutHistory: (sellerId: string) => Promise<void>;
  resetEarnings: () => void;
}

const useEarningsStore = create<EarningsState>(
  devtools(
    (set) => ({
      earnings: null,
      loading: false,
      error: null,
      payoutHistory: [],

      updateEarnings: (earnings: EarningsMetrics) => {
        set({ earnings, error: null });
      },

      fetchEarnings: async (sellerId: string) => {
        set({ loading: true, error: null });
        try {
          // Fetched via hooks
          set({ loading: false });
        } catch (error) {
          set({
            error: error instanceof Error ? error.message : 'Failed to fetch earnings',
            loading: false,
          });
        }
      },

      fetchPayoutHistory: async (sellerId: string) => {
        try {
          // Fetch payout history
          set({ error: null });
        } catch (error) {
          set({
            error: error instanceof Error ? error.message : 'Failed to fetch payout history',
          });
        }
      },

      resetEarnings: () => {
        set({
          earnings: null,
          loading: false,
          error: null,
          payoutHistory: [],
        });
      },
    }),
    { name: 'EarningsStore' }
  )
);

export default useEarningsStore;
