import { collection, getDocs, query, where, updateDoc, doc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Order } from '@/seller/types';

const PLATFORM_FEE_PERCENTAGE = 0.1; // 10%
const PAYOUT_PROCESSING_DAYS = 5;

export const earningsService = {
  async calculateNetEarnings(sellerId: string): Promise<number> {
    const snapshot = await getDocs(
      query(
        collection(db, 'orders'),
        where('sellerId', '==', sellerId),
        where('status', '==', 'completed')
      )
    );

    const totalRevenue = snapshot.docs.reduce(
      (sum, doc) => sum + ((doc.data() as Order).total || 0),
      0
    );

    const platformFee = totalRevenue * PLATFORM_FEE_PERCENTAGE;
    return totalRevenue - platformFee;
  },

  async getPendingEarnings(sellerId: string): Promise<number> {
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const snapshot = await getDocs(
      query(
        collection(db, 'orders'),
        where('sellerId', '==', sellerId),
        where('status', '==', 'completed')
      )
    );

    let pendingAmount = 0;

    snapshot.forEach((docSnap) => {
      const order = docSnap.data() as Order;
      if (new Date(order.createdAt) > thirtyDaysAgo) {
        const netAmount = (order.total || 0) * (1 - PLATFORM_FEE_PERCENTAGE);
        pendingAmount += netAmount;
      }
    });

    return pendingAmount;
  },

  calculateNextPayoutDate(): Date {
    const now = new Date();
    const daysUntilMonthEnd = new Date(
      now.getFullYear(),
      now.getMonth() + 1,
      0
    ).getDate();
    const nextPayout = new Date();
    nextPayout.setDate(Math.min(daysUntilMonthEnd, now.getDate() + PAYOUT_PROCESSING_DAYS));
    return nextPayout;
  },

  async recordPayout(
    sellerId: string,
    amount: number,
    payoutMethod: string
  ): Promise<string> {
    const payoutsCollection = collection(db, 'payouts');
    // Implementation depends on payout structure
    return 'payout-id';
  },

  async getPayoutHistory(sellerId: string): Promise<any[]> {
    const snapshot = await getDocs(
      query(
        collection(db, 'payouts'),
        where('sellerId', '==', sellerId)
      )
    );
    return snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));
  },
};
