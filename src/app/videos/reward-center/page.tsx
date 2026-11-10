"use client";
import { useEffect, useState } from "react";
import { doc, getDoc } from "firebase/firestore";
import { db, auth } from "@/firebase/config";

export default function RewardCenterPage() {
  const [data, setData] = useState<Record<string, unknown> | null>(null);
  useEffect(() => {
    async function load() {
      const uid = auth.currentUser?.uid;
      if (!uid) return;
      const userRef = doc(db, "users", uid);
      const userSnap = await getDoc(userRef);
      if (userSnap.exists()) setData(userSnap.data());
    }
    load();
  }, []);
  const walletBalance = typeof data?.walletBalance === "number" ? data.walletBalance : 0;

  return (
    <main className="min-h-screen bg-black p-4 text-white">
      <h1 className="text-2xl font-black">Reward Center</h1>
      <p>Coins: {walletBalance}</p>
      {/* UI implementation as per requirements */}
    </main>
  );
}