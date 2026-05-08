import type { Metadata } from 'next';
import { SellerProvider } from '@/seller/providers';
import SellerNavigation from '@/seller/components/layout/SellerNavigation';
import SellerSidebar from '@/seller/components/layout/SellerSidebar';
import '../../../styles/seller.css';

export const metadata: Metadata = {
  title: 'Seller Dashboard | Jembee Kart',
  description: 'Manage your products, orders, and analytics',
};

export default function SellerLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <SellerProvider>
      <div className="flex h-screen bg-gray-50">
        <SellerSidebar />
        <div className="flex-1 flex flex-col overflow-hidden">
          <SellerNavigation />
          <main className="flex-1 overflow-y-auto">
            <div className="p-6">{children}</div>
          </main>
        </div>
      </div>
    </SellerProvider>
  );
}
