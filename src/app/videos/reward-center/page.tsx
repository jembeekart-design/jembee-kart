"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { onAuthStateChanged, type User } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import { auth, db } from "@/firebase/config";
import { ArrowLeft, Bookmark, Coins, Loader2, RefreshCw, TrendingUp, Wallet } from "lucide-react";

type SavedVideo = { id: string; title?: string; caption?: string; thumbnail?: string; displayName?: string; username?: string };
type WatchData = { success?: boolean; savedVideos?: SavedVideo[]; message?: string };

export default function RewardCenterPage() {
  const [user, setUser] = useState<User | null>(null);
  const [walletBalance, setWalletBalance] = useState<number | null>(null);
  const [savedVideos, setSavedVideos] = useState<SavedVideo[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");

  const load = useCallback(async (currentUser: User, refresh = false) => {
    if (refresh) setRefreshing(true);
    else setLoading(true);
    setError("");
    try {
      const token = await currentUser.getIdToken();
      const [userSnapshot, watchResponse] = await Promise.all([
        getDoc(doc(db, "users", currentUser.uid)),
        fetch("/api/profile/watch-data", { headers: { Authorization: `Bearer ${token}` }, cache: "no-store" }),
      ]);
      const userData = userSnapshot.exists() ? userSnapshot.data() : {};
      const balance = userData.walletBalance;
      setWalletBalance(typeof balance === "number" && Number.isFinite(balance) ? balance : null);
      const watchData = await watchResponse.json().catch(() => ({})) as WatchData;
      if (!watchResponse.ok || watchData.success !== true) {
        setSavedVideos([]);
        setError(watchData.message || "Saved videos load नहीं हो सके।");
      } else {
        setSavedVideos(Array.isArray(watchData.savedVideos) ? watchData.savedVideos : []);
      }
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Reward Center load नहीं हुआ।");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => onAuthStateChanged(auth, (currentUser) => {
    setUser(currentUser);
    if (currentUser) void load(currentUser);
    else {
      setWalletBalance(null);
      setSavedVideos([]);
      setLoading(false);
    }
  }), [load]);

  if (loading) return <main className="grid min-h-screen place-items-center bg-[#080d18] text-white"><Loader2 className="animate-spin" size={28}/></main>;
  if (!user) return <main className="grid min-h-screen place-items-center bg-[#080d18] p-6 text-white"><section className="text-center"><Coins className="mx-auto text-cyan-300" size={42}/><h1 className="mt-4 text-2xl font-black">Reward Center</h1><p className="mt-2 text-sm text-slate-300">Coins और saved videos देखने के लिए login करें।</p><Link href="/login?redirect=%2Fvideos%2Freward-center" className="mt-5 inline-flex rounded-xl bg-cyan-400 px-5 py-3 font-bold text-slate-950">Login करें</Link></section></main>;

  return (
    <main className="min-h-screen bg-[#080d18] px-4 pb-12 pt-[env(safe-area-inset-top)] text-white sm:px-6">
      <div className="mx-auto max-w-4xl">
        <header className="flex items-center justify-between gap-3 py-5">
          <div className="flex items-center gap-3"><Link href="/" aria-label="Home" className="rounded-full bg-white/10 p-3"><ArrowLeft size={19}/></Link><div><p className="text-xs font-bold uppercase tracking-widest text-cyan-300">JEMBEE PLAY</p><h1 className="text-2xl font-black">Reward Center</h1></div></div>
          <button type="button" onClick={() => void load(user, true)} disabled={refreshing} className="inline-flex items-center gap-2 rounded-xl border border-white/15 px-3 py-2 text-sm font-semibold disabled:opacity-50"><RefreshCw size={16} className={refreshing ? "animate-spin" : ""}/> Refresh</button>
        </header>

        {error && <p role="alert" className="mb-4 rounded-xl border border-amber-300/20 bg-amber-300/10 p-3 text-sm text-amber-100">{error}</p>}

        <section className="grid gap-4 sm:grid-cols-2">
          <article className="rounded-2xl border border-cyan-300/20 bg-gradient-to-br from-cyan-300/10 to-violet-400/5 p-5">
            <div className="flex items-center gap-2 text-cyan-200"><Coins size={22}/><h2 className="font-bold">JEMBEE Coins</h2></div>
            <p className="mt-4 text-3xl font-black tabular-nums">{walletBalance === null ? "Not recorded" : walletBalance.toLocaleString("en-IN")}</p>
            <p className="mt-2 text-xs text-slate-400">आपके account document में दर्ज balance। कोई अनुमानित reward इसमें नहीं जोड़ा गया है।</p>
          </article>
          <article className="rounded-2xl border border-white/10 bg-white/[0.04] p-5">
            <div className="flex items-center gap-2 text-cyan-200"><Bookmark size={22}/><h2 className="font-bold">Saved Videos</h2></div>
            <p className="mt-4 text-3xl font-black tabular-nums">{savedVideos.length}</p>
            <p className="mt-2 text-xs text-slate-400">आपकी library में उपलब्ध approved और safe saved videos।</p>
          </article>
        </section>

        <section className="mt-5 rounded-2xl border border-white/10 bg-white/[0.04] p-5">
          <h2 className="flex items-center gap-2 text-lg font-bold"><TrendingUp className="text-cyan-300"/> Earnings & Settlements</h2>
          <p className="mt-2 text-sm text-slate-400">अलग-अलग earning records को उनके verified ledger pages पर देखें। Reward Center कोई unverified payout total नहीं जोड़ता।</p>
          <div className="mt-4 grid gap-3 sm:grid-cols-3">
            <EarningLink href="/earnings/creator" title="Creator Earnings" subtitle="Uploaded videos"/>
            <EarningLink href="/earnings/sharer" title="Sharer Earnings" subtitle="Video share attribution"/>
            <EarningLink href="/earnings/teacher" title="Teacher Earnings" subtitle="Referral settlement"/>
          </div>
        </section>

        <section className="mt-5 rounded-2xl border border-white/10 bg-white/[0.04] p-5">
          <div className="flex items-center justify-between gap-3"><h2 className="flex items-center gap-2 text-lg font-bold"><Bookmark className="text-cyan-300"/> Your Saved Videos</h2><Link href="/videos/history" className="text-xs font-semibold text-cyan-200">Watch history →</Link></div>
          {savedVideos.length === 0 ? <p className="mt-4 rounded-xl border border-dashed border-white/15 p-7 text-center text-sm text-slate-400">अभी कोई saved video उपलब्ध नहीं है। Video पर Save दबाने के बाद वह यहाँ दिखेगा।</p> : <div className="mt-4 grid gap-3 sm:grid-cols-2">{savedVideos.map((video) => <Link key={video.id} href={`/videos?v=${encodeURIComponent(video.id)}`} className="flex gap-3 rounded-xl border border-white/10 bg-black/20 p-3 hover:bg-white/5">{video.thumbnail ? <img src={video.thumbnail} alt="" className="h-20 w-28 rounded-lg object-cover"/> : <div className="grid h-20 w-28 place-items-center rounded-lg bg-white/10"><Bookmark className="text-cyan-300"/></div>}<span className="min-w-0"><strong className="line-clamp-2 text-sm">{video.caption || video.title || "Saved video"}</strong><span className="mt-1 block truncate text-xs text-slate-400">{video.displayName || video.username || "JEMBEE PLAY creator"}</span></span></Link>)}</div>}
        </section>
      </div>
    </main>
  );
}

function EarningLink({ href, title, subtitle }: { href: string; title: string; subtitle: string }) {
  return <Link href={href} className="rounded-xl border border-white/10 bg-black/20 p-4 hover:bg-white/5"><span className="flex items-center gap-2 text-sm font-bold"><Wallet size={17} className="text-cyan-300"/>{title}</span><span className="mt-2 block text-xs text-slate-400">{subtitle} →</span></Link>;
}
