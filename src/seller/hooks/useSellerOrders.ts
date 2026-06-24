'use client';

import { useEffect, useCallback } from 'react';
import useOrderStore from '@/seller/stores/orderStore';
import { useFirestoreQuery } from './useFirestoreQuery';
import { Order } from '@/seller/types';

interface FilterOptions {
  status?: string;
  startDate?: Date;
  endDate?: Date;
}

export function useSellerOrders(
  sellerId: string,
  filters?: FilterOptions,
  options?: { limit?: number }
) {
  const { orders, setOrders, updateOrderStatus } = useOrderStore();

  const queryFilters = [
    {
      field: 'sellerId',
      operator: '==' as const,
      value: sellerId,
    },
  ];

  if (filters?.status) {
    queryFilters.push({
      field: 'status',
      operator: '==' as const,
      value: filters.status,
    });
  }

  const { data: ordersData, loading, error } = useFirestoreQuery<Order>(
    'orders',
    queryFilters,
    options?.limit || 100
  );

  useEffect(() => {
    if (ordersData) {
      let filteredOrders = ordersData;

      if (filters?.startDate) {
        filteredOrders = filteredOrders.filter(
          (order) => new Date(order.createdAt) >= filters.startDate!
        );
      }

      if (filters?.endDate) {
        filteredOrders = filteredOrders.filter(
          (order) => new Date(order.createdAt) <= filters.endDate!
        );
      }

      setOrders(filteredOrders);
    }
  }, [ordersData, filters, setOrders]);

  const updateStatus = useCallback(
    async (orderId: string, status: string) => {
      try {
        updateOrderStatus(orderId, status);
      } catch (err) {
        throw new Error(
          err instanceof Error ? err.message : 'Failed to update order status'
        );
      }
    },
    [updateOrderStatus]
  );

  return {
    orders,
    loading,
    error,
    updateStatus,
  };
}
