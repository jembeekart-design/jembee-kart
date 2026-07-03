'use client';

import { useEffect, useState } from 'react';
import useEarningsStore from '@/seller/stores/earningsStore';
import { useFirestoreQuery } from './useFirestoreQuery';
import { Order } from '@/seller/types';

interface EarningsMetrics {
  totalEarnings: number;
  pendingPayment: number;
  completedPayouts: number;
  earningsByPeriod: { date: string; amount: number }[];
  nextPayoutDate: Date | null;
}

export function useSellerEarnings(sellerId: string) {
  const {
    earnings,
    loading: storeLoading,
    error: storeError,
    updateEarnings,
  } = useEarningsStore();
  const [earningsMetrics, setEarningsMetrics] = useState<EarningsMetrics | null>(null);

  const { data: orders } = useFirestoreQuery<Order>('orders', [
    { field: 'sellerId', operator: '==', value: sellerId },
    { field: 'status', operator: '==', value: 'completed' },
  ]);

  useEffect(() => {
    if (orders) {
      const totalEarnings = orders.reduce((sum, order) => sum + (order.total || 0), 0);
      const platformFee = totalEarnings * 0.1; // 10% platform fee
      const netEarnings = totalEarnings - platformFee;

      const earningsByPeriod = generateEarningsByPeriod(orders);
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

      const pendingPayment = orders
        .filter((o) => new Date(o.createdAt) > thirtyDaysAgo)
        .reduce((sum, order) => sum + (order.total || 0), 0) * 0.9;

      const metrics: EarningsMetrics = {
        totalEarnings: netEarnings,
        pendingPayment,
        completedPayouts: netEarnings - pendingPayment,
        earningsByPeriod,
        nextPayoutDate: calculateNextPayoutDate(),
      };

      setEarningsMetrics(metrics);
      updateEarnings(metrics);
    }
  }, [orders, updateEarnings]);

  return {
    earnings: earningsMetrics,
    loading: storeLoading,
    error: storeError,
  };
}

function generateEarningsByPeriod(
  orders: Order[]
): { date: string; amount: number }[] {
  const periodMap = new Map<string, number>();

  orders.forEach((order) => {
    const date = new Date(order.createdAt).toISOString().split('T')[0];
    const netAmount = (order.total || 0) * 0.9;
    const current = periodMap.get(date) || 0;
    periodMap.set(date, current + netAmount);
  });

  return Array.from(periodMap.entries())
    .map(([date, amount]) => ({ date, amount }))
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
}

function calculateNextPayoutDate(): Date {
  const nextPayout = new Date();
  const daysUntilMonthEnd = new Date(
    nextPayout.getFullYear(),
    nextPayout.getMonth() + 1,
    0
  ).getDate();
  nextPayout.setDate(Math.min(daysUntilMonthEnd, nextPayout.getDate() + 5));
  return nextPayout;
}
