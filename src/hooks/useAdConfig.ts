// src/hooks/useAdConfig.ts

import { useState, useEffect } from 'react';
import { getFirestore, doc, onSnapshot } from 'firebase/firestore';
import { app } from '@/firebase/config';

export const useAdConfig = (networkId: string) => {
  const [config, setConfig] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const db = getFirestore(app);
    const unsub = onSnapshot(doc(db, 'ads_config', networkId), (doc) => {
      if (doc.exists()) {
        setConfig(doc.data());
      }
      setLoading(false);
    });

    return () => unsub();
  }, [networkId]);

  return { config, loading };
};
