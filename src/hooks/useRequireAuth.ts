import { useRouter, usePathname, useSearchParams } from 'next/navigation';
import { auth } from '@/firebase/config';
import { onAuthStateChanged } from 'firebase/auth';
import { useEffect, useState } from 'react';

export const useRequireAuth = () => {
  const router = useRouter();
  const pathname = usePathname();
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setIsAuthenticated(!!user);
    });
    return () => unsubscribe();
  }, []);

  const requireAuth = (callback: () => void, actionType?: string, actionData?: string) => {
    if (auth.currentUser) {
      callback();
    } else {
      if (actionType) {
        localStorage.setItem('jbk_pending_action_type', actionType);
        if (actionData) {
          localStorage.setItem('jbk_pending_action_data', actionData);
        }
      }
      router.push(`/login?redirect=${encodeURIComponent(pathname)}`);
    }
  };

  return { isAuthenticated, requireAuth };
};
