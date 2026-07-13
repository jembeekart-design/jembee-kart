"use client";

import { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { onAuthStateChanged } from "firebase/auth";
import { doc, onSnapshot } from "firebase/firestore";
import { auth, db } from "@/firebase/config";
import {
  Bell,
  Crown,
  Gift,
  Medal,
  Network,
  ShieldCheck,
  Sparkles,
  Star,
  Trophy,
  Users,
  Wallet,
  ShoppingBag
} from "lucide-react";

// ✅ 1, 2 & 3. Fully Aligned and Cleaned Up Interface Definition
interface UserData {
  name?: string;
  totalIncome?: number;
  todayIncome?: number;
  rank?: string;
  teamSize?: number;
  rewardCount?: number;       // Maintained with structural fallback logic
  referralCode?: string;      // ✅ Restored target referral field name
  unreadNotifications?: number; // ✅ Parent field mapping to save network reads
}

export default function MLMDashboardPage() {
  const router = useRouter();
  const config = useAdminConfig();
  const [loading, setLoading] = useState(true);
  const [userData, setUserData] = useState<UserData | null>(null);
  
  // Dynamic Performance States
  const [performanceMetrics, setPerformanceMetrics] = useState<number[]>([16, 24, 20, 36, 44]); 

  // Garbage collection pointers for active real-time listeners
  const unsubscribeDataRef = useRef<(() => void) | null>(null);

  useEffect(() => {
    // Tight Security Lock for Route Guarding
    const unsubscribeAuth = onAuthStateChanged(auth, (user) => {
      if (!user) {
        console.warn("Unauthorized access. Dropping telemetry links.");
        router.push("/login");
        return;
      }

      const userRef = doc(db, "users", user.uid);
      
      // Memory Leak Prevention: Clear existing sync points if found active
      if (unsubscribeDataRef.current) unsubscribeDataRef.current();

      // Main active real-time data sync node
      unsubscribeDataRef.current = onSnapshot(userRef, (docSnap) => {
        if (docSnap.exists()) {
          const data = docSnap.data() as UserData;
          setUserData(data);

          // Reactive Performance Computation Block
          const tSize = data.teamSize || 0;
          const rCount = data.rewardCount || 0;
          const todayInc = data.todayIncome || 0;
          
          const computedGraphValues = [
            Math.min(48, Math.max(12, tSize * 2)), 
            Math.min(48, Math.max(12, rCount * 3)), 
            Math.min(48, Math.max(12, Math.floor(todayInc / 100))),
            Math.min(48, Math.max(12, (tSize + rCount) * 1.5)),
            Math.min(48, Math.max(12, Math.floor((data.totalIncome || 0) / 2000)))
          ];
          setPerformanceMetrics(computedGraphValues);
        } else {
          console.error("User execution data profiles not found inside Firestore index tier.");
        }
        setLoading(false);
      }, (error) => {
        console.error("Firestore live streaming channel error:", error);
        setLoading(false);
      });
    });

    // Cleanup active channel links on unmount parameters execution
    return () => {
      unsubscribeAuth();
      if (unsubscribeDataRef.current) unsubscribeDataRef.current();
    };
  }, [router]);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[var(--primary-color)] text-sm font-black text-[var(--primary-color)] uppercase tracking-widest">
        Loading JembeeKart Metrics...
      </div>
    );
  }

  // Value presentation maps
  const formattedTotalIncome = (userData?.totalIncome || 0).toLocaleString("en-IN");
  const formattedTodayIncome = (userData?.todayIncome || 0).toLocaleString("en-IN");
  const unreadCount = userData?.unreadNotifications || 0; // ✅ Mapped directly to document state instead of sub-collection reads

  const quickActions = [
    { title: "Invite", href: "/mlm/invite", icon: Users, color: "bg-[var(--primary-color)] text-[var(--primary-color)]" },
    { title: "Wallet", href: "/mlm/wallet", icon: Wallet, color: "bg-[var(--success-color)] text-[var(--success-color)]" },
    { title: "Network", href: "/mlm/network", icon: Network, color: "bg-[var(--warning-color)] text-[var(--warning-color)]" },
    { title: "Tasks", href: "/mlm/tasks", icon: Gift, color: "bg-[var(--primary-color)] text-[var(--primary-color)]" }
  ];

  const stats = [
    { title: "Total Team", value: userData?.teamSize || 0, icon: Users, color: "text-[var(--primary-color)]" },
    { title: "Today's Income", value: `₹${formattedTodayIncome}`, icon: Sparkles, color: "text-[var(--success-color)]" },
    { title: "Rank", value: userData?.rank || "Bronze Member", icon: Crown, color: "text-[var(--warning-color)]" },
    { title: "Rewards", value: userData?.rewardCount || 0, icon: Trophy, color: "text-[var(--warning-color)]" }
  ];

  return (
    <main className="min-h-screen bg-[var(--primary-color)] pb-28">
      {/* HEADER */}
      <div className="sticky top-0 z-50 bg-[var(--card-color)] px-4 py-3 shadow-sm">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-[28px] font-black text-[var(--primary-color)]">MLM Dashboard</h1>
            <p className="text-[11px] text-[var(--muted-text-color)]">
              Welcome Back, <span className="font-bold text-[var(--text-color)]">{userData?.name || "Partner"}</span> 👋
            </p>
          </div>

          <Link
            href="/mlm/notifications"
            className="relative flex h-12 w-12 items-center justify-center rounded-full bg-[var(--primary-color)] text-[var(--primary-color)]"
          >
            <Bell size={22} />
            {/* ✅ 3. Dynamic Unread Notification Counter sourced straight from root document schema state */}
            {unreadCount > 0 && (
              <div className="absolute right-2 top-2 flex h-4 w-4 items-center justify-center rounded-full bg-[var(--danger-color)] text-[9px] font-black text-[var(--button-text-color)] border-2 border-[var(--border-color)] animate-bounce">
                {unreadCount}
              </div>
            )}
          </Link>
        </div>
      </div>

      {/* CONTINUE SHOPPING GATEWAY ROW */}
      <section className="px-4 pt-4">
        <Link
          href="/"
          className="flex items-center justify-center gap-2 w-full rounded-2xl bg-[var(--card-color)] border-2 border-dashed border-[var(--primary-color)] py-3 text-[13px] font-black text-[var(--primary-color)] hover:bg-[var(--primary-color)] transition active:scale-[0.99]"
        >
          <ShoppingBag size={18} />
          Continue Shopping
        </Link>
      </section>

      {/* HERO SECTION (DYNAMIC INCOME VALUES) */}
      <section className="px-4 pt-4">
        <div className="overflow-hidden rounded-[32px] bg-gradient-to-br from-[var(--primary-color)] via-[var(--primary-color)] to-[var(--primary-color)] p-5 text-[var(--button-text-color)] shadow-xl">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-[13px] text-[var(--button-text-color)]/80">Total Earnings</p>
              <h2 className="mt-2 text-[42px] font-black">₹{formattedTotalIncome}</h2>
            </div>
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-[var(--card-color)]/20">
              <Wallet size={34} />
            </div>
          </div>

          <div className="mt-6 flex items-center justify-between">
            <div>
              <p className="text-[11px] text-[var(--button-text-color)]/80">Current Rank</p>
              <h3 className="mt-1 text-[20px] font-black">{userData?.rank || "Bronze Member"} 👑</h3>
            </div>
            <Link href="/mlm/ranks" className="rounded-2xl bg-[var(--card-color)] px-4 py-2 text-[12px] font-black text-[var(--primary-color)]">
              View Rank
            </Link>
          </div>
        </div>
      </section>

      {/* QUICK ACTIONS ROW */}
      <section className="mt-6 px-4">
        <div className="grid grid-cols-4 gap-3">
          {quickActions.map((action, index) => {
            const Icon = action.icon;
            return (
              <Link key={index} href={action.href} className="rounded-3xl bg-[var(--card-color)] p-4 text-center shadow-sm hover:scale-[1.02] transition">
                <div className={`mx-auto flex h-14 w-14 items-center justify-center rounded-full ${action.color}`}>
                  <Icon size={26} />
                </div>
                <h3 className="mt-3 text-[12px] font-black">{action.title}</h3>
              </Link>
            );
          })}
        </div>
      </section>

      {/* GRID BASE CORE METRICS OVERVIEW */}
      <section className="mt-6 px-4">
        <div className="grid grid-cols-2 gap-3">
          {stats.map((stat, index) => {
            const Icon = stat.icon;
            return (
              <div key={index} className="rounded-2xl bg-[var(--card-color)] p-4 shadow-sm">
                <Icon size={28} className={stat.color} />
                <h3 className="mt-3 text-[26px] font-black tracking-tight text-[var(--text-color)]">{stat.value}</h3>
                <p className="text-[12px] text-[var(--muted-text-color)]">{stat.title}</p>
              </div>
            );
          })}
        </div>
      </section>

      {/* REFERRAL PORTAL HOOK */}
      <section className="mt-6 px-4">
        <div className="rounded-[30px] bg-[var(--card-color)] p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-[22px] font-black">Referral Code</h2>
              <p className="mt-1 text-[11px] text-[var(--muted-text-color)]">Share & Earn</p>
            </div>
            <Users size={28} className="text-[var(--primary-color)]" />
          </div>

          <div className="mt-5 rounded-2xl bg-[var(--primary-color)] p-4 text-center">
            {/* ✅ 1. Corrected path reading configuration to show correct string data code values */}
            <h3 className="text-[28px] font-black tracking-widest text-[var(--primary-color)] uppercase">
              {userData?.referralCode || "NO_CODE"}
            </h3>
          </div>

          <Link href="/mlm/invite" className="mt-5 flex items-center justify-center rounded-2xl bg-[var(--primary-color)] py-3 text-[14px] font-black text-[var(--button-text-color)] hover:bg-[var(--primary-color)] transition">
            Invite Friends
          </Link>
        </div>
      </section>

      {/* PERFORMANCE REAL-TIME RENDER GRAPH */}
      <section className="mt-6 px-4">
        <div className="rounded-[30px] bg-[var(--card-color)] p-5 shadow-sm">
          <div className="flex items-center gap-3">
            <Medal size={24} className="text-[var(--warning-color)]" />
            <h2 className="text-[22px] font-black">Performance</h2>
          </div>

          <div className="mt-5 flex h-48 items-end gap-2 px-2 border-b border-[var(--border-color)] pb-1">
            <div style={{ height: `${performanceMetrics[0]}%` }} className="w-full rounded-t-xl bg-[var(--primary-color)] transition-all duration-500" title="Team Weightage" />
            <div style={{ height: `${performanceMetrics[1]}%` }} className="w-full rounded-t-xl bg-[var(--primary-color)] transition-all duration-500" title="Rewards Scaler" />
            <div style={{ height: `${performanceMetrics[2]}%` }} className="w-full rounded-t-xl bg-[var(--primary-color)] transition-all duration-500" title="Today Velocity" />
            <div style={{ height: `${performanceMetrics[3]}%` }} className="w-full rounded-t-xl bg-[var(--warning-color)] transition-all duration-500" title="Compound Velocity" />
            <div style={{ height: `${performanceMetrics[4]}%` }} className="w-full rounded-t-xl bg-[var(--primary-color)] transition-all duration-500" title="Earnings Matrix" />
          </div>
          <div className="flex justify-between text-[9px] font-black uppercase text-[var(--muted-text-color)] mt-2 px-1">
            <span>Team</span>
            <span>Rwd</span>
            <span>Td.Inc</span>
            <span>Cmp</span>
            <span>Earn</span>
          </div>
        </div>
      </section>

      {/* NAVIGATION PANEL LIST HIERARCHY */}
      <section className="mt-6 px-4">
        <div className="space-y-3">
          {config.mlmPage.navigation.map((item, idx) => {
            const ItemIcon = item.icon;
            return (
              <Link key={idx} href={item.href} className="flex items-center justify-between rounded-2xl bg-[var(--card-color)] p-4 shadow-sm hover:translate-x-1 transition-transform">
                <div className="flex items-center gap-3">
                  <ItemIcon size={24} className={item.color} />
                  <div>
                    <h3 className="text-[15px] font-black">{item.title}</h3>
                    <p className="text-[11px] text-[var(--muted-text-color)]">{item.desc}</p>
                  </div>
                </div>
                <Star size={20} className="text-[var(--muted-text-color)]" />
              </Link>
            );
          })}
        </div>
      </section>
    </main>
  );
}
