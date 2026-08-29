'use client';

import { useEffect, useState, useCallback } from 'react';
import {
  doc,
  getDoc,
  onSnapshot,
  updateDoc,
  setDoc,
  DocumentData,
} from 'firebase/firestore';
import { db } from '@/lib/firebase';

export function useFirestoreDocument<T extends DocumentData>(
  collectionName: string,
  documentId: string,
  realtime = true
) {
  const [data, setData] = useState<(T & { id: string }) | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!documentId) {
      setLoading(false);
      return;
    }

    const docRef = doc(db, collectionName, documentId);

    if (realtime) {
      const unsubscribe = onSnapshot(
        docRef,
        (snapshot) => {
          if (snapshot.exists()) {
            setData({ ...snapshot.data(), id: snapshot.id } as T & { id: string });
          }
          setLoading(false);
        },
        (err) => {
          setError(err.message);
          setLoading(false);
        }
      );

      return () => unsubscribe();
    } else {
      getDoc(docRef)
        .then((snapshot) => {
          if (snapshot.exists()) {
            setData({ ...snapshot.data(), id: snapshot.id } as T & { id: string });
          }
          setLoading(false);
        })
        .catch((err) => {
          setError(err.message);
          setLoading(false);
        });
    }
  }, [collectionName, documentId, realtime]);

  const updateDocument = useCallback(
    async (updates: Partial<T>) => {
      if (!documentId) throw new Error('Document ID is required');

      try {
        const docRef = doc(db, collectionName, documentId);
        await updateDoc(docRef, updates);
      } catch (err) {
        throw new Error(
          err instanceof Error ? err.message : 'Failed to update document'
        );
      }
    },
    [collectionName, documentId]
  );

  const setDocument = useCallback(
    async (newData: T, merge = true) => {
      if (!documentId) throw new Error('Document ID is required');

      try {
        const docRef = doc(db, collectionName, documentId);
        await setDoc(docRef, newData, { merge });
      } catch (err) {
        throw new Error(
          err instanceof Error ? err.message : 'Failed to set document'
        );
      }
    },
    [collectionName, documentId]
  );

  return {
    data,
    loading,
    error,
    updateDocument,
    setDocument,
  };
}
