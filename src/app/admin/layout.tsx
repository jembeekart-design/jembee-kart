"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { onAuthStateChanged } from "firebase/auth";
import { collection, query, where, getDocs } from "firebase/firestore";
import { auth, db } from "@/firebase/config";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [debugLog, setDebugLog] = useState<string>("Initializing...");

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      // 1. User check
      if (!user) {
        setDebugLog("No user found. Redirecting to login...");
        setTimeout(() => router.replace("/login"), 2000);
        return;
      }

      try {
        setDebugLog(`Fetching data for UID: ${user.uid.slice(0, 6)}...`);

        // 2. Querying the "users" collection for the specific UID field
        const usersRef = collection(db, "users");
        const q = query(usersRef, where("uid", "==", user.uid));
        const querySnapshot = await getDocs(q);

        // 3. Document validation
        if (querySnapshot.empty) {
          setDebugLog("Error: User document does not exist in Firestore.");
          return;
        }

        const userData = querySnapshot.docs[0].data();
        const isAdmin = userData.role === "admin" || userData.role === "super_admin";

        setDebugLog(`Access check: Role is '${userData.role}'`);

        // 4. Role validation
        if (isAdmin) {
          setLoading(false);
        } else {
          setDebugLog("Access Denied: You are not an admin.");
          setTimeout(() => router.replace("/"), 3000);
        }
      } catch (err) {
        setDebugLog(`System Error: ${err instanceof Error ? err.message : "Unknown"}`);
      }
    });

    return () => unsubscribe();
  }, [router]);

  // Loading state with Debugger
  if (loading) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center p-6 bg-gray-50">
        <h2 className="text-2xl font-bold mb-4 text-gray-800">Verifying Admin...</h2>
        <div className="bg-black text-green-400 p-5 rounded-xl w-full max-w-md text-sm font-mono overflow-auto shadow-2xl">
          <p className="text-white mb-3 border-b border-gray-700 pb-2">DEBUG INFO:</p>
          {debugLog}
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
