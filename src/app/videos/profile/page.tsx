"use client";

import { useEffect, useState } from "react";
import ShortsProfile, { ProfileSection } from "../components/ShortsProfile";
import { auth } from "@/firebase/config";

type Earning = {
  id: string;
  role?: string;
  status?: string;
  amountUsd?: number;
  period?: string;
  externalRecordId?: string;
  videoId?: string | null;
  createdAt?: string | null;
  currency?: string;
};
type Payment = {
  id: string;
  status?: string;
  amountUsd?: number;
  transactionReference?: string;
  createdAt?: string | null;
  paidAt?: string | null;
};
type DashboardData = {
  earnings: Earning[];
  payments: Payment[];
  revenueShare?: { uploaderPercent?: number; sharerPercent?: number };
};

const usd = (value: unknown) => `$${Number(value || 0).toFixed(6)} USD`;
const dateLabel = (value?: string | null) => {
  if (!value) return "तारीख उपलब्ध नहीं";
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? "तारीख उपलब्ध नहीं" : date.toLocaleString("en-IN", { dateStyle: "medium", timeStyle: "short" });
};
const cardClass = "rounded-2xl border border-white/10 bg-gradient-to-br from-[#17182f] to-[#101321] p-4 shadow-lg shadow-black/10";

export default function ProfilePage() {
  const [activeSection, setActiveSection] = useState<ProfileSection>("videos");
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");

  useEffect(() => {
    let active = true;
    const load = async () => {
      const user = auth.currentUser;
      if (!user) {
        if (active) { setData(null); setLoading(false); setMessage("Monetag कमाई देखने के लिए लॉगिन करें।"); }
        return;
      }
      try {
        const token = await user.getIdToken();
        const response = await fetch("/api/monetag/earnings", { headers: { Authorization: `Bearer ${token}` }, cache: "no-store" });
        const result = await response.json();
        if (!response.ok || !result.success) throw new Error(result.message || "Monetag हिस्ट्री लोड नहीं हुई।");
        if (active) {
          setData({ earnings: Array.isArray(result.earnings) ? result.earnings : [], payments: Array.isArray(result.payments) ? result.payments : [], revenueShare: result.revenueShare || {} });
          setMessage("");
        }
      } catch (error) {
        if (active) setMessage(error instanceof Error ? error.message : "Monetag हिस्ट्री लोड नहीं हुई।");
      } finally { if (active) setLoading(false); }
    };
    const unsubscribe = auth.onAuthStateChanged(() => { setLoading(true); void load(); });
    void load();
    return () => { active = false; unsubscribe(); };
  }, []);

  const earnings = data?.earnings || [];
  const payments = data?.payments || [];
  const confirmed = earnings.filter((item) => item.status === "confirmed");
  const pending = earnings.filter((item) => ["pending", "under_review"].includes(String(item.status)));
  const uploaderTotal = confirmed.filter((item) => item.role === "uploader").reduce((sum, item) => sum + Number(item.amountUsd || 0), 0);
  const sharerTotal = confirmed.filter((item) => item.role === "sharer").reduce((sum, item) => sum + Number(item.amountUsd || 0), 0);
  const confirmedTotal = confirmed.reduce((sum, item) => sum + Number(item.amountUsd || 0), 0);
  const pendingTotal = pending.reduce((sum, item) => sum + Number(item.amountUsd || 0), 0);
  const paidTotal = payments.filter((item) => item.status === "paid").reduce((sum, item) => sum + Number(item.amountUsd || 0), 0);
  const availableForPayout = Math.max(0, confirmedTotal - paidTotal);
  const recentEarnings = [...earnings].sort((a, b) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime()).slice(0, 20);
  const recentPayments = [...payments].sort((a, b) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime()).slice(0, 10);

  return <>
    <ShortsProfile activeSection={activeSection} onSectionChange={setActiveSection} />
    {activeSection !== "videos" && activeSection !== "liked" && activeSection !== "saved" && <section className="min-h-[60vh] bg-[#070816] px-4 pb-28 text-white sm:px-6">
      <div className="mx-auto max-w-5xl space-y-5">
        <header className="rounded-3xl border border-indigo-300/15 bg-gradient-to-r from-[#20163a] via-[#14172e] to-[#101b2b] p-5 sm:p-6">
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-fuchsia-200">Creator center</p>
          <h2 className="mt-2 text-2xl font-black">{activeSection === "earnings" ? "Earnings overview" : activeSection === "history" ? "Earnings history" : "Payment history"}</h2>
          <p className="mt-1 text-sm text-slate-400">आपके खाते में मौजूद वास्तविक Monetag earning और payment records।</p>
        </header>
        {message && <p role="status" className="rounded-xl border border-amber-400/25 bg-amber-950/30 p-3 text-sm text-amber-100">{message}</p>}
        {loading ? <p className={cardClass + " text-sm text-slate-300"}>कमाई लोड हो रही है…</p> : !data ? <p className={cardClass + " text-sm text-slate-300"}>अभी Monetag dashboard data उपलब्ध नहीं है।</p> : <>
          {activeSection === "earnings" && <>
            <div className="grid grid-cols-2 gap-3 lg:grid-cols-3">
              {[["Uploader confirmed", uploaderTotal, "text-cyan-200"], ["Sharer confirmed", sharerTotal, "text-fuchsia-200"], ["Total confirmed", confirmedTotal, "text-emerald-200"], ["Pending / review", pendingTotal, "text-amber-200"], ["Paid amount recorded", paidTotal, "text-sky-200"], ["Available for payout", availableForPayout, "text-violet-200"]].map(([label, amount, tone]) => <div key={String(label)} className={cardClass}><p className="text-xs text-slate-400">{label}</p><p className={`mt-2 break-words text-lg font-black ${tone}`}>{usd(amount)}</p></div>)}
              <div className={cardClass + " col-span-2 lg:col-span-3"}><p className="text-xs text-slate-400">Revenue share settings</p><p className="mt-2 text-sm font-bold text-white">Uploader {Number(data.revenueShare?.uploaderPercent ?? 30)}% · Sharer {Number(data.revenueShare?.sharerPercent ?? 20)}%</p><p className="mt-2 text-xs text-slate-500">Platform share is not displayed as personal creator earnings.</p></div>
            </div>
            <p className="text-xs leading-5 text-slate-500">नोट: Monetag API की aggregate या zone कमाई अपने-आप व्यक्तिगत earning साबित नहीं करती। यहाँ केवल खाते में दर्ज individual earning records गिने जाते हैं।</p>
          </>}
          {activeSection === "history" && <div className={cardClass}>
            <h3 className="text-lg font-bold">कमाई की हिस्ट्री</h3><p className="mb-4 mt-1 text-xs text-slate-500">हाल के 20 earning records तक।</p>
            {recentEarnings.length === 0 ? <p className="text-sm text-slate-400">अभी कोई व्यक्तिगत Monetag earning record नहीं है।</p> : <div className="space-y-3">{recentEarnings.map((item) => <article key={item.id} className="rounded-xl border border-white/10 bg-black/15 p-3"><div className="flex items-start justify-between gap-3"><div className="min-w-0"><p className="font-semibold">{item.role === "uploader" ? "Uploader earning" : item.role === "sharer" ? "Sharer earning" : "Monetag earning"}</p><p className="mt-1 text-xs text-slate-400">{item.period || "अवधि उपलब्ध नहीं"}</p>{item.videoId && <p className="mt-1 break-all text-xs text-slate-500">Video ID: {item.videoId}</p>}{item.externalRecordId && <p className="mt-1 break-all text-xs text-slate-500">Record: {item.externalRecordId}</p>}<p className="mt-1 text-xs text-slate-500">{dateLabel(item.createdAt)}</p></div><div className="shrink-0 text-right"><p className="font-bold">{usd(item.amountUsd)}</p><p className="mt-1 text-xs text-slate-400">{item.status || "unknown"}</p></div></div></article>)}</div>}
            <p className="mt-4 text-xs leading-5 text-slate-500">API की aggregate कमाई से यह साबित नहीं होता कि विज्ञापन किस share link पर चला; इसलिए केवल दर्ज individual records दिखाए जाते हैं।</p>
          </div>}
          {activeSection === "payments" && <div className={cardClass}>
            <h3 className="text-lg font-bold">Payment history</h3><p className="mb-4 mt-1 text-xs text-slate-500">हाल के 10 payment records तक।</p>
            {recentPayments.length === 0 ? <p className="text-sm text-slate-400">अभी कोई payment record नहीं है।</p> : <div className="space-y-3">{recentPayments.map((item) => <article key={item.id} className="rounded-xl border border-white/10 bg-black/15 p-3"><div className="flex items-start justify-between gap-3"><div className="min-w-0"><p className="break-all font-semibold">{item.transactionReference || "Payment record"}</p><p className="mt-1 text-xs text-slate-400">{dateLabel(item.paidAt || item.createdAt)}</p></div><div className="shrink-0 text-right"><p className="font-bold">{usd(item.amountUsd)}</p><p className="mt-1 text-xs text-slate-400">{item.status || "unknown"}</p></div></div></article>)}</div>}
            <p className="mt-4 text-xs leading-5 text-slate-500">Payment record दिखना अपने-आप bank transfer का प्रमाण नहीं है।</p>
          </div>}
        </>}
      </div>
    </section>}
  </>;
}
