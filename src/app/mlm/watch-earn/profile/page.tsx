"use client";

import { useEffect, useState } from "react";
import ShortsProfile from "../components/ShortsProfile";
import { auth } from "@/firebase/config";

type Earning = {
  id: string;
  role?: string;
  status?: string;
  amountUsd?: number;
  period?: string;
  externalRecordId?: string;
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

const usd = (value: unknown) =>
  `$${Number(value || 0).toFixed(6)} USD`;

const dateLabel = (value?: string | null) => {
  if (!value) return "तारीख उपलब्ध नहीं";
  const date = new Date(value);
  return Number.isNaN(date.getTime())
    ? "तारीख उपलब्ध नहीं"
    : date.toLocaleString("en-IN", { dateStyle: "medium", timeStyle: "short" });
};

export default function ProfilePage() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");

  useEffect(() => {
    let active = true;

    const load = async () => {
      const user = auth.currentUser;
      if (!user) {
        if (active) {
          setData(null);
          setLoading(false);
          setMessage("Monetag कमाई देखने के लिए लॉगिन करें।");
        }
        return;
      }

      try {
        const token = await user.getIdToken();
        const response = await fetch("/api/monetag/earnings", {
          headers: { Authorization: `Bearer ${token}` },
          cache: "no-store",
        });
        const result = await response.json();

        if (!response.ok || !result.success) {
          throw new Error(result.message || "Monetag हिस्ट्री लोड नहीं हुई।");
        }

        if (active) {
          setData({
            earnings: Array.isArray(result.earnings) ? result.earnings : [],
            payments: Array.isArray(result.payments) ? result.payments : [],
            revenueShare: result.revenueShare || {},
          });
          setMessage("");
        }
      } catch (error) {
        if (active) {
          setMessage(error instanceof Error ? error.message : "Monetag हिस्ट्री लोड नहीं हुई।");
        }
      } finally {
        if (active) setLoading(false);
      }
    };

    const unsubscribe = auth.onAuthStateChanged(() => {
      setLoading(true);
      void load();
    });

    void load();
    return () => {
      active = false;
      unsubscribe();
    };
  }, []);

  const earnings = data?.earnings || [];
  const payments = data?.payments || [];
  const confirmed = earnings.filter((item) => item.status === "confirmed");
  const pending = earnings.filter((item) => ["pending", "under_review"].includes(String(item.status)));
  const uploaderTotal = confirmed
    .filter((item) => item.role === "uploader")
    .reduce((sum, item) => sum + Number(item.amountUsd || 0), 0);
  const sharerTotal = confirmed
    .filter((item) => item.role === "sharer")
    .reduce((sum, item) => sum + Number(item.amountUsd || 0), 0);
  const confirmedTotal = confirmed.reduce((sum, item) => sum + Number(item.amountUsd || 0), 0);
  const pendingTotal = pending.reduce((sum, item) => sum + Number(item.amountUsd || 0), 0);
  const paidTotal = payments
    .filter((item) => item.status === "paid")
    .reduce((sum, item) => sum + Number(item.amountUsd || 0), 0);
  const availableForPayout = Math.max(0, confirmedTotal - paidTotal);
  const recentEarnings = [...earnings].sort(
    (a, b) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime()
  ).slice(0, 20);
  const recentPayments = [...payments].sort(
    (a, b) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime()
  ).slice(0, 10);

  return (
    <>
      <ShortsProfile />
      <section className="min-h-screen bg-[#070816] px-4 pb-32 text-white">
        <div className="mx-auto max-w-3xl space-y-5">
          <header>
            <h2 className="bg-gradient-to-r from-fuchsia-300 via-violet-300 to-cyan-300 bg-clip-text text-2xl font-black text-transparent">Monetag Earnings Dashboard</h2>
            <p className="mt-1 text-sm text-white/65">
              Uploader और Sharer की दर्ज कमाई, भुगतान और हाल की हिस्ट्री।
            </p>
          </header>

          {message && (
            <p role="status" className="rounded-xl border border-amber-400/30 bg-amber-500/10 p-3 text-sm text-amber-200">
              {message}
            </p>
          )}

          {loading ? (
            <p className="rounded-2xl border border-indigo-400/20 bg-gradient-to-r from-indigo-950 to-[#151326] p-4 text-sm text-white/70">कमाई लोड हो रही है…</p>
          ) : data ? (
            <>
              <div className="grid grid-cols-2 gap-3">
                {[
                  ["Uploader confirmed", uploaderTotal],
                  ["Sharer confirmed", sharerTotal],
                  ["Total confirmed", confirmedTotal],
                  ["Pending / review", pendingTotal],
                  ["Paid amount recorded", paidTotal],
                  ["Available for payout", availableForPayout],
                ].map(([label, amount]) => (
                  <div key={String(label)} className="rounded-2xl border border-indigo-300/15 bg-gradient-to-br from-[#17162b] via-[#111426] to-[#151522] p-4 shadow-lg shadow-purple-950/15">
                    <p className="text-xs text-white/60">{label}</p>
                    <p className="mt-2 break-words text-lg font-black">{usd(amount)}</p>
                  </div>
                ))}
                <div className="rounded-2xl border border-indigo-300/15 bg-gradient-to-br from-[#17162b] via-[#111426] to-[#151522] p-4 shadow-lg shadow-purple-950/15">
                  <p className="text-xs text-white/60">Revenue share settings</p>
                  <p className="mt-2 text-sm font-bold">
                    Uploader {Number(data.revenueShare?.uploaderPercent ?? 30)}% · Sharer {Number(data.revenueShare?.sharerPercent ?? 20)}%
                  </p>
                </div>
              </div>

              <div className="rounded-2xl border border-indigo-300/15 bg-gradient-to-br from-[#17162b] via-[#111426] to-[#151522] p-4 shadow-lg shadow-purple-950/15">
                <h3 className="bg-gradient-to-r from-fuchsia-200 to-cyan-200 bg-clip-text text-lg font-bold text-transparent">कमाई की हिस्ट्री</h3>
                <p className="mb-3 mt-1 text-xs text-white/55">
                  यह केवल तुम्हारे खाते में मौजूद earning records दिखाता है। API की aggregate कमाई अपने-आप व्यक्तिगत earning नहीं बनती।
                </p>
                {recentEarnings.length === 0 ? (
                  <p className="text-sm text-white/60">अभी कोई व्यक्तिगत Monetag earning record नहीं है।</p>
                ) : (
                  <div className="space-y-3">
                    {recentEarnings.map((item) => (
                      <article key={item.id} className="rounded-xl border border-white/10 bg-white/[0.03] p-3">
                        <div className="flex items-start justify-between gap-3">
                          <div>
                            <p className="font-semibold">
                              {item.role === "uploader" ? "Uploader earning" : item.role === "sharer" ? "Sharer earning" : "Monetag earning"}
                            </p>
                            <p className="mt-1 text-xs text-white/55">{item.period || "अवधि उपलब्ध नहीं"}</p>
                            <p className="mt-1 text-xs text-white/45">{dateLabel(item.createdAt)}</p>
                          </div>
                          <div className="text-right">
                            <p className="font-bold">{usd(item.amountUsd)}</p>
                            <p className="mt-1 text-xs text-white/60">{item.status || "unknown"}</p>
                          </div>
                        </div>
                      </article>
                    ))}
                  </div>
                )}
              </div>

              <div className="rounded-2xl border border-indigo-300/15 bg-gradient-to-br from-[#17162b] via-[#111426] to-[#151522] p-4 shadow-lg shadow-purple-950/15">
                <h3 className="bg-gradient-to-r from-fuchsia-200 to-cyan-200 bg-clip-text text-lg font-bold text-transparent">Payment history</h3>
                {recentPayments.length === 0 ? (
                  <p className="mt-2 text-sm text-white/60">अभी कोई payment record नहीं है।</p>
                ) : (
                  <div className="mt-3 space-y-3">
                    {recentPayments.map((item) => (
                      <article key={item.id} className="rounded-xl border border-white/10 bg-white/[0.03] p-3">
                        <div className="flex items-start justify-between gap-3">
                          <div>
                            <p className="font-semibold">{item.transactionReference || "Payment record"}</p>
                            <p className="mt-1 text-xs text-white/50">{dateLabel(item.paidAt || item.createdAt)}</p>
                          </div>
                          <div className="text-right">
                            <p className="font-bold">{usd(item.amountUsd)}</p>
                            <p className="mt-1 text-xs text-white/60">{item.status || "unknown"}</p>
                          </div>
                        </div>
                      </article>
                    ))}
                  </div>
                )}
              </div>
              <p className="text-xs leading-5 text-white/45">
                नोट: अभी Monetag API की कुल/zone कमाई से यह साबित नहीं होता कि विज्ञापन किस share link पर चला। इसलिए केवल verified individual earning records ही यहाँ शामिल हैं। भुगतान का रिकॉर्ड दिखना अपने-आप bank transfer का प्रमाण नहीं है।
              </p>
            </>
          ) : null}
        </div>
      </section>
    </>
  );
}
