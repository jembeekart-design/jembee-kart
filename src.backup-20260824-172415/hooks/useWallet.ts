import { useState, useEffect } from 'react';
import { doc, onSnapshot } from 'firebase/firestore';
import { auth, db } from '@/firebase/config';

export interface WalletData {
  walletBalance: number;
  commissionWallet: number;
  rewardWallet: number;
  cashbackWallet: number;
  totalIncome: number;
  todayIncome: number;
}

export const useWallet = () => {
  const [wallet, setWallet] = useState<WalletData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!auth.currentUser) {
      setLoading(false);
      return;
    }

    const userRef = doc(db, 'users', auth.currentUser.uid);
    const unsubscribe = onSnapshot(userRef, (doc) => {
      if (doc.exists()) {
        const data = doc.data();
        setWallet({
          walletBalance: data.walletBalance || 0,
          commissionWallet: data.commissionWallet || 0,
          rewardWallet: data.rewardWallet || 0,
          cashbackWallet: data.cashbackWallet || 0,
          totalIncome: data.totalIncome || 0,
          todayIncome: data.todayIncome || 0,
        });
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, [auth.currentUser]);

  return { wallet, loading };
};
