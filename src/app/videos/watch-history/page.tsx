"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { auth } from "@/firebase/config";
import { Play, RefreshCw } from "lucide-react";

interface HistoryItem {
  sessionId: string;
  videoId: string;
  title: string;
  caption: string;
  thumbnail: string;
  creatorName: string;
  startedAt: string | null;
  elapsedSeconds: number;
}

function formatTime(seconds: number) {
  const safe = Math.max(0, Math.floor(seconds));
  return `${Math.floor(safe / 60)}:${String(safe % 60).padStart(2, "0")}`;
}

export default function WatchHistoryPage() {
  const [items, setItems] = useState<HistoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const load = useCallback(async () => {
    const user = auth.currentUser;
    if (!user) {
      setError("Watch History देखने के लिए login करें।");
      setLoading(false);
      return;
    }
    setLoading(true);
    setError("");
    try {
      const token = await user.getIdToken();
      const response = await fetch("/api/shorts/watch-history", {
        headers: { Authorization: `Bearer ${token}` },
        cache: "no-store",
      });
      const result = await response.json();
      if (!response.ok || result.success !== true || !Array.isArray(result.items)) throw new Error("History load failed");
      setItems(result.items as HistoryItem[]);
    } catch {
      setError("Watch History अभी उपलब्ध नहीं है। दोबारा कोशिश करें।");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const timer = window.setTimeout(() => { void load(); }, 0);
    return () => window.clearTimeout(timer);
  }, [load]);

  return (
    <main className="min-h-screen bg-[#080d18] px-4 py-6 text-white">
      <header className="mx-auto flex max-w-4xl items-center justify-between gap-3">
        <div>
          <Link href="/videos" className="text-sm text-cyan-300">← JEMBEE PLAY</Link>
          <h1 className="mt-2 text-2xl font-black">Watch History</h1>
          <p className="mt-1 text-sm text-slate-400">आपके हाल के free video playback sessions</p>
        </div>
        <button onClick={() => void load()} disabled={loading} className="rounded-full bg-white/10 p-3 disabled:opacity-50" aria-label="Refresh">
          <RefreshCw size={18} className={loading ? "animate-spin" : ""}/>
        </button>
      </header>
      <section className="mx-auto mt-6 max-w-4xl">
        {loading ? <p className="py-10 text-center text-slate-400">Loading…</p> :
          error ? <div role="alert" className="rounded-xl border border-amber-300/20 p-5 text-amber-100">{error}</div> :
          items.length === 0 ? <div className="rounded-xl border border-white/10 p-8 text-center text-slate-400">अभी कोई watch session नहीं है।</div> :
          <div className="space-y-3">
            {items.map((item) => (
              <article key={item.sessionId} className="flex gap-3 rounded-xl border border-white/10 bg-white/[0.04] p-3">
                <Link href={`/videos?v=${encodeURIComponent(item.videoId)}`} className="relative aspect-video w-36 shrink-0 overflow-hidden rounded-lg bg-black sm:w-48">
                  {item.thumbnail.startsWith("https://") ? <img src={item.thumbnail} alt="" className="h-full w-full object-cover"/> : <div className="grid h-full place-items-center text-slate-500">JEMBEE</div>}
                  <span className="absolute inset-0 grid place-items-center bg-black/20"><Play size={24} fill="white"/></span>
                </Link>
                <div className="min-w-0 flex-1 py-1">
                  <h2 className="line-clamp-2 text-sm font-bold">{item.title || item.caption || "Untitled video"}</h2>
                  <p className="mt-1 truncate text-xs text-slate-400">{item.creatorName || "JEMBEE PLAY creator"}</p>
                  <p className="mt-2 text-xs text-slate-500">{item.startedAt ? new Date(item.startedAt).toLocaleString() : "Date unavailable"} · {formatTime(item.elapsedSeconds)} latest session · {item.sessionCount} session{item.sessionCount === 1 ? "" : "s"}</p>
                  <Link href={`/videos?v=${encodeURIComponent(item.videoId)}`} className="mt-2 inline-flex items-center gap-1 text-xs font-bold text-cyan-300">Watch again <Play size={12}/></Link>
                </div>
              </article>
            ))}
          </div>}
        <p className="mt-5 text-xs leading-5 text-slate-500">यह playback session history है, verified watch time नहीं। इससे coins, rewards या wallet balance credit नहीं होते। पिछले 50 sessions scan करके प्रति वीडियो एक entry दिखाई जाती है।</p>
      </section>
    </main>
  );
}
