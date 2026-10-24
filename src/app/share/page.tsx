"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { auth } from "@/firebase/config";
import { onAuthStateChanged } from "firebase/auth";
import { ArrowLeft, Share2, Clock3, Users, Wallet, ExternalLink, RefreshCw } from "lucide-react";

type EventRow = { id: string; type: string; videoId?: string | null; platform?: string | null; viewerId?: string | null; followerId?: string | null; createdAt?: string | null };
type WatchRow = { id: string; videoId: string; viewerId?: string | null; seconds: number; startedAt?: string | null; updatedAt?: string | null };
type Data = { summary: { shares: number; totalWatchSeconds: number; followersGained: number; shareGoal: number; watchGoalSeconds: number; rewardAmount: number; rewardStatus: string; eligibleAt: string | null }; history: EventRow[]; watchHistory: WatchRow[] };

function formatDuration(seconds: number) {
  const s = Math.max(0, Math.floor(seconds));
  const h = Math.floor(s / 3600); const m = Math.floor((s % 3600) / 60); const r = s % 60;
  return h ? `${h}h ${m}m ${r}s` : m ? `${m}m ${r}s` : `${r}s`;
}
function dateLabel(value?: string | null) { return value ? new Date(value).toLocaleString() : "—"; }

export default function ShareCenterPage() {
  const [uid, setUid] = useState<string | null>(null);
  const [data, setData] = useState<Data | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const load = useCallback(async (userId?: string) => {
    const user = auth.currentUser;
    if (!user || (userId && user.uid !== userId)) { setLoading(false); return; }
    setLoading(true); setError("");
    try {
      const token = await user.getIdToken();
      const response = await fetch("/api/share-center", { headers: { Authorization: `Bearer ${token}` }, cache: "no-store" });
      const json = await response.json();
      if (!response.ok) throw new Error(json.error || "Share history load nahi hui");
      setData(json as Data);
    } catch (e) { setError(e instanceof Error ? e.message : "Kuch galat hua"); }
    finally { setLoading(false); }
  }, []);
  useEffect(() => onAuthStateChanged(auth, user => { setUid(user?.uid ?? null); if (user) void load(user.uid); else { setData(null); setLoading(false); } }), [load]);
  const summary = data?.summary;
  const shareProgress = Math.min(100, ((summary?.shares || 0) / (summary?.shareGoal || 2000)) * 100);
  const watchProgress = Math.min(100, ((summary?.totalWatchSeconds || 0) / (summary?.watchGoalSeconds || 60000)) * 100);

  if (!uid) return <main className="min-h-screen bg-black p-6 text-white"><Link href="/mlm/watch-earn" className="mb-8 flex items-center gap-2"><ArrowLeft size={20}/> Video par wapas</Link><h1 className="text-2xl font-bold">Share Center</h1><p className="mt-3 text-white/70">Apni share aur watch history dekhne ke liye login karein.</p><Link href="/login" className="mt-5 inline-block rounded-xl bg-cyan-400 px-5 py-3 font-bold text-black">Login</Link></main>;

  return <main className="min-h-screen bg-slate-950 px-4 pb-10 pt-6 text-white sm:px-6">
    <header className="mx-auto flex max-w-3xl items-center justify-between"><Link href="/mlm/watch-earn" className="flex items-center gap-2 text-white/80"><ArrowLeft size={20}/> Video</Link><button onClick={() => void load(uid)} className="flex items-center gap-2 rounded-xl border border-white/15 px-3 py-2 text-sm"><RefreshCw size={15}/> Refresh</button></header>
    <section className="mx-auto mt-6 max-w-3xl"><p className="text-sm font-bold uppercase tracking-[.2em] text-cyan-300">JembeeKart Video</p><h1 className="mt-2 text-3xl font-black">Share Center</h1><p className="mt-2 text-sm text-white/65">Share records aur JembeeKart player ke qualified watch time ki history.</p>
      {error && <div className="mt-4 rounded-xl border border-red-400/30 bg-red-950/40 p-3 text-sm text-red-200">{error}</div>}
      {loading ? <div className="py-14 text-center text-white/60">History load ho rahi hai…</div> : <>
      <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
        {[{label:"Total shares",value:String(summary?.shares ?? 0),icon:Share2},{label:"Qualified watch",value:formatDuration(summary?.totalWatchSeconds ?? 0),icon:Clock3},{label:"Followers gained",value:String(summary?.followersGained ?? 0),icon:Users},{label:"Reward milestone",value:`₹${summary?.rewardAmount ?? 200}`,icon:Wallet}].map(card => <div key={card.label} className="rounded-2xl border border-white/10 bg-white/[.06] p-4"><card.icon className="mb-3 text-cyan-300" size={21}/><div className="text-xl font-black">{card.value}</div><div className="mt-1 text-xs text-white/60">{card.label}</div></div>)}
      </div>
      <div className="mt-4 rounded-2xl border border-white/10 bg-white/[.06] p-4"><div className="flex justify-between gap-3 text-sm"><span>Video shares</span><b>{summary?.shares ?? 0} / 2,000</b></div><div className="mt-2 h-2 overflow-hidden rounded-full bg-white/10"><div className="h-full rounded-full bg-cyan-300" style={{width:`${shareProgress}%`}}/></div><div className="mt-4 flex justify-between gap-3 text-sm"><span>Qualified watch time</span><b>{formatDuration(summary?.totalWatchSeconds ?? 0)} / 16h 40m</b></div><div className="mt-2 h-2 overflow-hidden rounded-full bg-white/10"><div className="h-full rounded-full bg-cyan-300" style={{width:`${watchProgress}%`}}/></div><p className="mt-4 text-sm text-white/70">Status: <b className="text-cyan-200">{summary?.rewardStatus === "eligible_for_review" ? "Eligible for review" : summary?.rewardStatus === "under_review" ? "15-day verification" : "In progress"}</b></p><p className="mt-1 text-xs text-white/50">₹200 automatic payout abhi enabled nahi hai. Milestone par verification record banta hai; payout se pehle manual/admin review zaroori hai.</p></div>
      <h2 className="mt-8 text-xl font-bold">Video watch history</h2><div className="mt-3 space-y-2">{data?.watchHistory.length ? data.watchHistory.map(row => <div key={row.id} className="rounded-xl border border-white/10 bg-white/[.04] p-4"><div className="flex items-center justify-between gap-3"><div className="min-w-0"><p className="truncate font-semibold">Video ID: {row.videoId}</p><p className="mt-1 text-xs text-white/50">First watched: {dateLabel(row.startedAt)}</p><p className="text-xs text-white/50">Last update: {dateLabel(row.updatedAt)}</p></div><b className="shrink-0 text-cyan-200">{formatDuration(row.seconds)}</b></div></div>) : <p className="rounded-xl border border-white/10 p-4 text-sm text-white/55">Abhi watch history nahi hai.</p>}</div>
      <h2 className="mt-8 text-xl font-bold">Share & follower history</h2><div className="mt-3 space-y-2">{data?.history.length ? data.history.map(row => <div key={row.id} className="flex items-start justify-between gap-3 rounded-xl border border-white/10 bg-white/[.04] p-4"><div className="min-w-0"><p className="font-semibold">{row.type === "follow" ? "New follower attributed" : `Video shared · ${row.platform || "other"}`}</p><p className="mt-1 break-all text-xs text-white/55">Video: {row.videoId || "—"}{row.followerId ? ` · Follower: ${row.followerId}` : ""}</p><p className="mt-1 text-xs text-white/45">{dateLabel(row.createdAt)}</p></div>{row.videoId && <Link href={`/mlm/watch-earn?v=${encodeURIComponent(row.videoId)}`} aria-label="Open video" className="rounded-lg p-2 text-cyan-200"><ExternalLink size={18}/></Link>}</div>) : <p className="rounded-xl border border-white/10 p-4 text-sm text-white/55">Abhi share history nahi hai.</p>}</div>
      </>}
    </section>
  </main>;
}
