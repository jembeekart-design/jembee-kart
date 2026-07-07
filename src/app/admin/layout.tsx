"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { onAuthStateChanged } from "firebase/auth";
import { collection, getDocs } from "firebase/firestore"; // Query ki jagah sab fetch karenge
import { auth, db } from "@/firebase/config";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [debugLog, setDebugLog] = useState<string>("Scanning Database...");

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (!user) {
        router.replace("/login");
        return;
      }

      try {
        // Pura collection fetch karte hain ye dekhne ke liye ki kya data hai
        const querySnapshot = await getDocs(collection(db, "users"));
        
        let foundUser = null;
        
        // Manual loop chala kar check karte hain ki kis field mein Auth UID match ho raha hai
        querySnapshot.forEach((doc) => {
          const data = doc.data();
          // Yahan hum sabhi fields check karenge
          if (data.uid === user.uid || data.userId === user.uid || doc.id === user.uid) {
            foundUser = data;
          }
        });

        if (!foundUser) {
          setDebugLog(`User not found in DB! Auth UID: ${user.uid}. Please verify if this UID exists in your Firestore 'users' collection.`);
          return;
        }

        const userData = foundUser as any;
        
        if (userData.role === "admin" || userData.role === "super_admin") {
          setLoading(false);
        } else {
          setDebugLog(`Access Denied. Found role: ${userData.role}`);
        }
      } catch (err) {
        setDebugLog(`Error: ${err instanceof Error ? err.message : "Unknown"}`);
      }
    });

    return () => unsubscribe();
  }, [router]);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center p-4">
        <div className="bg-black text-green-400 p-4 rounded-lg font-mono text-xs w-full max-w-sm">
          {debugLog}
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
