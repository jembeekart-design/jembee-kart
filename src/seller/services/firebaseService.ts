import {
  collection,
  getDocs,
  query,
  where,
  writeBatch,
  doc,
} from 'firebase/firestore';
import { db } from '@/lib/firebase';

export const firebaseService = {
  async batchUpdateDocuments(
    collectionName: string,
    updates: Array<{ docId: string; data: Record<string, any> }>
  ): Promise<void> {
    const batch = writeBatch(db);

    updates.forEach(({ docId, data }) => {
      const docRef = doc(db, collectionName, docId);
      batch.update(docRef, data);
    });

    await batch.commit();
  },

  async queryDocuments<T>(
    collectionName: string,
    filters: Array<{ field: string; operator: string; value: any }>
  ): Promise<Array<T & { id: string }>> {
    const constraints = filters.map(({ field, operator, value }) => {
      if (operator === '==') return where(field, '==', value);
      if (operator === '<') return where(field, '<', value);
      if (operator === '>') return where(field, '>', value);
      if (operator === '<=') return where(field, '<=', value);
      if (operator === '>=') return where(field, '>=', value);
      if (operator === 'in') return where(field, 'in', value);
      return null;
    });

    const q = query(
      collection(db, collectionName),
      ...constraints.filter(Boolean)
    );
    const snapshot = await getDocs(q);

    return snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    } as T & { id: string }));
  },

  async countDocuments(
    collectionName: string,
    filters?: Array<{ field: string; operator: string; value: any }>
  ): Promise<number> {
    const constraints = (filters || []).map(({ field, operator, value }) => {
      if (operator === '==') return where(field, '==', value);
      if (operator === '<') return where(field, '<', value);
      if (operator === '>') return where(field, '>', value);
      return null;
    });

    const q = query(
      collection(db, collectionName),
      ...constraints.filter(Boolean)
    );
    const snapshot = await getDocs(q);

    return snapshot.size;
  },
};
