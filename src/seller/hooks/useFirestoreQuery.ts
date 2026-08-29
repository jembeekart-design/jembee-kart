'use client';

import { useEffect, useState } from 'react';
import {
  collection,
  getDocs,
  query,
  where,
  limit,
  orderBy,
  QueryConstraint,
  DocumentData,
} from 'firebase/firestore';
import { db } from '@/lib/firebase';

interface QueryOptions {
  orderByField?: string;
  orderByDirection?: 'asc' | 'desc';
}

export function useFirestoreQuery<T extends DocumentData>(
  collectionName: string,
  filters?: Array<{ field: string; operator: string; value: any }>,
  limitCount?: number,
  options?: QueryOptions
) {
  const [data, setData] = useState<(T & { id: string })[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const constraints: QueryConstraint[] = [];

        if (filters) {
          filters.forEach(({ field, operator, value }) => {
            if (operator === '==') {
              constraints.push(where(field, '==', value));
            } else if (operator === '<') {
              constraints.push(where(field, '<', value));
            } else if (operator === '>') {
              constraints.push(where(field, '>', value));
            } else if (operator === '<=') {
              constraints.push(where(field, '<=', value));
            } else if (operator === '>=') {
              constraints.push(where(field, '>=', value));
            } else if (operator === 'in') {
              constraints.push(where(field, 'in', value));
            }
          });
        }

        if (options?.orderByField) {
          constraints.push(
            orderBy(options.orderByField, options.orderByDirection || 'asc')
          );
        }

        if (limitCount) {
          constraints.push(limit(limitCount));
        }

        const q = query(collection(db, collectionName), ...constraints);
        const snapshot = await getDocs(q);
        const docs = snapshot.docs.map((doc) => ({
          ...doc.data(),
          id: doc.id,
        })) as (T & { id: string })[];

        setData(docs);
        setError(null);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unknown error');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [collectionName, filters, limitCount, options]);

  return { data, loading, error };
}
