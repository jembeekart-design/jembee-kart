"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { auth } from "@/firebase/config";
import { ArrowLeft, ChartNoAxesCombined, History, Wallet } from "lucide-react";

export default function ShareIncomePage() {
  const router = useRouter();
  const [earnings, setEarnings] = useState<Array<Record<string, unknown>>>([]);
  const [payments, setPayments] = useState<Array<Record<string, unknown>>>([]);
  const [sharerPercent, setSharerPercent] = useState(20);
  const [message, setMessage] = useState("कमाई और भुगतान का इतिहास लोड हो रहा है…");
  useEffect(() => {
    let active = true;
    const load = async () => {
      const user = auth.currentUser;
      if (!user) { if (active) setMessage("इतिहास देखने के लिए कृपया लॉगिन करें।"); return; }
      try {
        const token = await user.getIdToken();
        const response = await fetch("/api/monetag/earnings", { headers: { Authorization: `Bearer ${token}` } });
        const data = await response.json();
        if (!response.ok || !data.success) throw new Error(data.message || "इतिहास लोड नहीं हो सका।");
        if (active) { setEarnings(data.earnings || []); setPayments(data.payments || []); setSharerPercent(Number(data.revenueShare?.sharerPercent ?? 20)); setMessage(""); }
      } catch { if (active) setMessage("कमाई और भुगतान का इतिहास अभी लोड नहीं हो सका। कृपया बाद में पुनः प्रयास करें।"); }
    };
    const unsubscribe = auth.onAuthStateChanged(() => { void load(); });
    return () => { active = false; unsubscribe(); };
  }, []);
  const money = (value: unknown) => `$${Number(value || 0).toFixed(2)}`;
  return (
    <main className="min-h-screen bg-slate-950 px-4 pb-10 pt-[env(safe-area-inset-top)] text-white">
      <header className="mx-auto flex w-full max-w-3xl items-center gap-3 py-5">
        <button type="button" onClick={() => router.push("/mlm/watch-earn")} aria-label="वापस जाएँ" className="rounded-full bg-white/10 p-3 hover:bg-white/15"><ArrowLeft size={21} /></button>
        <div><h1 className="text-2xl font-bold">शेयर कमाई</h1><p className="mt-1 text-sm text-white/65">आपकी पात्र और सत्यापित विज्ञापन आय का विवरण।</p></div>
      </header>
      <section className="mx-auto max-w-3xl space-y-4">
        <div className="rounded-2xl border border-white/10 bg-white/5 p-5">
          <div className="flex items-center gap-3"><ChartNoAxesCombined className="text-cyan-300" size={24} /><h2 className="text-lg font-semibold">कमाई का विवरण</h2></div>
          <p className="mt-3 text-sm leading-6 text-white/75">शेयर से होने वाली कमाई केवल Monetag की वास्तविक आय और सत्यापित आँकड़ों के आधार पर दिखाई जाएगी। अभी कोई सत्यापित कमाई राशि उपलब्ध नहीं है।</p>
          <p className="mt-3 text-xs text-white/50">आपका निर्धारित हिस्सा: {sharerPercent}%। कमाई केवल सत्यापित रिपोर्ट से दर्ज होगी।</p>
        </div>
        <div className="rounded-2xl border border-white/10 bg-white/5 p-5"><div className="flex items-center gap-3"><History className="text-cyan-300" size={24} /><h2 className="text-lg font-semibold">कमाई का इतिहास</h2></div>{message && <p className="mt-3 text-sm text-white/70">{message}</p>}{!message && earnings.length === 0 && <p className="mt-3 text-sm text-white/70">अभी आपकी कमाई का कोई रिकॉर्ड उपलब्ध नहीं है।</p>}{earnings.map((item) => <div key={String(item.id)} className="mt-3 border-t border-white/10 pt-3 text-sm"><div className="flex items-center justify-between gap-3"><span>{String(item.period || item.createdAt || "तारीख उपलब्ध नहीं")} · {item.role === "uploader" ? "वीडियो अपलोड" : "वीडियो शेयर"} · {String(item.status || "स्थिति")}</span><strong>{money(item.amountUsd)}</strong></div><p className="mt-1 text-xs text-white/55">हिस्सा: {Number(item.sharePercent || 0)}% · रिकॉर्ड: {String(item.externalRecordId || item.id)}</p></div>)}</div>
        <div className="rounded-2xl border border-white/10 bg-white/5 p-5"><div className="flex items-center gap-3"><Wallet className="text-cyan-300" size={24} /><h2 className="text-lg font-semibold">भुगतान का इतिहास</h2></div>{!message && payments.length === 0 && <p className="mt-3 text-sm text-white/70">अभी आपकी भुगतान हिस्ट्री में कोई रिकॉर्ड उपलब्ध नहीं है।</p>}{payments.map((item) => <div key={String(item.id)} className="mt-3 border-t border-white/10 pt-3 text-sm"><div className="flex items-center justify-between gap-3"><span>{String(item.paidAt || item.createdAt || "तारीख उपलब्ध नहीं")} · {String(item.status || "स्थिति")}</span><strong>{money(item.amountUsd)}</strong></div>{Boolean(item.transactionReference) && <p className="mt-1 text-xs text-white/55">लेन-देन संदर्भ: {String(item.transactionReference)}</p>}</div>)}</div>
      </section>
    </main>
  );
}
