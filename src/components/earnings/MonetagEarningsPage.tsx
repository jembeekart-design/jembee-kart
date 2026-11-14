"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, ChartNoAxesCombined, Clock3, Wallet } from "lucide-react";
import { auth } from "@/firebase/config";
import type { User } from "firebase/auth";

type EarningRole = "sharer" | "uploader";
type EarningRow = {
  id: string;
  role?: string;
  period?: string;
  status?: string;
  amountUsd?: number | string;
  sharePercent?: number | string;
  externalRecordId?: string;
  createdAt?: string | null;
};
type ApiResponse = {
  success?: boolean;
  message?: string;
  earnings?: EarningRow[];
  revenueShare?: { uploaderPercent?: number; sharerPercent?: number };
};
type PaidVideoRow = { id: string; orderId: string | null; videoId: string | null; amountPaise: number; status: string; createdAt: string | null };
type PaidVideoResponse = {
  success?: boolean;
  message?: string;
  creatorEarnings?: PaidVideoRow[];
  sharerEarnings?: PaidVideoRow[];
  creatorNetPaise?: number;
  sharerNetPaise?: number;
};

const money = (value: number) => `$${value.toFixed(2)}`;

export default function MonetagEarningsPage({ role }: { role: EarningRole }) {
  const router = useRouter();
  const isSharer = role === "sharer";
  const title = isSharer ? "Sharer की कमाई" : "Creator की कमाई";
  const description = isSharer
    ? "आपके share attribution से जुड़ी Monetag और paid-video आय, अलग-अलग मुद्रा में।"
    : "आपके uploaded videos की Monetag और paid-video आय, अलग-अलग मुद्रा में।";
  const [rows, setRows] = useState<EarningRow[]>([]);
  const [percent, setPercent] = useState(isSharer ? 20 : 30);
  const [paidVideoRows, setPaidVideoRows] = useState<PaidVideoRow[]>([]);
  const [paidVideoNetPaise, setPaidVideoNetPaise] = useState(0);
  const [paidVideoMessage, setPaidVideoMessage] = useState("");
  const [message, setMessage] = useState("कमाई का रिकॉर्ड लोड हो रहा है…");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    const load = async (user: User) => {
      try {
        const token = await user.getIdToken();
        const [response, paidVideoResponse] = await Promise.all([
          fetch("/api/monetag/earnings", { headers: { Authorization: `Bearer ${token}` }, cache: "no-store" }),
          fetch("/api/earnings/paid-video", { headers: { Authorization: `Bearer ${token}` }, cache: "no-store" }).catch(() => null),
        ]);
        const data = (await response.json()) as ApiResponse;
        if (!response.ok || !data.success) throw new Error(data.message || "कमाई का रिकॉर्ड लोड नहीं हो सका।");
        if (!active) return;
        const roleRows = (data.earnings || []).filter((item) => item.role === role);
        setRows(roleRows);
        const configured = isSharer ? data.revenueShare?.sharerPercent : data.revenueShare?.uploaderPercent;
        setPercent(Number.isFinite(Number(configured)) ? Number(configured) : (isSharer ? 20 : 30));
        if (paidVideoResponse?.ok) {
          const paidData = (await paidVideoResponse.json()) as PaidVideoResponse;
          if (paidData.success) {
            const ledgerRows = isSharer ? (paidData.sharerEarnings || []) : (paidData.creatorEarnings || []);
            setPaidVideoRows(ledgerRows);
            setPaidVideoNetPaise(Number(isSharer ? paidData.sharerNetPaise : paidData.creatorNetPaise) || 0);
            setPaidVideoMessage("");
          } else setPaidVideoMessage(paidData.message || "Paid-video ledger अभी उपलब्ध नहीं है।");
        } else setPaidVideoMessage("Paid-video ledger अभी उपलब्ध नहीं है।");
        setMessage(roleRows.length ? "" : "इस भूमिका के लिए अभी कोई confirmed Monetag रिकॉर्ड उपलब्ध नहीं है।");
      } catch (error) {
        if (active) setMessage(error instanceof Error ? error.message : "कमाई का रिकॉर्ड लोड नहीं हो सका।");
      } finally {
        if (active) setLoading(false);
      }
    };
    const unsubscribe = auth.onAuthStateChanged((user) => {
      if (!active) return;
      if (!user) {
        setRows([]);
        setPaidVideoRows([]);
        setPaidVideoNetPaise(0);
        setMessage("अपनी कमाई देखने के लिए पहले लॉगिन करें।");
        setLoading(false);
        return;
      }
      setRows([]);
      setPaidVideoRows([]);
      setPaidVideoNetPaise(0);
      setPaidVideoMessage("");
      setMessage("कमाई का रिकॉर्ड लोड हो रहा है…");
      setLoading(true);
      void load(user);
    });
    return () => { active = false; unsubscribe(); };
  }, [isSharer, role]);

  const confirmedRows = useMemo(() => rows.filter((row) => row.status === "confirmed"), [rows]);
  const confirmedTotal = useMemo(() => confirmedRows.reduce((sum, row) => sum + Math.max(0, Number(row.amountUsd) || 0), 0), [confirmedRows]);
  const pendingRows = useMemo(() => rows.filter((row) => row.status !== "confirmed"), [rows]);

  return (
    <main className="min-h-screen bg-slate-950 px-4 pb-12 pt-[env(safe-area-inset-top)] text-white">
      <header className="mx-auto flex w-full max-w-3xl items-center gap-3 py-5">
        <button type="button" onClick={() => router.back()} aria-label="वापस जाएँ" className="rounded-full bg-white/10 p-3 hover:bg-white/15"><ArrowLeft size={21}/></button>
        <div className="min-w-0"><h1 className="text-2xl font-bold">{title}</h1><p className="mt-1 text-sm text-white/65">{description}</p></div>
      </header>

      <section className="mx-auto max-w-3xl space-y-4">
        <div className="rounded-2xl border border-cyan-300/20 bg-white/5 p-5">
          <div className="flex items-center gap-3"><ChartNoAxesCombined className="text-cyan-300" size={25}/><h2 className="text-lg font-semibold">Monetag विज्ञापन कमाई</h2></div>
          <p className="mt-4 text-3xl font-black tabular-nums">{loading ? "—" : money(confirmedTotal)}</p>
          <p className="mt-2 text-sm text-white/65">निर्धारित हिस्सा: {percent}% · केवल Admin द्वारा confirmed Monetag रिकॉर्ड शामिल हैं।</p>
          <p className="mt-2 text-xs text-white/45">यह USD रिकॉर्ड है; इसे INR paid-video ledger के साथ जोड़ा नहीं गया है।</p>
        </div>
        <div className="rounded-2xl border border-white/10 bg-white/5 p-5">
          <div className="flex items-center gap-3"><Wallet className="text-cyan-300" size={23}/><h2 className="text-lg font-semibold">Paid-video share (INR)</h2></div>
          <p className="mt-3 text-3xl font-black tabular-nums">{loading ? "—" : `₹${(paidVideoNetPaise / 100).toFixed(2)}`}</p>
          <p className="mt-2 text-xs text-white/50">Cashfree-verified paid-video settlement ledger की net entry; status pending settlement हो सकता है। यह payout नहीं है।</p>
          {paidVideoMessage ? <p className="mt-2 text-xs text-amber-200/80">{paidVideoMessage}</p> : null}
          {paidVideoRows.length ? <div className="mt-3 divide-y divide-white/10">{paidVideoRows.slice(0, 10).map((row) => <div key={row.id} className="flex items-center justify-between gap-3 py-2 text-xs"><span className="text-white/60">{row.createdAt || row.orderId || "Paid video"} · {row.status}</span><strong>{row.amountPaise < 0 ? "−" : "+"}₹{(Math.abs(row.amountPaise) / 100).toFixed(2)}</strong></div>)}</div> : null}
        </div>

        <div className="rounded-2xl border border-white/10 bg-white/5 p-5">
          <div className="flex items-center gap-3"><Clock3 className="text-cyan-300" size={23}/><h2 className="text-lg font-semibold">कमाई का इतिहास</h2></div>
          {loading ? <p className="mt-3 text-sm text-white/65">लोड हो रहा है…</p> : message ? <p role="status" className="mt-3 text-sm text-white/65">{message}</p> : null}
          {!loading && rows.length > 0 ? <div className="mt-3 divide-y divide-white/10">{rows.map((row) => <div key={row.id} className="flex flex-wrap items-center justify-between gap-2 py-3 text-sm"><div className="min-w-0"><p className="font-semibold">{row.period || row.createdAt || "अवधि उपलब्ध नहीं"}</p><p className="mt-1 text-xs text-white/50">{row.status || "स्थिति उपलब्ध नहीं"} · हिस्सा {Number(row.sharePercent ?? percent)}%</p></div><strong className="tabular-nums">{money(Number(row.amountUsd) || 0)}</strong></div>)}</div> : null}
        </div>

        <div className="rounded-2xl border border-white/10 bg-white/5 p-5">
          <div className="flex items-center gap-3"><Wallet className="text-cyan-300" size={23}/><h2 className="text-lg font-semibold">भुगतान की जानकारी</h2></div>
          <p className="mt-3 text-sm leading-6 text-white/65">{pendingRows.length ? `${pendingRows.length} रिकॉर्ड अभी confirmed नहीं हैं।` : "भुगतान की भूमिका-वार पुष्टि उपलब्ध होने पर यहाँ दिखाई जाएगी।"} अभी इस पेज पर कोई payout अनुरोध या स्वतः भुगतान चालू नहीं है।</p>
        </div>
        <div className="flex flex-wrap gap-3 text-sm"><Link className="text-cyan-300 underline" href="/earnings/sharer">Sharer</Link><Link className="text-cyan-300 underline" href="/earnings/creator">Creator</Link><Link className="text-cyan-300 underline" href="/earnings/teacher">Teacher</Link></div>
      </section>
    </main>
  );
}
