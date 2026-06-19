"use client";

import { useEffect, useState } from "react";
import { onAuthStateChanged, User } from "firebase/auth";
import { doc, onSnapshot } from "firebase/firestore";
import { auth, db } from "@/firebase/config";
import { Loader2, ShieldAlert } from "lucide-react";

export default function DashboardGuard({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isSyncing, setIsSyncing] = useState<boolean>(true);
  const [docExists, setDocExists] = useState<boolean>(false);

  useEffect(() => {
    const unsubscribeAuth = onAuthStateChanged(auth, (currentUser) => {
      if (!currentUser) {
        setUser(null);
        setIsSyncing(false);
        return;
      }
      setUser(currentUser);

      // Issue 1 Fix: Real-time network stream targeting the user account record node
      const userDocRef = doc(db, "users", currentUser.uid);
      
      const unsubscribeSnap = onSnapshot(userDocRef, (snapshot) => {
        if (snapshot.exists()) {
          setDocExists(true);
          setIsSyncing(false);
        } else {
          // If Auth trigger function is experiencing cold-start delay, catch it here cleanly
          setDocExists(false);
          setIsSyncing(true); 
        }
      }, (error) => {
        console.error("Critical Security Handshake Failure:", error);
        setIsSyncing(false);
      });

      return () => unsubscribeSnap();
    });

    return () => unsubscribeAuth();
  }, []);

  if (isSyncing) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-slate-900 text-white p-6 text-center">
        <div className="relative flex items-center justify-center mb-4">
          <Loader2 className="animate-spin text-indigo-400 absolute" size={54} strokeWidth={1.5} />
          <div className="h-2 w-2 rounded-full bg-emerald-400 animate-ping" />
        </div>
        <h3 className="text-sm font-black uppercase tracking-widest text-slate-200">Securing Ledger Space</h3>
        <p className="text-[11px] font-medium text-slate-400 max-w-xs mt-1.5 leading-relaxed">
          Initial user profile generation structure state is getting verified by JembeeKart Node Engine. Please wait a moment...
        </p>
      </div>
    );
  }

  // Fallback for extreme unexpected error contexts
  if (user && !docExists) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-slate-900 text-white p-6 text-center">
        <ShieldAlert className="text-amber-400 mb-2" size={32} />
        <h3 className="text-xs font-black uppercase tracking-wider text-amber-400">Account Provisioning Interrupted</h3>
        <p className="text-[11px] text-slate-400 max-w-xs mt-1">
          Server side background runtime is facing network saturation. Refreshing your dashboard or context connection may clear this state thread.
        </p>
      </div>
    );
  }

  return <>{children}</>;
}
