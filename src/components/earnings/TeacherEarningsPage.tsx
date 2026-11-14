"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, GraduationCap, History, Wallet } from "lucide-react";
import { auth } from "@/firebase/config";
import type { User } from "firebase/auth";

type TeacherLedgerRow = {
  id: string;
  orderId: string | null;
  videoId: string | null;
  amountPaise: number;
  basisAmountPaise: number;
  status: string;
  createdAt: string | null;
};
type TeacherEarningsResponse = {
  success?: boolean;
  message?: string;
  earnings?: TeacherLedgerRow[];
  adjustments?: TeacherLedgerRow[];
  reconciledCommissionPaise?: number;
};
const rupees = (paise: number) => `₹${(paise / 100).toFixed(2)}`;

export default function TeacherEarningsPage() {
  const router = useRouter();
  const [earnings, setEarnings] = useState<TeacherLedgerRow[]>([]);
  const [adjustments, setAdjustments] = useState<TeacherLedgerRow[]>([]);
  const [totalPaise, setTotalPaise] = useState(0);
  const [message, setMessage] = useState("Teacher Referral commission का रिकॉर्ड लोड हो रहा है…");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    const load = async (user: User) => {
      try {
        const token = await user.getIdToken();
        const response = await fetch("/api/teacher/earnings", {
          headers: { Authorization: `Bearer ${token}` },
          cache: "no-store",
        });
        const data = (await response.json()) as TeacherEarningsResponse;
        if (!response.ok || !data.success) throw new Error(data.message || "Teacher Referral commission का रिकॉर्ड लोड नहीं हो सका।");
        if (!active) return;
        setEarnings(data.earnings || []);
        setAdjustments(data.adjustments || []);
        setTotalPaise(Number(data.reconciledCommissionPaise) || 0);
        setMessage((data.earnings || []).length ? "" : "अभी आपके लिए कोई reconciled Teacher Referral commission उपलब्ध नहीं है।");
      } catch (error) {
        if (active) setMessage(error instanceof Error ? error.message : "रिकॉर्ड लोड नहीं हो सका।");
      } finally {
        if (active) setLoading(false);
      }
    };
    const unsubscribe = auth.onAuthStateChanged((user) => {
      if (!active) return;
      if (!user) {
        setEarnings([]);
        setAdjustments([]);
        setTotalPaise(0);
        setMessage("अपनी Teacher Referral commission देखने के लिए पहले लॉगिन करें।");
        setLoading(false);
        return;
      }
      setEarnings([]);
      setAdjustments([]);
      setTotalPaise(0);
      setMessage("Teacher Referral commission का रिकॉर्ड लोड हो रहा है…");
      setLoading(true);
      void load(user);
    });
    return () => { active = false; unsubscribe(); };
  }, []);

  return (
    <main className="min-h-screen bg-slate-950 px-4 pb-12 pt-[env(safe-area-inset-top)] text-white">
      <header className="mx-auto flex w-full max-w-3xl items-center gap-3 py-5">
        <button type="button" onClick={() => router.back()} aria-label="वापस जाएँ" className="rounded-full bg-white/10 p-3 hover:bg-white/15"><ArrowLeft size={21}/></button>
        <div><h1 className="text-2xl font-bold">Teacher Referral Commission</h1><p className="mt-1 text-sm text-white/65">Teacher को refer करने वाले verified Sharer की commission।</p></div>
      </header>
      <section className="mx-auto max-w-3xl space-y-4">
        <div className="rounded-2xl border border-cyan-300/20 bg-white/5 p-5">
          <div className="flex items-center gap-3"><GraduationCap className="text-cyan-300" size={25}/><h2 className="text-lg font-semibold">कमाई का नियम</h2></div>
          <p className="mt-4 text-3xl font-black">2%</p>
          <p className="mt-2 text-sm leading-6 text-white/70">यह 2% commission उस verified Sharer/referrer को मिलता है जिसने Teacher को refer किया है। इसकी गणना केवल सत्यापित, refund-adjusted Admin Net Profit पर होती है—वीडियो की gross बिक्री या कुल विज्ञापन आय पर नहीं। Referred Teacher की अपनी video/Creator कमाई अलग Creator पेज पर रहती है।</p>
        </div>
        <div className="rounded-2xl border border-white/10 bg-white/5 p-5">
          <div className="flex items-center gap-3"><Wallet className="text-cyan-300" size={23}/><h2 className="text-lg font-semibold">Reconciled commission</h2></div>
          <p className="mt-3 text-3xl font-black tabular-nums">{loading ? "—" : rupees(totalPaise)}</p>
          <p className="mt-2 text-xs text-white/50">यह reconciled commission है, payout या बैंक में उपलब्ध राशि नहीं। Status अभी pending settlement हो सकता है।</p>
        </div>
        <div className="rounded-2xl border border-white/10 bg-white/5 p-5">
          <div className="flex items-center gap-3"><History className="text-cyan-300" size={23}/><h2 className="text-lg font-semibold">कमाई का इतिहास</h2></div>
          {loading || message ? <p role="status" className="mt-3 text-sm text-white/65">{loading ? "लोड हो रहा है…" : message}</p> : null}
          {earnings.map((item) => <div key={item.id} className="mt-3 border-t border-white/10 pt-3 text-sm"><div className="flex items-center justify-between gap-3"><span>{item.createdAt || item.orderId || "तारीख उपलब्ध नहीं"}</span><strong>{rupees(item.amountPaise)}</strong></div><p className="mt-1 text-xs text-white/50">{item.status} · Net-profit basis: {rupees(item.basisAmountPaise)}</p></div>)}
          {adjustments.length ? <div className="mt-4 border-t border-white/10 pt-3"><p className="text-xs font-bold uppercase tracking-wider text-slate-400">Refund / reconciliation adjustments (audit history)</p>{adjustments.map((item) => <div key={item.id} className="mt-3 flex items-center justify-between gap-3 text-sm"><span className="text-white/65">{item.createdAt || item.orderId || "Adjustment"}</span><strong>{item.amountPaise < 0 ? "−" : "+"}{rupees(Math.abs(item.amountPaise))}</strong></div>)}</div> : null}
        </div>
        <div className="rounded-2xl border border-white/10 bg-white/5 p-5"><h2 className="text-lg font-semibold">भुगतान की जानकारी</h2><p className="mt-3 text-sm leading-6 text-white/65">यह पेज केवल ledger से reconciled commission पढ़ता है। अभी कोई payout अनुरोध या स्वतः भुगतान चालू नहीं है।</p></div>
        <div className="flex flex-wrap gap-3 text-sm"><Link className="text-cyan-300 underline" href="/earnings/sharer">Sharer</Link><Link className="text-cyan-300 underline" href="/earnings/creator">Creator</Link><Link className="text-cyan-300 underline" href="/earnings/teacher">Teacher</Link></div>
      </section>
    </main>
  );
}
