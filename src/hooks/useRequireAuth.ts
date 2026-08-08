import { useRouter, usePathname } from 'next/navigation';
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

  const requireAuth = (callback: () => void) => {
    if (auth.currentUser) {
      callback();
    } else {
      // Redirect to login with the current path as a return parameter
      router.push(`/login?redirect=${encodeURIComponent(pathname)}`);
    }
  };

  return { isAuthenticated, requireAuth };
};
