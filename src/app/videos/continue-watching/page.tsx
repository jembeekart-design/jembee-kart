"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { auth } from "@/firebase/config";
import { Play, RefreshCw } from "lucide-react";

interface ProgressItem {
  videoId: string;
  title: string;
  caption: string;
  thumbnail: string;
  creatorName: string;
  durationSeconds: number | null;
  positionSeconds: number;
  updatedAt: string | null;
}

function formatTime(seconds: number) {
  const safe = Math.max(0, Math.floor(seconds));
  return `${Math.floor(safe / 60)}:${String(safe % 60).padStart(2, "0")}`;
}

export default function ContinueWatchingPage() {
  const [items, setItems] = useState<ProgressItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const load = useCallback(async () => {
    const user = auth.currentUser;
    if (!user) {
      setError("Continue Watching देखने के लिए login करें।");
      setLoading(false);
      return;
    }
    setLoading(true);
    setError("");
    try {
      const token = await user.getIdToken();
      const response = await fetch("/api/shorts/watch-progress", {
        headers: { Authorization: `Bearer ${token}` },
        cache: "no-store",
      });
      const result = await response.json();
      if (!response.ok || result.success !== true || !Array.isArray(result.items)) {
        throw new Error("Progress load नहीं हो सका।");
      }
      setItems(result.items as ProgressItem[]);
    } catch {
      setError("Continue Watching अभी उपलब्ध नहीं है। दोबारा कोशिश करें।");
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
          <h1 className="mt-2 text-2xl font-black">Continue Watching</h1>
          <p className="mt-1 text-sm text-slate-400">आपके free videos की last saved playback position</p>
        </div>
        <button onClick={() => void load()} disabled={loading} className="rounded-full bg-white/10 p-3 disabled:opacity-50" aria-label="Refresh">
          <RefreshCw size={18} className={loading ? "animate-spin" : ""}/>
        </button>
      </header>

      <section className="mx-auto mt-6 max-w-4xl">
        {loading ? <p className="py-10 text-center text-slate-400">Loading…</p> :
          error ? <div role="alert" className="rounded-xl border border-amber-300/20 p-5 text-amber-100">{error}</div> :
          items.length === 0 ? <div className="rounded-xl border border-white/10 p-8 text-center text-slate-400">अभी कोई saved playback progress नहीं है।</div> :
          <div className="space-y-3">
            {items.map((item) => {
              const duration = item.durationSeconds && item.durationSeconds > 0 ? item.durationSeconds : null;
              const progress = duration ? Math.min(100, Math.max(0, item.positionSeconds / duration * 100)) : 0;
              return (
                <article key={item.videoId} className="flex gap-3 rounded-xl border border-white/10 bg-white/[0.04] p-3">
                  <Link href={`/videos?v=${encodeURIComponent(item.videoId)}`} className="relative aspect-video w-36 shrink-0 overflow-hidden rounded-lg bg-black sm:w-48">
                    {item.thumbnail.startsWith("https://") ? <img src={item.thumbnail} alt="" className="h-full w-full object-cover"/> : <div className="grid h-full place-items-center text-slate-500">JEMBEE</div>}
                    <span className="absolute inset-0 grid place-items-center bg-black/20"><Play size={24} fill="white"/></span>
                    <span className="absolute bottom-1 right-1 rounded bg-black/80 px-1.5 py-0.5 text-[10px]">{formatTime(item.positionSeconds)}</span>
                    <span className="absolute bottom-0 left-0 h-1 bg-white/30" style={{ width: "100%" }}><span className="block h-full bg-cyan-400" style={{ width: `${progress}%` }}/></span>
                  </Link>
                  <div className="min-w-0 flex-1 py-1">
                    <h2 className="line-clamp-2 text-sm font-bold">{item.title || item.caption || "Untitled video"}</h2>
                    <p className="mt-1 truncate text-xs text-slate-400">{item.creatorName || "JEMBEE PLAY creator"}</p>
                    <p className="mt-2 text-xs text-slate-500">{duration ? `${formatTime(item.positionSeconds)} / ${formatTime(duration)}` : "Resume position saved"}</p>
                    <Link href={`/videos?v=${encodeURIComponent(item.videoId)}`} className="mt-2 inline-flex items-center gap-1 text-xs font-bold text-cyan-300">Continue <Play size={12}/></Link>
                  </div>
                </article>
              );
            })}
          </div>}
        <p className="mt-5 text-xs leading-5 text-slate-500">Saved position केवल video resume करने के लिए है। यह verified watch time या reward eligibility नहीं है।</p>
      </section>
    </main>
  );
}
