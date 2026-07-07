"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { onAuthStateChanged } from "firebase/auth";
import { collection, query, where, getDocs } from "firebase/firestore";
import { auth, db } from "@/firebase/config";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [debugLog, setDebugLog] = useState<string>("Checking...");

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (!user) {
        router.replace("/login");
        return;
      }

      try {
        setDebugLog(`Auth UID: ${user.uid}`);

        // QUERY: 'users' collection mein wo doc dhoondo jahan 'uid' field = Auth UID
        const q = query(collection(db, "users"), where("uid", "==", user.uid));
        const snapshot = await getDocs(q);

        if (snapshot.empty) {
          setDebugLog(`Error: No doc found with uid: ${user.uid}`);
          return;
        }

        const userData = snapshot.docs[0].data();
        
        if (userData.role === "admin" || userData.role === "super_admin") {
          setLoading(false);
        } else {
          setDebugLog(`Access Denied. Current role: ${userData.role}`);
          setTimeout(() => router.replace("/"), 2000);
        }
      } catch (err) {
        setDebugLog(`Error: ${err instanceof Error ? err.message : "Unknown"}`);
      }
    });

    return () => unsubscribe();
  }, [router]);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center p-4 text-center">
        <div className="bg-black text-green-400 p-4 rounded-lg font-mono text-sm">
          <p>DEBUG:</p>
          {debugLog}
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
