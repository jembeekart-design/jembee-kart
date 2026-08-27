"use client";

export const dynamic = "force-dynamic";

import { useEffect, useState } from "react";
import { onAuthStateChanged } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import { auth, db } from "@/firebase/config";
import Link from "next/link";
import {
  ArrowRight,
  BadgeIndianRupee,
  Bell,
  BriefcaseBusiness,
  CircleDollarSign,
  ClipboardCheck,
  Crown,
  Gift,
  LayoutDashboard,
  LifeBuoy,
  Medal,
  Network,
  Package,
  PlayCircle,
  ShieldCheck,
  Trophy,
  Users,
  Wallet,
  WalletCards
} from "lucide-react";
// REPLACED: Use the enterprise-grade config hook
import { useAdminConfig } from "@/lib/admin-config/provider";

/* ======================================================
MENU ITEMS
====================================================== */
const dashboardItems = [
  { title: "Dashboard", icon: LayoutDashboard, href: "/mlm/dashboard", color: "from-[var(--color-primary-button)] to-[var(--color-primary-button)]" },
  { title: "Invite", icon: Users, href: "/mlm/invite", color: "from-[var(--color-primary-button)] to-[var(--color-primary-button)]" },
  { title: "Network", icon: Network, href: "/mlm/network", color: "from-[var(--color-primary-button)] to-[var(--color-primary-button)]" },
  { title: "Earnings", icon: BadgeIndianRupee, href: "/mlm/earnings", color: "from-[var(--color-primary-button)] to-[var(--color-primary-button)]" },
  { title: "Wallet", icon: Wallet, href: "/mlm/wallet", color: "from-[var(--color-primary-button)] to-[var(--color-primary-button)]" },
  { title: "Withdraw", icon: WalletCards, href: "/mlm/withdraw", color: "from-[var(--color-primary-button)] to-[var(--color-primary-button)]" },
  { title: "Leaderboard", icon: Trophy, href: "/mlm/leaderboard", color: "from-[var(--color-primary-button)] to-[var(--color-primary-button)]" },
  { title: "Ranks", icon: Medal, href: "/mlm/ranks", color: "from-[var(--color-primary-button)] to-[var(--color-primary-button)]" },
  { title: "Cashback", icon: Gift, href: "/mlm/cashback", color: "from-[var(--color-primary-button)] to-[var(--color-primary-button)]" },
  { title: "Watch Earn", icon: PlayCircle, href: "/mlm/watch-earn", color: "from-[var(--color-primary-button)] to-[var(--color-primary-button)]" },
  { title: "Team Business", icon: BriefcaseBusiness, href: "/mlm/team-business", color: "from-[var(--color-primary-button)] to-[var(--color-primary-button)]" },
  { title: "Orders", icon: Package, href: "/mlm/orders", color: "from-[var(--color-primary-button)] to-[var(--color-primary-button)]" },
  { title: "Notifications", icon: Bell, href: "/mlm/notifications", color: "from-[var(--color-primary-button)] to-[var(--color-primary-button)]" },
  { title: "Permissions", icon: ClipboardCheck, href: "/mlm/permissions", color: "from-[var(--color-primary-button)] to-[var(--color-primary-button)]" },
  { title: "Support", icon: LifeBuoy, href: "/mlm/support", color: "from-[var(--color-primary-button)] to-[var(--color-primary-button)]" }
];

/* ======================================================
COMPONENT
====================================================== */
export default function AffiliatePage() {
  const { config, status } = useAdminConfig();
  const [userData, setUserData] = useState<any>(null);

  // Loading state handling
  if (status === "loading") return null;

  const { referral, mlm, watchEarn, cashback } = config.featureFlags;

  const menuItems = dashboardItems.filter((item) => {
    if (item.href.includes("/cashback")) return cashback;
    if (item.href.includes("/watch-earn")) return watchEarn;
    if (item.href.includes("/mlm")) return mlm;
    return true;
  });

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (user) => {
      if (!user) return;
      const snap = await getDoc(doc(db, "users", user.uid));
      if (snap.exists()) setUserData(snap.data());
    });
    return () => unsub();
  }, []);

  if (!referral || !mlm) return null;

  return (
    <main className="min-h-screen bg-[var(--color-page-background)] pb-32">
      {/* HERO SECTION */}
      <section className="relative overflow-hidden bg-gradient-to-br from-[var(--color-primary-button)] via-[var(--color-primary-button)] to-[var(--color-primary-button)] px-4 pb-10 pt-12 text-[var(--button-text-color)]">
        <div className="absolute right-[-40px] top-[-40px] h-40 w-40 rounded-full bg-[var(--color-card-background)]/10" />
        <div className="absolute bottom-[-60px] left-[-40px] h-44 w-44 rounded-full bg-[var(--color-card-background)]/10" />

        <div className="relative z-10">
          <div className="flex items-center gap-3">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-[var(--color-card-background)]/20">
              <Crown size={34} />
            </div>
            <div>
              <h1 className="text-[30px] font-black">MLM Dashboard</h1>
              <p className="text-sm text-[var(--button-text-color)]/80">Build Team & Earn Daily</p>
            </div>
          </div>

          <div className="mt-8 rounded-[28px] bg-[var(--color-card-background)]/10 p-5 backdrop-blur-md">
            <p className="text-xs text-[var(--button-text-color)]/70">Referral Name</p>
            <h2 className="mt-1 text-[28px] font-black">{userData?.name || "Loading..."}</h2>
            <div className="mt-5 grid grid-cols-3 gap-3">
              <div><p className="text-xs text-[var(--button-text-color)]/70">Team</p><h3 className="text-xl font-black">{userData?.totalReferrals || 0}</h3></div>
              <div><p className="text-xs text-[var(--button-text-color)]/70">Income</p><h3 className="text-xl font-black">₹{userData?.totalIncome || 0}</h3></div>
              <div><p className="text-xs text-[var(--button-text-color)]/70">Rank</p><h3 className="text-xl font-black">{userData?.rank || "Member"}</h3></div>
            </div>
          </div>
        </div>
      </section>

      {/* STATS */}
      <section className="-mt-8 px-4">
        <div className="grid grid-cols-2 gap-4">
          <div className="rounded-[28px] bg-[var(--color-card-background)] p-5 shadow-xl">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[var(--color-success)] text-[var(--color-success)]"><CircleDollarSign size={30} /></div>
            <p className="mt-4 text-sm font-semibold text-[var(--text-secondary)]">Today Income</p>
            <h2 className="mt-1 text-[28px] font-black">₹{userData?.todayIncome || 0}</h2>
          </div>
          <div className="rounded-[28px] bg-[var(--color-card-background)] p-5 shadow-xl">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[var(--color-primary-button)] text-[var(--color-primary-button)]"><ShieldCheck size={28} /></div>
            <p className="mt-4 text-sm font-semibold text-[var(--text-secondary)]">Total Withdraw</p>
            <h2 className="mt-1 text-[28px] font-black">₹{userData?.totalWithdraw || 0}</h2>
          </div>
        </div>
      </section>

      {/* GRID MENU */}
      <section className="mt-8 px-4">
        <div className="mb-5">
          <h2 className="text-[28px] font-black">MLM Features</h2>
          <p className="text-sm text-[var(--text-secondary)]">Manage your business</p>
        </div>
        <div className="grid grid-cols-2 gap-4">
          {menuItems.map((item) => {
            const Icon = item.icon;
            return (
              <Link key={item.title} href={item.href} className="group overflow-hidden rounded-[30px] bg-[var(--color-card-background)] p-4 shadow-sm transition-all duration-300 active:scale-[0.98]">
                <div className={`flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br ${item.color}`}><Icon size={30} /></div>
                <h3 className="mt-4 text-[16px] font-black text-[var(--text-primary)]">{item.title}</h3>
                <div className="mt-3 flex items-center gap-1 text-xs font-bold text-[var(--color-primary-button)]">Open <ArrowRight size={14} /></div>
              </Link>
            );
          })}
        </div>
      </section>
    </main>
  );
}
