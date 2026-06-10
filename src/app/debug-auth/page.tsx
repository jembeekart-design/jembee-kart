"use client";

export const dynamic = "force-dynamic";

import { useEffect, useState } from "react";

import {
  GoogleAuthProvider,
  onAuthStateChanged,
  signInWithPopup,
  signOut,
} from "firebase/auth";

import { auth } from "@/firebase/config";

export default function DebugAuthPage() {
  const [logs, setLogs] = useState<string[]>([]);
  const [userData, setUserData] = useState<any>(null);

  function addLog(message: string) {
    console.log(message);

    setLogs((prev) => [
      ...prev,
      `${new Date().toLocaleTimeString()} → ${message}`,
    ]);
  }

  useEffect(() => {
    addLog("🚀 Debug Auth Page Loaded");

    addLog(`🌐 Hostname: ${window.location.hostname}`);

    addLog(
      `🔥 Auth Domain: ${
        auth.config.authDomain || "NOT FOUND"
      }`
    );

    if (auth.currentUser) {
      addLog(
        `✅ Current User Found: ${auth.currentUser.email}`
      );
    } else {
      addLog("❌ NO USER FOUND");
    }

    const unsubscribe = onAuthStateChanged(
      auth,
      (user) => {
        if (user) {
          addLog(
            `🟢 AUTH STATE USER: ${user.email}`
          );

          setUserData({
            uid: user.uid,
            email: user.email,
            displayName: user.displayName,
            emailVerified: user.emailVerified,
            provider:
              user.providerData?.[0]?.providerId,
          });
        } else {
          addLog(
            "🔴 AUTH STATE RETURNED NULL USER"
          );

          setUserData(null);
        }
      }
    );

    return () => unsubscribe();
  }, []);

  async function testGoogleLogin() {
    try {
      addLog(
        "⚡ Starting Google Login Flow..."
      );

      const provider =
        new GoogleAuthProvider();

      provider.setCustomParameters({
        prompt: "select_account",
      });

      const result =
        await signInWithPopup(
          auth,
          provider
        );

      addLog(
        `✅ GOOGLE LOGIN SUCCESS: ${result.user.email}`
      );

      setUserData({
        uid: result.user.uid,
        email: result.user.email,
        displayName:
          result.user.displayName,
        emailVerified:
          result.user.emailVerified,
        provider:
          result.user.providerData?.[0]
            ?.providerId,
      });
    } catch (error: any) {
      addLog(
        `❌ GOOGLE LOGIN ERROR: ${
          error.code || error.message
        }`
      );
    }
  }

  async function testLogout() {
    try {
      await signOut(auth);

      addLog("🚪 Logout Success");

      setUserData(null);
    } catch (error: any) {
      addLog(
        `❌ Logout Error: ${
          error.message
        }`
      );
    }
  }

  return (
    <main className="min-h-screen bg-black text-white p-6">
      <h1 className="text-4xl font-black mb-6">
        JembeeKart Auth Debug
      </h1>

      <div className="flex gap-4 mb-6">
        <button
          onClick={testGoogleLogin}
          className="bg-green-600 px-5 py-3 rounded-xl font-bold"
        >
          Test Google Login
        </button>

        <button
          onClick={testLogout}
          className="bg-red-600 px-5 py-3 rounded-xl font-bold"
        >
          Logout
        </button>
      </div>

      <div className="bg-zinc-900 rounded-3xl p-5 mb-6">
        <h2 className="font-black mb-4">
          Current User
        </h2>

        <pre className="text-sm overflow-auto">
          {JSON.stringify(
            userData,
            null,
            2
          )}
        </pre>
      </div>

      <div className="bg-zinc-900 rounded-3xl p-5">
        <h2 className="font-black mb-4">
          Debug Logs
        </h2>

        <div className="space-y-2 text-sm font-mono">
          {logs.map((log, index) => (
            <div key={index}>
              {log}
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}
