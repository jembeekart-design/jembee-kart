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
import { useAdminPage } from "@/lib/admin-config/useAdminPage";

/* ======================================================
MENU ITEMS
====================================================== */

const dashboardItems = [
  {
    title: "Dashboard",
    icon: LayoutDashboard,
    href: "/mlm/dashboard",
    color: "from-[var(--primary-color)] to-[var(--primary-color)]"
  },
  {
    title: "Invite",
    icon: Users,
    href: "/mlm/invite",
    color: "from-[var(--primary-color)] to-[var(--primary-color)]"
  },
  {
    title: "Network",
    icon: Network,
    href: "/mlm/network",
    color: "from-[var(--primary-color)] to-[var(--primary-color)]"
  },
  {
    title: "Earnings",
    icon: BadgeIndianRupee,
    href: "/mlm/earnings",
    color: "from-[var(--primary-color)] to-[var(--primary-color)]"
  },
  {
    title: "Wallet",
    icon: Wallet,
    href: "/mlm/wallet",
    color: "from-[var(--primary-color)] to-[var(--primary-color)]"
  },
  {
    title: "Withdraw",
    icon: WalletCards,
    href: "/mlm/withdraw",
    color: "from-[var(--primary-color)] to-[var(--primary-color)]"
  },
  {
    title: "Leaderboard",
    icon: Trophy,
    href: "/mlm/leaderboard",
    color: "from-[var(--primary-color)] to-[var(--primary-color)]"
  },
  {
    title: "Ranks",
    icon: Medal,
    href: "/mlm/ranks",
    color: "from-[var(--primary-color)] to-[var(--primary-color)]"
  },
  {
    title: "Cashback",
    icon: Gift,
    href: "/mlm/cashback",
    color: "from-[var(--primary-color)] to-[var(--primary-color)]"
  },
  {
    title: "Watch Earn",
    icon: PlayCircle,
    href: "/mlm/watch-earn",
    color: "from-[var(--primary-color)] to-[var(--primary-color)]"
  },
  {
    title: "Team Business",
    icon: BriefcaseBusiness,
    href: "/mlm/team-business",
    color: "from-[var(--primary-color)] to-[var(--primary-color)]"
  },
  {
    title: "Orders",
    icon: Package,
    href: "/mlm/orders",
    color: "from-[var(--primary-color)] to-[var(--primary-color)]"
  },
  {
    title: "Notifications",
    icon: Bell,
    href: "/mlm/notifications",
    color: "from-[var(--primary-color)] to-[var(--primary-color)]"
  },
  {
    title: "Permissions",
    icon: ClipboardCheck,
    href: "/mlm/permissions",
    color: "from-[var(--primary-color)] to-[var(--primary-color)]"
  },
  {
    title: "Support",
    icon: LifeBuoy,
    href: "/mlm/support",
    color: "from-[var(--primary-color)] to-[var(--primary-color)]"
  }
];

/* ======================================================
COMPONENT
====================================================== */

export default function AffiliatePage() {
  const { config } = useAdminPage();
  const referralEnabled = config.featureFlags.referral;
const mlmEnabled = config.featureFlags.mlm;
const watchEarnEnabled = config.featureFlags.watchEarn;
const cashbackEnabled = config.featureFlags.cashback;
  const menuItems = dashboardItems.filter((item) => {
  if (item.href.includes("/cashback")) {
    return cashbackEnabled;
  }

  if (item.href.includes("/watch-earn")) {
    return watchEarnEnabled;
  }

  if (item.href.includes("/mlm")) {
    return mlmEnabled;
  }

  return true;
});

142  const [userData, setUserData] = useState<any>(null);
  const [userData, setUserData] = useState<any>(null);

  /* ======================================================
  FIREBASE AUTH & REAL-TIME DOCUMENT HYDRATION ENGINE
  ====================================================== */
  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (user) => {
      if (!user) return;

      const snap = await getDoc(
        doc(db, "users", user.uid)
      );

      if (snap.exists()) {
        setUserData(snap.data());
      }
    });

    return () => unsub();
  }, []);
if (!referralEnabled || !mlmEnabled) {
  return null;
}
  return (
    <main className="min-h-screen bg-[var(--primary-color)] pb-32">
      
      {/* ======================================================
      HERO SECTION
      ====================================================== */}
      <section className="relative overflow-hidden bg-gradient-to-br from-[var(--primary-color)] via-[var(--primary-color)] to-[var(--primary-color)] px-4 pb-10 pt-12 text-[var(--button-text-color)]">
        
        {/* BG CIRCLES */}
        <div className="absolute right-[-40px] top-[-40px] h-40 w-40 rounded-full bg-[var(--card-color)]/10" />
        <div className="absolute bottom-[-60px] left-[-40px] h-44 w-44 rounded-full bg-[var(--card-color)]/10" />

        <div className="relative z-10">
          
          {/* TOP */}
          <div className="flex items-center gap-3">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-[var(--card-color)]/20">
              <Crown size={34} />
            </div>
            <div>
              <h1 className="text-[30px] font-black">MLM Dashboard</h1>
              <p className="text-sm text-[var(--button-text-color)]/80">Build Team & Earn Daily</p>
            </div>
          </div>

          {/* USER CARD */}
          <div className="mt-8 rounded-[28px] bg-[var(--card-color)]/10 p-5 backdrop-blur-md">
            <p className="text-xs text-[var(--button-text-color)]/70">Referral Name</p>
            <h2 className="mt-1 text-[28px] font-black">
              {userData?.name || "Loading..."}
            </h2>

            {/* DYNAMIC TELEMETRY STATS */}
            <div className="mt-5 grid grid-cols-3 gap-3">
              <div>
                <p className="text-xs text-[var(--button-text-color)]/70">Team</p>
                <h3 className="text-xl font-black">
                  {userData?.totalReferrals || 0}
                </h3>
              </div>

              <div>
                <p className="text-xs text-[var(--button-text-color)]/70">Income</p>
                <h3 className="text-xl font-black">
                  ₹{userData?.totalIncome || 0}
                </h3>
              </div>

              <div>
                <p className="text-xs text-[var(--button-text-color)]/70">Rank</p>
                <h3 className="text-xl font-black">
                  {userData?.rank || "Member"}
                </h3>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* ======================================================
      QUICK STATS (UPDATED FIELDS)
      ====================================================== */}
      <section className="-mt-8 px-4">
        <div className="grid grid-cols-2 gap-4">
          
          {/* TODAY INCOME */}
          <div className="rounded-[28px] bg-[var(--card-color)] p-5 shadow-xl">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[var(--success-color)] text-[var(--success-color)]">
              <CircleDollarSign size={30} />
            </div>
            <p className="mt-4 text-sm font-semibold text-[var(--muted-text-color)]">Today Income</p>
            <h2 className="mt-1 text-[28px] font-black">
              ₹{userData?.todayIncome || 0}
            </h2>
          </div>

          {/* TOTAL WITHDRAW */}
          <div className="rounded-[28px] bg-[var(--card-color)] p-5 shadow-xl">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[var(--primary-color)] text-[var(--primary-color)]">
              <ShieldCheck size={28} />
            </div>
            <p className="mt-4 text-sm font-semibold text-[var(--muted-text-color)]">Total Withdraw</p>
            <h2 className="mt-1 text-[28px] font-black">
              ₹{userData?.totalWithdraw || 0}
            </h2>
          </div>

        </div>
      </section>

      {/* ======================================================
      GRID MENU
      ====================================================== */}
      <section className="mt-8 px-4">
        <div className="mb-5">
          <h2 className="text-[28px] font-black">MLM Features</h2>
          <p className="text-sm text-[var(--muted-text-color)]">Manage your business</p>
        </div>

        {/* GRID */}
        <div className="grid grid-cols-2 gap-4">
          {menuItems.map((item) => {
  const Icon = item.icon;

  return (
    <Link
      key={item.title}
      href={item.href}
      className="group overflow-hidden rounded-[30px] bg-[var(--card-color)] p-4 shadow-sm transition-all duration-300 active:scale-[0.98]"
    >
      {/* ICON */}
      <div className={`flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br ${item.color}`}>
        <Icon size={30} />
      </div>

      {/* TITLE */}
      <h3 className="mt-4 text-[16px] font-black text-[var(--text-color)]">
        {item.title}
      </h3>

      {/* BUTTON */}
      <div className="mt-3 flex items-center gap-1 text-xs font-bold text-[var(--primary-color)]">
        Open
        <ArrowRight size={14} />
      </div>
    </Link>
  );
})}
        </div>
      </section>

    </main>
  );
}
