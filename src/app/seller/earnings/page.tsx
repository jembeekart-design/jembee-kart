'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import EarningsOverview from '@/seller/components/earnings/EarningsOverview';
import EarningsChart from '@/seller/components/earnings/EarningsChart';
import PayoutHistory from '@/seller/components/earnings/PayoutHistory';
import useEarningsStore from '@/seller/stores/earningsStore';
import { useAuth } from '@/hooks/useAuth';

export default function EarningsPage() {
  const router = useRouter();
  const { user, loading } = useAuth();
  const { fetchEarnings } = useEarningsStore();

  useEffect(() => {
    if (!loading && !user) {
      router.push('/auth/login');
    } else if (user) {
      fetchEarnings(user.uid);
    }
  }, [user, loading, router, fetchEarnings]);

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-gray-900">Earnings</h1>
      <EarningsOverview />
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <EarningsChart />
        </div>
        <div>
          <PayoutHistory />
        </div>
      </div>
    </div>
  );
}
