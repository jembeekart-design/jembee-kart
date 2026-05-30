import {
  collection,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  getDocs,
  query,
  where,
} from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Product } from '@/seller/types';

export const productService = {
  async createProduct(sellerId: string, productData: Omit<Product, 'id'>): Promise<string> {
    const docRef = await addDoc(collection(db, 'products'), {
      ...productData,
      sellerId,
      createdAt: new Date(),
      updatedAt: new Date(),
    });
    return docRef.id;
  },

  async updateProduct(productId: string, updates: Partial<Product>): Promise<void> {
    await updateDoc(doc(db, 'products', productId), {
      ...updates,
      updatedAt: new Date(),
    });
  },

  async deleteProduct(productId: string): Promise<void> {
    await deleteDoc(doc(db, 'products', productId));
  },

  async getProductsByCategory(category: string, limit = 50): Promise<Product[]> {
    const q = query(
      collection(db, 'products'),
      where('category', '==', category),
      where('active', '==', true)
    );
    const snapshot = await getDocs(q);
    return snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() } as Product));
  },

  async bulkUpdateProducts(
    productIds: string[],
    updates: Partial<Product>
  ): Promise<void> {
    const promises = productIds.map((id) =>
      updateDoc(doc(db, 'products', id), {
        ...updates,
        updatedAt: new Date(),
      })
    );
    await Promise.all(promises);
  },
};
