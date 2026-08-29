'use client';

import { useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import OrderDetail from '@/seller/components/orders/OrderDetail';
import useOrderStore from '@/seller/stores/orderStore';
import { useAuth } from '@/hooks/useAuth';

export default function OrderDetailPage() {
  const router = useRouter();
  const params = useParams();
  const { user, loading } = useAuth();
  const { currentOrder, fetchOrderById } = useOrderStore();
  const orderId = params.id as string;

  useEffect(() => {
    if (!loading && !user) {
      router.push('/auth/login');
    } else if (user && orderId) {
      fetchOrderById(orderId, user.uid);
    }
  }, [user, loading, orderId, router, fetchOrderById]);

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <button
          onClick={() => router.back()}
          className="text-gray-600 hover:text-gray-900"
        >
          ← Back
        </button>
        <h1 className="text-3xl font-bold text-gray-900">Order Details</h1>
      </div>
      {currentOrder && <OrderDetail order={currentOrder} />}
    </div>
  );
}
