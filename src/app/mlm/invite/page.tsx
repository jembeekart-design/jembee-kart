"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { onAuthStateChanged } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import { auth, db } from "@/firebase/config";

import {
  ArrowLeft,
  Copy,
  Gift,
  QrCode,
  Send,
  Share2,
  Users
} from "lucide-react";

export default function MLMInvitePage() {
  const [copied, setCopied] = useState(false);
  
  // Dynamic states initialization
  const [referralName, setReferralName] = useState("Loading...");
  const [referralCode, setReferralCode] = useState("");

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (!user) {
        setReferralName("Guest Customer");
        return;
      }

      try {
        const userRef = doc(db, "users", user.uid);
        const userSnap = await getDoc(userRef);

        if (userSnap.exists()) {
          const data = userSnap.data();

          setReferralName(
            data.name ||
            data.displayName ||
            "JembeeKart User"
          );

          setReferralCode(
            data.referralCode || ""
          );
        }
      } catch (error) {
        console.error("Error fetching user data for MLM page:", error);
      }
    });

    return () => unsubscribe();
  }, []);

  // Safe client-side route evaluation for link sharing
  const baseOrigin = typeof window !== "undefined" ? window.location.origin : "https://jembeekart.com";
  const referralLink = referralCode 
    ? `${baseOrigin}/login?ref=${referralCode}`
    : `${baseOrigin}/login`;

  async function copyReferral() {
    try {
      await navigator.clipboard.writeText(
        `${referralName}\n${referralLink}`
      );

      setCopied(true);
      setTimeout(() => {
        setCopied(false);
      }, 2000);
    } catch (error) {
      console.error(error);
    }
  }

  function shareWhatsApp() {
    const text = `Join JembeeKart MLM 🚀\n\n${referralName}\n${referralLink}`;
    window.open(
      `https://wa.me/?text=${encodeURIComponent(text)}`,
      "_blank"
    );
  }

  function shareTelegram() {
    const text = `Join JembeeKart MLM 🚀\n\n${referralName}\n${referralLink}`;
    window.open(
      `https://t.me/share/url?url=${encodeURIComponent(
        referralLink
      )}&text=${encodeURIComponent(text)}`,
      "_blank"
    );
  }

  return (
    <main className="min-h-screen bg-[#f6f6f6] pb-24">
      {/* HEADER */}
      <div className="sticky top-0 z-50 bg-[var(--card-color)] px-4 py-3 shadow-sm">
        <div className="flex items-center gap-3">
          <Link
            href="/mlm/dashboard"
            className="flex h-10 w-10 items-center justify-center rounded-full bg-violet-100 text-violet-700"
          >
            <ArrowLeft size={20} />
          </Link>

          <div>
            <h1 className="text-[24px] font-black text-violet-700">Invite & Earn</h1>
            <p className="text-[11px] text-[var(--muted-text-color)]">Share Referral Link</p>
          </div>
        </div>
      </div>

      {/* HERO SECTION */}
      <section className="px-4 pt-5">
        <div className="overflow-hidden rounded-[30px] bg-gradient-to-br from-violet-700 via-fuchsia-600 to-orange-500 p-5 text-[var(--button-text-color)] shadow-xl">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-[var(--card-color)]/20">
            <Gift size={34} />
          </div>

          <h2 className="mt-5 text-[32px] font-black leading-[38px]">
            Invite Friends
            <br />
            Earn Money 🚀
          </h2>

          <p className="mt-3 text-[13px] leading-6 text-[var(--button-text-color)]/90">
            Referral link share karo, team build karo aur unlimited MLM earning start karo.
          </p>
        </div>
      </section>

      {/* REFERRAL INFORMATION CARD */}
      <section className="mt-6 px-4">
        <div className="rounded-[30px] bg-[var(--card-color)] p-5 shadow-sm">
          <div className="flex items-center gap-3">
            <Users size={24} className="text-violet-700" />
            <h2 className="text-[22px] font-black">Your Referral</h2>
          </div>

          <div className="mt-5 rounded-2xl bg-[var(--background-color)] p-4">
            <p className="text-[11px] text-[var(--muted-text-color)]">Referral Name</p>
            <h3 className="mt-1 text-[18px] font-black text-gray-900">{referralName}</h3>

            <div className="mt-4 rounded-xl bg-[var(--card-color)] p-3 text-[11px] font-semibold text-purple-600 break-all select-all">
              {referralLink}
            </div>
          </div>

          {/* COPY ACTION */}
          <button
            onClick={copyReferral}
            disabled={!referralCode}
            className="mt-5 flex w-full items-center justify-center gap-2 rounded-2xl bg-violet-700 py-3 text-[14px] font-black text-[var(--button-text-color)] active:scale-[0.99] transition-all disabled:opacity-50"
          >
            <Copy size={18} />
            {copied ? "Copied" : "Copy Referral"}
          </button>
        </div>
      </section>

      {/* EXTERNAL SHARE CHANNELS */}
      <section className="mt-6 px-4">
        <div className="grid grid-cols-2 gap-3">
          {/* WHATSAPP */}
          <button
            onClick={shareWhatsApp}
            disabled={!referralCode}
            className="rounded-3xl bg-[var(--success-color)] p-5 text-[var(--button-text-color)] shadow-lg active:scale-[0.98] transition-all disabled:opacity-50 text-left"
          >
            <Share2 size={32} />
            <h3 className="mt-4 text-[18px] font-black">WhatsApp</h3>
            <p className="mt-1 text-[11px] text-[var(--button-text-color)]/90">Share instantly</p>
          </button>

          {/* TELEGRAM */}
          <button
            onClick={shareTelegram}
            disabled={!referralCode}
            className="rounded-3xl bg-sky-500 p-5 text-[var(--button-text-color)] shadow-lg active:scale-[0.98] transition-all disabled:opacity-50 text-left"
          >
            <Send size={32} />
            <h3 className="mt-4 text-[18px] font-black">Telegram</h3>
            <p className="mt-1 text-[11px] text-[var(--button-text-color)]/90">Invite your network</p>
          </button>
        </div>
      </section>

      {/* DYNAMIC QR DISPLAY METRICS */}
      <section className="mt-6 px-4">
        <div className="rounded-[30px] bg-[var(--card-color)] p-5 text-center shadow-sm">
          <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-violet-100 text-violet-700">
            <QrCode size={40} />
          </div>

          <h2 className="mt-5 text-[22px] font-black">Referral QR Code</h2>
          <p className="mt-2 text-[12px] leading-6 text-[var(--muted-text-color)]">
            QR scan karke direct referral joining karao.
          </p>

          <div className="mt-5 mx-auto flex h-52 w-52 items-center justify-center rounded-3xl border-4 border-dashed border-violet-200 bg-violet-50">
            <QrCode size={120} className="text-violet-700" />
          </div>
        </div>
      </section>
    </main>
  );
}
