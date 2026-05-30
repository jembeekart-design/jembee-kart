'use client';

import { useEffect, useCallback } from 'react';
import useProductStore from '@/seller/stores/productStore';
import { useFirestoreQuery } from './useFirestoreQuery';
import { Product } from '@/seller/types';

export function useSellerProducts(sellerId: string, options?: { limit?: number }) {
  const { products, setProducts, addProduct, updateProduct, deleteProduct } =
    useProductStore();

  const { data: productsData, loading, error } = useFirestoreQuery<Product>(
    'products',
    [
      {
        field: 'sellerId',
        operator: '==',
        value: sellerId,
      },
    ],
    options?.limit || 50
  );

  useEffect(() => {
    if (productsData) {
      setProducts(productsData);
    }
  }, [productsData, setProducts]);

  const createProduct = useCallback(
    async (productData: Omit<Product, 'id' | 'createdAt' | 'updatedAt'>) => {
      try {
        addProduct({ ...productData, id: '', createdAt: new Date(), updatedAt: new Date() });
      } catch (err) {
        throw new Error(
          err instanceof Error ? err.message : 'Failed to create product'
        );
      }
    },
    [addProduct]
  );

  const editProduct = useCallback(
    async (productId: string, updates: Partial<Product>) => {
      try {
        updateProduct(productId, updates);
      } catch (err) {
        throw new Error(
          err instanceof Error ? err.message : 'Failed to update product'
        );
      }
    },
    [updateProduct]
  );

  const removeProduct = useCallback(
    async (productId: string) => {
      try {
        deleteProduct(productId);
      } catch (err) {
        throw new Error(
          err instanceof Error ? err.message : 'Failed to delete product'
        );
      }
    },
    [deleteProduct]
  );

  return {
    products,
    loading,
    error,
    createProduct,
    editProduct,
    removeProduct,
  };
}
