'use client';

import { useEffect, useState, useCallback } from 'react';
import {
  collection,
  onSnapshot,
  query,
  where,
  orderBy,
  QueryConstraint,
  QuerySnapshot,
  DocumentData,
} from 'firebase/firestore';
import { db } from '@/lib/firebase';

interface ListenerOptions {
  orderByField?: string;
  orderByDirection?: 'asc' | 'desc';
}

export function useFirestoreListener<T extends DocumentData>(
  collectionName: string,
  filters?: Array<{ field: string; operator: string; value: any }>,
  options?: ListenerOptions
) {
  const [data, setData] = useState<(T & { id: string })[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const subscribeToUpdates = useCallback(() => {
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

      const q = query(collection(db, collectionName), ...constraints);

      const unsubscribe = onSnapshot(
        q,
        (snapshot: QuerySnapshot<T>) => {
          const docs = snapshot.docs.map((doc) => ({
            ...doc.data(),
            id: doc.id,
          }));
          setData(docs);
          setLoading(false);
        },
        (err) => {
          setError(err.message);
          setLoading(false);
        }
      );

      return unsubscribe;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Unknown error';
      setError(message);
      setLoading(false);
      return () => {};
    }
  }, [collectionName, filters, options]);

  useEffect(() => {
    const unsubscribe = subscribeToUpdates();
    return () => unsubscribe();
  }, [subscribeToUpdates]);

  return { data, loading, error };
}
