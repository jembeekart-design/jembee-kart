'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import SellerSettings from '@/seller/components/settings/SellerSettings';
import { useAuth } from '@/hooks/useAuth';

export default function SettingsPage() {
  const router = useRouter();
  const { user, loading } = useAuth();

  useEffect(() => {
    if (!loading && !user) {
      router.push('/auth/login');
    }
  }, [user, loading, router]);

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-gray-900">Settings</h1>
      <SellerSettings />
    </div>
  );
}
