"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { auth } from "@/firebase/config";
import { onAuthStateChanged } from "firebase/auth";
import { ArrowLeft, Clock3, Play, Trash2 } from "lucide-react";

type HistoryItem = {
  videoId: string;
  title: string;
  thumbnail: string;
  durationSeconds: number;
  positionSeconds: number;
  updatedAt: number;
};

function formatTime(seconds: number) {
  const safe = Math.max(0, Math.floor(seconds));
  const hours = Math.floor(safe / 3600);
  const minutes = Math.floor((safe % 3600) / 60);
  const remainder = safe % 60;
  return hours ? `${hours}:${String(minutes).padStart(2, "0")}:${String(remainder).padStart(2, "0")}` : `${minutes}:${String(remainder).padStart(2, "0")}`;
}

export default function ViewerWatchHistoryPage() {
  const [items, setItems] = useState<HistoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");
  const [removing, setRemoving] = useState("");

  const loadHistory = useCallback(async () => {
    const user = auth.currentUser;
    if (!user) {
      setItems([]);
      setMessage("अपनी Watch History देखने के लिए login करें।");
      setLoading(false);
      return;
    }
    setLoading(true);
    try {
      const token = await user.getIdToken();
      const response = await fetch("/api/videos/watch-history", {
        headers: { Authorization: `Bearer ${token}` },
        cache: "no-store",
      });
      const result = await response.json().catch(() => null);
      if (!response.ok || !result?.success || !Array.isArray(result.history)) {
        throw new Error("History unavailable");
      }
      setItems(result.history as HistoryItem[]);
      setMessage("");
    } catch {
      setMessage("Watch History अभी load नहीं हो सकी। दोबारा कोशिश करें।");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, () => { void loadHistory(); });
    return () => unsubscribe();
  }, [loadHistory]);

  const removeItem = async (videoId: string) => {
    const user = auth.currentUser;
    if (!user) return;
    setRemoving(videoId);
    try {
      const token = await user.getIdToken();
      const response = await fetch(`/api/videos/watch-history?videoId=${encodeURIComponent(videoId)}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!response.ok) throw new Error("Delete failed");
      setItems((current) => current.filter((item) => item.videoId !== videoId));
    } catch {
      setMessage("इस वीडियो को History से हटाया नहीं जा सका।");
    } finally {
      setRemoving("");
    }
  };

  return (
    <main className="min-h-screen bg-[#080d18] px-4 py-6 text-white">
      <div className="mx-auto max-w-4xl">
        <header className="mb-7 flex items-center gap-3">
          <Link href="/videos" className="rounded-full bg-white/10 p-2" aria-label="Back to videos"><ArrowLeft size={19}/></Link>
          <div><p className="text-xs font-bold uppercase tracking-widest text-cyan-300">Your library</p><h1 className="text-2xl font-black">Watch History</h1></div>
        </header>
        {loading ? <p className="rounded-xl bg-white/5 p-6 text-sm text-slate-300">History लोड हो रही है…</p> :
          items.length === 0 ? <div className="rounded-2xl border border-dashed border-white/15 p-10 text-center"><Clock3 className="mx-auto mb-3 text-slate-500" size={32}/><p className="font-semibold">अभी कोई Watch History नहीं है।</p><p className="mt-2 text-sm text-slate-400">Long video देखना शुरू करें। आपका progress यहाँ दिखाई देगा।</p><Link href="/videos" className="mt-4 inline-flex rounded-full bg-cyan-400 px-4 py-2 text-sm font-bold text-slate-950">Browse videos</Link></div> :
          <div className="space-y-3">{items.map((item) => {
            const percent = item.durationSeconds > 0 ? Math.min(100, item.positionSeconds / item.durationSeconds * 100) : 0;
            const completed = percent >= 95;
            return <article key={item.videoId} className="flex gap-3 rounded-2xl border border-white/10 bg-white/[0.04] p-3">
              <Link href={`/videos?v=${encodeURIComponent(item.videoId)}`} className="relative aspect-video w-36 shrink-0 overflow-hidden rounded-xl bg-black sm:w-48">
                {item.thumbnail ? <img src={item.thumbnail} alt="" className="h-full w-full object-cover"/> : <div className="grid h-full place-items-center"><Play size={25}/></div>}
                <div className="absolute inset-x-0 bottom-0 h-1 bg-white/25"><div className="h-full bg-cyan-400" style={{ width: `${percent}%` }}/></div>
              </Link>
              <div className="min-w-0 flex-1">
                <Link href={`/videos?v=${encodeURIComponent(item.videoId)}`} className="line-clamp-2 text-sm font-bold">{item.title}</Link>
                <p className="mt-2 text-xs text-slate-400">{completed ? "Completed" : `Continue · ${formatTime(item.positionSeconds)} / ${formatTime(item.durationSeconds)}`}</p>
                <div className="mt-3 flex flex-wrap items-center gap-3">
                  <Link href={`/videos?v=${encodeURIComponent(item.videoId)}`} className="inline-flex items-center gap-1 rounded-full bg-cyan-400 px-3 py-1.5 text-xs font-bold text-slate-950"><Play size={13}/>{completed ? "Watch again" : "Continue"}</Link>
                  <button type="button" onClick={() => void removeItem(item.videoId)} disabled={removing === item.videoId} className="inline-flex items-center gap-1 text-xs text-slate-400 disabled:opacity-50"><Trash2 size={13}/>Remove</button>
                </div>
              </div>
            </article>;
          })}</div>}
        {message ? <p role="status" className="mt-4 text-sm text-amber-200">{message} <button type="button" onClick={() => void loadHistory()} className="underline">Retry</button></p> : null}
      </div>
    </main>
  );
}
