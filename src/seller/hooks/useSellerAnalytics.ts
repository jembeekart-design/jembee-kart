'use client';

import { useEffect, useState } from 'react';
import useAnalyticsStore from '@/seller/stores/analyticsStore';
import { useFirestoreQuery } from './useFirestoreQuery';
import { Order, Product } from '@/seller/types';

interface AnalyticsMetrics {
  totalRevenue: number;
  totalOrders: number;
  totalProducts: number;
  averageOrderValue: number;
  conversionRate: number;
  topProducts: Product[];
  revenueByPeriod: { date: string; revenue: number }[];
}

export function useSellerAnalytics(sellerId: string) {
  const {
    metrics,
    loading: storeLoading,
    error: storeError,
    updateMetrics,
  } = useAnalyticsStore();
  const [calculatedMetrics, setCalculatedMetrics] = useState<AnalyticsMetrics | null>(null);

  const { data: orders } = useFirestoreQuery<Order>('orders', [
    { field: 'sellerId', operator: '==', value: sellerId },
  ]);

  const { data: products } = useFirestoreQuery<Product>('products', [
    { field: 'sellerId', operator: '==', value: sellerId },
  ]);

  useEffect(() => {
    if (orders && products) {
      const totalRevenue = orders.reduce((sum, order) => sum + (order.total || 0), 0);
      const totalOrders = orders.length;
      const totalProducts = products.length;
      const averageOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;

      const revenueByPeriod = generateRevenueByPeriod(orders);
      const topProducts = getTopProducts(products, orders);

      const metrics: AnalyticsMetrics = {
        totalRevenue,
        totalOrders,
        totalProducts,
        averageOrderValue,
        conversionRate: calculateConversionRate(orders, products),
        topProducts,
        revenueByPeriod,
      };

      setCalculatedMetrics(metrics);
      updateMetrics(metrics);
    }
  }, [orders, products, updateMetrics]);

  return {
    metrics: calculatedMetrics,
    loading: storeLoading,
    error: storeError,
  };
}

function generateRevenueByPeriod(
  orders: Order[]
): { date: string; revenue: number }[] {
  const periodMap = new Map<string, number>();

  orders.forEach((order) => {
    const date = new Date(order.createdAt).toISOString().split('T')[0];
    const current = periodMap.get(date) || 0;
    periodMap.set(date, current + (order.total || 0));
  });

  return Array.from(periodMap.entries())
    .map(([date, revenue]) => ({ date, revenue }))
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
}

function getTopProducts(products: Product[], orders: Order[]): Product[] {
  const productSales = new Map<string, number>();

  orders.forEach((order) => {
    order.items?.forEach((item) => {
      const current = productSales.get(item.productId) || 0;
      productSales.set(item.productId, current + item.quantity);
    });
  });

  return products
    .map((p) => ({ ...p, sales: productSales.get(p.id) || 0 }))
    .sort((a, b) => (b as any).sales - (a as any).sales)
    .slice(0, 5)
    .map(({ sales, ...product }) => product);
}

function calculateConversionRate(orders: Order[], products: Product[]): number {
  if (products.length === 0) return 0;
  const totalViews = products.reduce((sum, p) => sum + (p.views || 0), 0);
  return totalViews > 0 ? (orders.length / totalViews) * 100 : 0;
}
