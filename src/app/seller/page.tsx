'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import DashboardOverview from '@/seller/components/dashboard/DashboardOverview';
import useDashboardStore from '@/seller/stores/dashboardStore';
import { useAuth } from '@/hooks/useAuth';

export default function SellerDashboard() {
  const router = useRouter();
  const { user, loading } = useAuth();
  const { initializeMetrics } = useDashboardStore();

  useEffect(() => {
    if (!loading && !user) {
      router.push('/auth/login');
    } else if (user) {
      initializeMetrics(user.uid);
    }
  }, [user, loading, router, initializeMetrics]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
      </div>
      <DashboardOverview />
    </div>
  );
}
