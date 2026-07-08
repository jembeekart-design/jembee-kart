"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { onAuthStateChanged } from "firebase/auth";
import { collection, getDocs } from "firebase/firestore";
import { auth, db } from "@/firebase/config";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [debugLog, setDebugLog] = useState<string>("Fetching DB...");

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (!user) {
        router.replace("/admin/login");
        return;
      }

      try {
        const querySnapshot = await getDocs(collection(db, "users"));
        console.log("TOTAL USERS:", querySnapshot.size);
        // --- YE PART IMPORTANT HAI ---
        // Hum console mein nahi, seedha screen par check karenge ki database mein kya hai
        let allUids: string[] = [];
        querySnapshot.forEach((doc) => {
          allUids.push(doc.data().uid || doc.id);
        });

        const exists = allUids.includes(user.uid);
        console.log("LOGIN UID:", user.uid);
console.log("ALL UIDS:", allUids);
console.log("EXISTS:", exists);
        if (!exists) {
          setDebugLog(
            `CRITICAL ERROR:\n\n` +
            `Logged in Auth UID: ${user.uid}\n\n` +
            `Database mein maujood UIDs: ${allUids.join(", ")}\n\n` +
            `Dono match nahi ho rahe hain. Check karein ki aapne sahi Firebase project setup kiya hai ya nahi.`
          );
          setLoading(false);
        } else {
          setLoading(false);
        }
      } catch (err: any) {
        setDebugLog(`Firestore Error: ${err.message}`);
      }
    });

    return () => unsubscribe();
  }, [router]);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center p-4">
        <div className="bg-black text-green-400 p-4 rounded-lg font-mono text-xs w-full max-w-sm whitespace-pre-wrap">
          {debugLog}
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
