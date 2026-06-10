"use client";

import { useEffect, useState } from "react";
import { auth } from "@/firebase/config";
import { onAuthStateChanged } from "firebase/auth";

export default function DebugAuthPage() {
  const [logs, setLogs] = useState<string[]>([]);

  function addLog(message: string) {
    console.log(message);
    setLogs((prev) => [...prev, message]);
  }

  useEffect(() => {
    addLog("🚀 Debug Auth Page Loaded");

    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        addLog(`✅ USER FOUND`);
        addLog(`UID: ${user.uid}`);
        addLog(`EMAIL: ${user.email}`);
        addLog(`VERIFIED: ${user.emailVerified}`);
      } else {
        addLog("❌ NO USER FOUND");
      }
    });

    return () => unsubscribe();
  }, []);

  return (
    <main className="min-h-screen bg-black text-white p-6">
      <h1 className="text-2xl font-bold mb-6">
        JembeeKart Auth Debug
      </h1>

      <div className="rounded-xl bg-zinc-900 p-4">
        {logs.map((log, index) => (
          <div
            key={index}
            className="font-mono text-sm py-1 border-b border-zinc-800"
          >
            {log}
          </div>
        ))}
      </div>
    </main>
  );
}
