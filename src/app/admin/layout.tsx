"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { onAuthStateChanged } from "firebase/auth";
import { collection, getDocs } from "firebase/firestore";
import { auth, db } from "@/firebase/config";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();

  const [loading, setLoading] = useState(true);
  const [debugLog, setDebugLog] = useState("Starting...");

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      try {
        if (!user) {
          router.replace("/admin/login");
          return;
        }

        setDebugLog("Auth OK\nLoading Firestore...");

        const snapshot = await getDocs(collection(db, "users"));

        setDebugLog(
          `Firestore Connected\n\nDocuments: ${snapshot.size}\n\nLogged UID:\n${user.uid}`
        );

        setLoading(false);
      } catch (err: any) {
        setDebugLog(
          "FIRESTORE ERROR\n\n" + (err?.message || "Unknown Error")
        );
        setLoading(false);
      }
    });

    return () => unsubscribe();
  }, [router]);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center p-4">
        <div className="bg-black text-green-400 p-4 rounded-lg font-mono whitespace-pre-wrap w-full max-w-md">
          {debugLog}
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
