'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import ProductsTable from '@/seller/components/products/ProductsTable';
import ProductsFilters from '@/seller/components/products/ProductsFilters';
useProductStore from '@/seller/stores/productStore';
import { useAuth } from '@/hooks/useAuth';

export default function ProductsPage() {
  const router = useRouter();
  const { user, loading } = useAuth();
  const { products, fetchProducts } = useProductStore();
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    if (!loading && !user) {
      router.push('/auth/login');
    } else if (user) {
      fetchProducts(user.uid);
    }
  }, [user, loading, router, fetchProducts]);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-gray-900">Products</h1>
        <button
          onClick={() => router.push('/seller/products/new')}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          Add Product
        </button>
      </div>
      <ProductsFilters onSearch={setSearchTerm} />
      <ProductsTable products={products} searchTerm={searchTerm} />
    </div>
  );
}
