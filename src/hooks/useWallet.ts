import { useEffect, useState } from 'react';
import { doc, onSnapshot } from 'firebase/firestore';
import { onAuthStateChanged } from 'firebase/auth';
import { auth, db } from '@/firebase/config';

export interface WalletData {
  walletBalance: number;
  commissionWallet: number;
  rewardWallet: number;
  cashbackWallet: number;
  totalIncome: number;
  todayIncome: number;
}

const toFiniteAmount = (value: unknown): number => {
  const amount = typeof value === 'number' ? value : Number(value ?? 0);
  return Number.isFinite(amount) && amount >= 0 ? amount : 0;
};

export const useWallet = () => {
  const [wallet, setWallet] = useState<WalletData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let unsubscribeWallet: (() => void) | undefined;
    let active = true;
    const unsubscribeAuth = onAuthStateChanged(auth, (user) => {
      unsubscribeWallet?.();
      unsubscribeWallet = undefined;
      if (!active) return;
      setWallet(null);
      setError(null);
      if (!user) {
        setLoading(false);
        return;
      }
      setLoading(true);
      unsubscribeWallet = onSnapshot(
        doc(db, 'users', user.uid),
        (snapshot) => {
          if (!active) return;
          if (!snapshot.exists()) {
            setWallet(null);
          } else {
            const data = snapshot.data();
            setWallet({
              walletBalance: toFiniteAmount(data.walletBalance),
              commissionWallet: toFiniteAmount(data.commissionWallet),
              rewardWallet: toFiniteAmount(data.rewardWallet),
              cashbackWallet: toFiniteAmount(data.cashbackWallet),
              totalIncome: toFiniteAmount(data.totalIncome),
              todayIncome: toFiniteAmount(data.todayIncome),
            });
          }
          setLoading(false);
        },
        (snapshotError) => {
          console.error('Wallet subscription failed:', snapshotError);
          if (!active) return;
          setWallet(null);
          setError('Wallet balance is temporarily unavailable. Please try again later.');
          setLoading(false);
        },
      );
    });

    return () => {
      active = false;
      unsubscribeWallet?.();
      unsubscribeAuth();
    };
  }, []);

  return { wallet, loading, error };
};
