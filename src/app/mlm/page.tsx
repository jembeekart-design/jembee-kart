"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { onAuthStateChanged } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import { auth, db } from "@/firebase/config";

import {
  ArrowLeft,
  BadgeIndianRupee,
  CheckCircle2,
  Copy,
  Crown,
  Gift,
  ShieldCheck,
  Users,
  Loader2
} from "lucide-react";

export default function MLMPage() {
  const [referralName, setReferralName] = useState<string>("");
  const [referralCode, setReferralCode] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(true);
  const [isCopied, setIsCopied] = useState<boolean>(false);

  // Load Firestore Data based on current authenticated user
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      try {
        if (user) {
          const userRef = doc(db, "users", user.uid);
          const userSnap = await getDoc(userRef);

          if (userSnap.exists()) {
            const data = userSnap.data();
            setReferralName(data.name || "User");
            setReferralCode(data.referralCode || "");
          }
        } else {
          // Fallback if not logged in
          setReferralName("Guest User");
          setReferralCode("NOT-LOGGED-IN");
        }
      } catch (error) {
        console.error("Error fetching user referral details:", error);
      } finally {
        setLoading(false);
      }
    });

    return () => unsubscribe();
  }, []);

  // Dynamic referral link setup
  const referralLink = referralCode 
    ? `https://jembeekart.com/register?ref=${referralCode}`
    : "https://jembeekart.com/register";

  // Clipboard copy utility
  async function copyReferral() {
    if (!referralCode || referralCode === "NOT-LOGGED-IN") {
      alert("Please log in to copy your referral link!");
      return;
    }

    try {
      await navigator.clipboard.writeText(
        `Name: ${referralName}\nCode: ${referralCode}\nLink: ${referralLink}`
      );
      
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2000); // Reset state after 2s
      alert("Name, Code & Referral Link Copied Successfully!");
    } catch (error) {
      console.error("Clipboard copy failed:", error);
    }
  }

  return (
    <main className="min-h-screen bg-[var(--color-primary-button)] pb-24">
      {/* HEADER */}
      <div className="sticky top-0 z-50 bg-[var(--color-card-background)]/90 backdrop-blur-md px-4 py-3 shadow-sm">
        <div className="flex items-center gap-3">
          <Link
            href="/"
            className="flex h-10 w-10 items-center justify-center rounded-full bg-[var(--color-primary-button)] text-[var(--color-primary-button)] hover:bg-[var(--color-primary-button)] transition-colors"
          >
            <ArrowLeft size={20} />
          </Link>
          <div>
            <h1 className="text-[22px] font-black text-[var(--color-primary-button)]">
              MLM Income
            </h1>
            <p className="text-[11px] text-[var(--text-secondary)]">
              Build Team & Earn Money
            </p>
          </div>
        </div>
      </div>

      {/* HERO SECTION */}
      <section className="px-4 pt-5">
        <div className="overflow-hidden rounded-[30px] bg-gradient-to-br from-[var(--color-primary-button)] via-[var(--color-primary-button)] to-[var(--color-primary-button)] p-5 text-[var(--button-text-color)] shadow-xl">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-[var(--color-card-background)]/20">
            <Crown size={34} />
          </div>

          <h2 className="mt-5 text-[32px] font-black leading-[38px]">
            Earn Money<br />From Your Network 🚀
          </h2>

          <p className="mt-4 text-[13px] leading-6 text-[var(--button-text-color)]/90">
            MLM system me aap logon ko join karte ho aur jab wo shopping ya earning karte hain tab aapko commission milta hai.
          </p>

          {/* REFERRAL CARD (With Glassmorphism Styling) */}
          <div className="mt-5 rounded-2xl bg-[var(--color-card-background)]/10 p-4 backdrop-blur-md border border-[var(--color-border)]/10">
            {loading ? (
              <div className="flex flex-col items-center justify-center py-6 gap-2">
                <Loader2 className="animate-spin text-[var(--button-text-color)]" size={24} />
                <p className="text-[12px] text-[var(--button-text-color)]/70">Fetching credentials...</p>
              </div>
            ) : (
              <>
                <p className="text-[11px] text-[var(--button-text-color)]/80 uppercase tracking-wider font-semibold">
                  Your Referral Details
                </p>

                <h3 className="mt-1 text-[20px] font-black tracking-tight">
                  {referralName}
                </h3>
                
                <p className="text-[13px] text-[var(--button-text-color)]/90 font-medium mt-1">
                  Code: <span className="font-mono bg-[var(--color-card-background)]/20 px-1.5 py-0.5 rounded text-[var(--color-warning)]">{referralCode}</span>
                </p>

                <div className="mt-4 rounded-xl bg-[var(--color-card-background)]/10 p-3 text-[11px] break-all font-mono border border-[var(--color-border)]/5 select-all">
                  {referralLink}
                </div>

                <button
                  onClick={copyReferral}
                  className="mt-4 flex w-full items-center justify-center gap-2 rounded-2xl bg-[var(--color-card-background)] py-3 text-[14px] font-black text-[var(--color-primary-button)] shadow-md active:scale-[0.98] transition-transform"
                >
                  <Copy size={18} />
                  {isCopied ? "Copied to Clipboard!" : "Copy Details & Link"}
                </button>
              </>
            )}
          </div>
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section className="mt-6 px-4">
        <h2 className="text-[24px] font-black text-[var(--text-primary)]">
          Kaise Kaam Karta Hai?
        </h2>

        <div className="mt-4 space-y-3">
          <div className="rounded-2xl bg-[var(--color-card-background)] p-4 shadow-sm border border-[var(--color-border)]">
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[var(--color-primary-button)] text-[var(--color-primary-button)]">
                <Users size={22} />
              </div>
              <div>
                <h3 className="text-[16px] font-black">1. People Join</h3>
                <p className="text-[12px] text-[var(--text-secondary)]">
                  Aap apne referral link se logon ko join karte ho.
                </p>
              </div>
            </div>
          </div>

          <div className="rounded-2xl bg-[var(--color-card-background)] p-4 shadow-sm border border-[var(--color-border)]">
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[var(--color-success)] text-[var(--color-success)]">
                <Gift size={22} />
              </div>
              <div>
                <h3 className="text-[16px] font-black">2. Team Grows</h3>
                <p className="text-[12px] text-[var(--text-secondary)]">
                  Jab wo dusre logon ko join karte hain tab aapki team grow hoti hai.
                </p>
              </div>
            </div>
          </div>

          <div className="rounded-2xl bg-[var(--color-card-background)] p-4 shadow-sm border border-[var(--color-border)]">
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[var(--color-warning)] text-[var(--color-warning)]">
                <BadgeIndianRupee size={22} />
              </div>
              <div>
                <h3 className="text-[16px] font-black">3. Earn Commission</h3>
                <p className="text-[12px] text-[var(--text-secondary)]">
                  Har order aur referral se aapko commission milta hai.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* BENEFITS */}
      <section className="mt-7 px-4">
        <h2 className="text-[24px] font-black">
          MLM Benefits
        </h2>

        <div className="mt-4 grid grid-cols-2 gap-3">
          <div className="rounded-2xl bg-[var(--color-card-background)] p-4 shadow-sm border border-[var(--color-border)]">
            <CheckCircle2 size={28} className="text-[var(--color-primary-button)]" />
            <h3 className="mt-3 text-[15px] font-black">Passive Income</h3>
            <p className="mt-1 text-[11px] text-[var(--text-secondary)]">Team se automatic earning.</p>
          </div>

          <div className="rounded-2xl bg-[var(--color-card-background)] p-4 shadow-sm border border-[var(--color-border)]">
            <Users size={28} className="text-[var(--color-primary-button)]" />
            <h3 className="mt-3 text-[15px] font-black">Unlimited Team</h3>
            <p className="mt-1 text-[11px] text-[var(--text-secondary)]">Jitni badi team utni earning.</p>
          </div>

          <div className="rounded-2xl bg-[var(--color-card-background)] p-4 shadow-sm border border-[var(--color-border)]">
            <ShieldCheck size={28} className="text-[var(--color-success)]" />
            <h3 className="mt-3 text-[15px] font-black">Secure System</h3>
            <p className="mt-1 text-[11px] text-[var(--text-secondary)]">Safe & transparent income.</p>
          </div>

          <div className="rounded-2xl bg-[var(--color-card-background)] p-4 shadow-sm border border-[var(--color-border)]">
            <BadgeIndianRupee size={28} className="text-[var(--color-warning)]" />
            <h3 className="mt-3 text-[15px] font-black">Daily Earnings</h3>
            <p className="mt-1 text-[11px] text-[var(--text-secondary)]">Roz commission earn karo.</p>
          </div>
        </div>
      </section>
    </main>
  );
}
