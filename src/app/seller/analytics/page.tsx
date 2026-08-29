'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import AnalyticsOverview from '@/seller/components/analytics/AnalyticsOverview';
import SalesChart from '@/seller/components/analytics/SalesChart';
import TopProducts from '@/seller/components/analytics/TopProducts';
import useAnalyticsStore from '@/seller/stores/analyticsStore';
import { useAuth } from '@/hooks/useAuth';

export default function AnalyticsPage() {
  const router = useRouter();
  const { user, loading } = useAuth();
  const { fetchAnalytics } = useAnalyticsStore();

  useEffect(() => {
    if (!loading && !user) {
      router.push('/auth/login');
    } else if (user) {
      fetchAnalytics(user.uid);
    }
  }, [user, loading, router, fetchAnalytics]);

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-gray-900">Analytics</h1>
      <AnalyticsOverview />
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <SalesChart />
        </div>
        <div>
          <TopProducts />
        </div>
      </div>
    </div>
  );
}
