"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { onAuthStateChanged } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import { auth, db } from "@/firebase/config";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [debugLog, setDebugLog] = useState<string>("Checking Auth...");

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (!user) {
        setDebugLog("Error: No user found. Redirecting to login.");
        setTimeout(() => router.replace("/login"), 2000);
        return;
      }

      try {
        setDebugLog(`User logged in: ${user.uid.slice(0, 5)}... Fetching data...`);
        const userRef = doc(db, "users", user.uid);
        const snap = await getDoc(userRef);

        if (!snap.exists()) {
          setDebugLog("Error: User document missing in Firestore!");
          return;
        }

        const data = snap.data();
        setDebugLog(`Role found: ${data.role}`);

        if (data.role === "admin" || data.role === "super_admin") {
          setLoading(false);
        } else {
          setDebugLog(`Access Denied: Role is ${data.role}. Redirecting...`);
          setTimeout(() => router.replace("/"), 2000);
        }
      } catch (err) {
        setDebugLog(`Error: ${err instanceof Error ? err.message : "Unknown error"}`);
      }
    });

    return () => unsubscribe();
  }, [router]);

  if (loading) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center p-4 text-center">
        <h2 className="text-xl font-bold mb-4">Loading Admin...</h2>
        {/* Debug Box */}
        <div className="bg-black text-green-400 p-4 rounded-lg w-full max-w-sm text-sm font-mono overflow-auto">
          <p className="text-white mb-2 underline">DEBUG INFO:</p>
          {debugLog}
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
