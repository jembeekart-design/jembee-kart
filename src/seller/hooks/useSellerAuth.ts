'use client';

import { useEffect, useState } from 'react';
import { onAuthStateChanged, User } from 'firebase/auth';
import { auth } from '@/lib/firebase';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import useSellerStore from '@/seller/stores/sellerStore';

interface SellerProfile {
  uid: string;
  email: string;
  sellerName: string;
  storeName: string;
  profileImage?: string;
  verified: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export function useSellerAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [seller, setSeller] = useState<SellerProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { setCurrentSeller } = useSellerStore();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      try {
        setUser(currentUser);

        if (currentUser) {
          const sellerDoc = await getDoc(
            doc(db, 'sellers', currentUser.uid)
          );

          if (sellerDoc.exists()) {
            const sellerData = sellerDoc.data() as SellerProfile;
            setSeller(sellerData);
            setCurrentSeller(sellerData);
          }
        } else {
          setSeller(null);
          setCurrentSeller(null);
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred');
      } finally {
        setLoading(false);
      }
    });

    return () => unsubscribe();
  }, [setCurrentSeller]);

  return { user, seller, loading, error, isAuthenticated: !!user };
}
