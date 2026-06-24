import { collection, getDocs, query, where } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Order, Product } from '@/seller/types';

export const analyticsService = {
  async calculateTotalRevenue(
    sellerId: string,
    startDate?: Date,
    endDate?: Date
  ): Promise<number> {
    let q = query(
      collection(db, 'orders'),
      where('sellerId', '==', sellerId),
      where('status', '==', 'completed')
    );

    const snapshot = await getDocs(q);
    let total = 0;

    snapshot.forEach((doc) => {
      const order = doc.data() as Order;
      const orderDate = new Date(order.createdAt);

      if (
        (!startDate || orderDate >= startDate) &&
        (!endDate || orderDate <= endDate)
      ) {
        total += order.total || 0;
      }
    });

    return total;
  },

  async getTopSellingProducts(
    sellerId: string,
    limit = 5
  ): Promise<(Product & { sales: number })[]> {
    const ordersSnapshot = await getDocs(
      query(
        collection(db, 'orders'),
        where('sellerId', '==', sellerId),
        where('status', '==', 'completed')
      )
    );

    const productSales = new Map<string, number>();

    ordersSnapshot.forEach((doc) => {
      const order = doc.data() as Order;
      order.items?.forEach((item) => {
        const current = productSales.get(item.productId) || 0;
        productSales.set(item.productId, current + item.quantity);
      });
    });

    const productsSnapshot = await getDocs(
      query(
        collection(db, 'products'),
        where('sellerId', '==', sellerId)
      )
    );

    return productsSnapshot.docs
      .map((doc) => ({
        id: doc.id,
        ...doc.data(),
        sales: productSales.get(doc.id) || 0,
      } as Product & { sales: number }))
      .sort((a, b) => b.sales - a.sales)
      .slice(0, limit);
  },

  async getConversionMetrics(sellerId: string) {
    const productsSnapshot = await getDocs(
      query(
        collection(db, 'products'),
        where('sellerId', '==', sellerId)
      )
    );

    const ordersSnapshot = await getDocs(
      query(
        collection(db, 'orders'),
        where('sellerId', '==', sellerId)
      )
    );

    const totalViews = Array.from(productsSnapshot.docs).reduce(
      (sum, doc) => sum + ((doc.data() as Product).views || 0),
      0
    );
    const totalOrders = ordersSnapshot.size;

    return {
      conversionRate: totalViews > 0 ? (totalOrders / totalViews) * 100 : 0,
      totalViews,
      totalOrders,
    };
  },
};
