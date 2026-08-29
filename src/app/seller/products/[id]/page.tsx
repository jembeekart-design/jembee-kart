'use client';

import { useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import ProductEditor from '@/seller/components/products/ProductEditor';
import useProductStore from '@/seller/stores/productStore';
import { useAuth } from '@/hooks/useAuth';

export default function ProductDetailPage() {
  const router = useRouter();
  const params = useParams();
  const { user, loading } = useAuth();
  const { currentProduct, fetchProductById } = useProductStore();
  const productId = params.id as string;

  useEffect(() => {
    if (!loading && !user) {
      router.push('/auth/login');
    } else if (user && productId) {
      fetchProductById(productId, user.uid);
    }
  }, [user, loading, productId, router, fetchProductById]);

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <button
          onClick={() => router.back()}
          className="text-gray-600 hover:text-gray-900"
        >
          ← Back
        </button>
        <h1 className="text-3xl font-bold text-gray-900">Edit Product</h1>
      </div>
      {currentProduct && <ProductEditor product={currentProduct} />}
    </div>
  );
}
