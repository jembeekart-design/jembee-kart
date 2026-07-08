"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { onAuthStateChanged } from "firebase/auth";
import { collection, getDocs } from "firebase/firestore";
import { auth, db } from "@/firebase/config"; // Ensure this path is correct

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [debugLog, setDebugLog] = useState("Initializing...");

  useEffect(() => {
    // 1. Check if auth is defined
    if (!auth) {
      setDebugLog("Error: Firebase Auth not initialized.");
      return;
    }

    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      try {
        if (!user) {
          setDebugLog("No user found. Redirecting...");
          router.replace("/admin/login");
          return;
        }

        setDebugLog("User Auth OK. Checking Firestore...");

        // 2. Fetching data
        const snapshot = await getDocs(collection(db, "users"));
        
        setDebugLog(
          `Firestore Connected!\nDocs Found: ${snapshot.size}\nUID: ${user.uid}`
        );

        // Chhota delay taaki aap log padh sakein (optional)
        setTimeout(() => setLoading(false), 1000);

      } catch (err: any) {
        console.error("Firestore Error:", err);
        setDebugLog("FIRESTORE ERROR:\n" + (err.message || "Unknown error"));
      }
    });

    return () => unsubscribe();
  }, [router]);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center p-4 bg-gray-900">
        <div className="bg-black text-green-400 p-6 rounded-lg font-mono whitespace-pre-wrap w-full max-w-md border border-green-800">
          <div className="text-sm opacity-70 mb-2">DEBUG CONSOLE</div>
          {debugLog}
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
