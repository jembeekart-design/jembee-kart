'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import OrdersTable from '@/seller/components/orders/OrdersTable';
import OrdersFilters from '@/seller/components/orders/OrdersFilters';
import useOrderStore from '@/seller/stores/orderStore';
import { useAuth } from '@/hooks/useAuth';

export default function OrdersPage() {
  const router = useRouter();
  const { user, loading } = useAuth();
  const { orders, fetchOrders } = useOrderStore();
  const [statusFilter, setStatusFilter] = useState<string | null>(null);
  const [dateRange, setDateRange] = useState<{ start: Date; end: Date } | null>(null);

  useEffect(() => {
    if (!loading && !user) {
      router.push('/auth/login');
    } else if (user) {
      fetchOrders(user.uid, { statusFilter, dateRange });
    }
  }, [user, loading, statusFilter, dateRange, router, fetchOrders]);

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-gray-900">Orders</h1>
      <OrdersFilters
        onStatusChange={setStatusFilter}
        onDateRangeChange={setDateRange}
      />
      <OrdersTable orders={orders} />
    </div>
  );
}
