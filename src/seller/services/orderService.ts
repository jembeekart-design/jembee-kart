import {
  collection,
  updateDoc,
  doc,
  getDocs,
  query,
  where,
  orderBy,
  Timestamp,
} from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Order } from '@/seller/types';

export const orderService = {
  async updateOrderStatus(orderId: string, status: string): Promise<void> {
    await updateDoc(doc(db, 'orders', orderId), {
      status,
      updatedAt: new Date(),
    });
  },

  async getOrdersByStatus(
    sellerId: string,
    status: string,
    limit = 50
  ): Promise<Order[]> {
    const q = query(
      collection(db, 'orders'),
      where('sellerId', '==', sellerId),
      where('status', '==', status),
      orderBy('createdAt', 'desc')
    );
    const snapshot = await getDocs(q);
    return snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
      createdAt: doc.data().createdAt?.toDate(),
      updatedAt: doc.data().updatedAt?.toDate(),
    } as Order));
  },

  async getOrdersByDateRange(
    sellerId: string,
    startDate: Date,
    endDate: Date
  ): Promise<Order[]> {
    const q = query(
      collection(db, 'orders'),
      where('sellerId', '==', sellerId),
      where('createdAt', '>=', Timestamp.fromDate(startDate)),
      where('createdAt', '<=', Timestamp.fromDate(endDate)),
      orderBy('createdAt', 'desc')
    );
    const snapshot = await getDocs(q);
    return snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
      createdAt: doc.data().createdAt?.toDate(),
      updatedAt: doc.data().updatedAt?.toDate(),
    } as Order));
  },

  async bulkUpdateOrderStatus(
    orderIds: string[],
    status: string
  ): Promise<void> {
    const promises = orderIds.map((id) =>
      updateDoc(doc(db, 'orders', id), {
        status,
        updatedAt: new Date(),
      })
    );
    await Promise.all(promises);
  },
};
