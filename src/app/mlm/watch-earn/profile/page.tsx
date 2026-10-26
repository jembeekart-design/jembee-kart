"use client";

import { useEffect, useState } from "react";
import ShortsProfile from "../components/ShortsProfile";
import { auth } from "@/firebase/config";

export default function ProfilePage() {
  const [earned, setEarned] = useState<number | null>(null);
  useEffect(() => {
    let active = true;
    const load = async () => {
      const user = auth.currentUser;
      if (!user) { if (active) setEarned(null); return; }
      try {
        const token = await user.getIdToken();
        const response = await fetch("/api/monetag/earnings", { headers: { Authorization: `Bearer ${token}` } });
        const data = await response.json();
        if (!response.ok || !data.success) return;
        const total = (data.earnings || []).filter((item: { role?: string; status?: string }) => item.role === "uploader" && item.status === "confirmed").reduce((sum: number, item: { amountUsd?: number }) => sum + Number(item.amountUsd || 0), 0);
        if (active) setEarned(total);
      } catch { /* Keep the existing profile usable if earnings are unavailable. */ }
    };
    const unsubscribe = auth.onAuthStateChanged(() => { void load(); });
    return () => { active = false; unsubscribe(); };
  }, []);
  return <><ShortsProfile />{earned !== null && <aside className="fixed bottom-24 left-3 z-40 rounded-xl border border-white/15 bg-black/85 px-4 py-3 text-white shadow-lg"><p className="text-xs text-white/70">आपकी सत्यापित वीडियो कमाई</p><p className="text-lg font-bold">${earned.toFixed(2)} USD</p></aside>}</>;
}
