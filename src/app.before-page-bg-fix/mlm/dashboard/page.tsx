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

interface UserData {
  name?: string;
  totalIncome?: number;
  todayIncome?: number;
  rank?: string;
  teamSize?: number;
  rewardCount?: number;
  referralCode?: string;
  unreadNotifications?: number;
}

export default function MLMDashboardPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [userData, setUserData] = useState<UserData | null>(null);
  const [performanceMetrics, setPerformanceMetrics] = useState<number[]>([16, 24, 20, 36, 44]);
  const unsubscribeDataRef = useRef<(() => void) | null>(null);

  useEffect(() => {
    const unsubscribeAuth = onAuthStateChanged(auth, (user) => {
      if (!user) {
        router.push("/login");
        return;
      }

      const userRef = doc(db, "users", user.uid);
      if (unsubscribeDataRef.current) unsubscribeDataRef.current();

      unsubscribeDataRef.current = onSnapshot(userRef, (docSnap) => {
        if (docSnap.exists()) {
          const data = docSnap.data() as UserData;
          setUserData(data);

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
        }
        setLoading(false);
      });
    });

    return () => {
      unsubscribeAuth();
      if (unsubscribeDataRef.current) unsubscribeDataRef.current();
    };
  }, [router]);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[var(--color-primary-button)] text-sm font-black text-[var(--color-primary-button)] uppercase tracking-widest">
        Loading...
      </div>
    );
  }

  const formattedTotalIncome = (userData?.totalIncome || 0).toLocaleString("en-IN");
  const formattedTodayIncome = (userData?.todayIncome || 0).toLocaleString("en-IN");
  const unreadCount = userData?.unreadNotifications || 0;

  const quickActions = [
    { title: "Invite", href: "/mlm/invite", icon: Users, color: "bg-[var(--color-primary-button)] text-[var(--color-primary-button)]" },
    { title: "Wallet", href: "/mlm/wallet", icon: Wallet, color: "bg-[var(--color-success)] text-[var(--color-success)]" },
    { title: "Network", href: "/mlm/network", icon: Network, color: "bg-[var(--color-warning)] text-[var(--color-warning)]" },
    { title: "Tasks", href: "/mlm/tasks", icon: Gift, color: "bg-[var(--color-primary-button)] text-[var(--color-primary-button)]" }
  ];

  const stats = [
    { title: "Total Team", value: userData?.teamSize || 0, icon: Users, color: "text-[var(--color-primary-button)]" },
    { title: "Today's Income", value: `₹${formattedTodayIncome}`, icon: Sparkles, color: "text-[var(--color-success)]" },
    { title: "Rank", value: userData?.rank || "Bronze Member", icon: Crown, color: "text-[var(--color-warning)]" },
    { title: "Rewards", value: userData?.rewardCount || 0, icon: Trophy, color: "text-[var(--color-warning)]" }
  ];

  // Navigation Data Fix
  const navigation = [
    { href: "/mlm/earnings", title: "Earnings", desc: "View earnings", icon: Sparkles, color: "text-[var(--color-primary-button)]" },
    { href: "/mlm/leaderboard", title: "Leaderboard", desc: "Top performers", icon: Trophy, color: "text-[var(--color-warning)]" },
    { href: "/mlm/support", title: "Support", desc: "Get help", icon: ShieldCheck, color: "text-[var(--color-success)]" },
  ];

  return (
    <main className="min-h-screen bg-[var(--color-primary-button)] pb-28">
      <div className="sticky top-0 z-50 bg-[var(--color-card-background)] px-4 py-3 shadow-sm">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-[28px] font-black text-[var(--color-primary-button)]">MLM Dashboard</h1>
            <p className="text-[11px] text-[var(--text-secondary)]">
              Welcome Back, <span className="font-bold text-[var(--text-primary)]">{userData?.name || "Partner"}</span> 👋
            </p>
          </div>
          <Link href="/mlm/notifications" className="relative flex h-12 w-12 items-center justify-center rounded-full bg-[var(--color-primary-button)] text-[var(--color-primary-button)]">
            <Bell size={22} />
            {unreadCount > 0 && (
              <div className="absolute right-2 top-2 flex h-4 w-4 items-center justify-center rounded-full bg-[var(--color-danger)] text-[9px] font-black text-[var(--button-text-color)] border-2 border-[var(--color-border)] animate-bounce">
                {unreadCount}
              </div>
            )}
          </Link>
        </div>
      </div>

      <section className="px-4 pt-4">
        <Link href="/" className="flex items-center justify-center gap-2 w-full rounded-2xl bg-[var(--color-card-background)] border-2 border-dashed border-[var(--color-primary-button)] py-3 text-[13px] font-black text-[var(--color-primary-button)] hover:bg-[var(--color-primary-button)] transition active:scale-[0.99]">
          <ShoppingBag size={18} /> Continue Shopping
        </Link>
      </section>

      <section className="px-4 pt-4">
        <div className="overflow-hidden rounded-[32px] bg-gradient-to-br from-[var(--color-primary-button)] via-[var(--color-primary-button)] to-[var(--color-primary-button)] p-5 text-[var(--button-text-color)] shadow-xl">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-[13px] text-[var(--button-text-color)]/80">Total Earnings</p>
              <h2 className="mt-2 text-[42px] font-black">₹{formattedTotalIncome}</h2>
            </div>
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-[var(--color-card-background)]/20">
              <Wallet size={34} />
            </div>
          </div>
          <div className="mt-6 flex items-center justify-between">
            <div>
              <p className="text-[11px] text-[var(--button-text-color)]/80">Current Rank</p>
              <h3 className="mt-1 text-[20px] font-black">{userData?.rank || "Bronze Member"} 👑</h3>
            </div>
            <Link href="/mlm/ranks" className="rounded-2xl bg-[var(--color-card-background)] px-4 py-2 text-[12px] font-black text-[var(--color-primary-button)]">View Rank</Link>
          </div>
        </div>
      </section>

      <section className="mt-6 px-4">
        <div className="grid grid-cols-4 gap-3">
          {quickActions.map((action, index) => {
            const Icon = action.icon;
            return (
              <Link key={index} href={action.href} className="rounded-3xl bg-[var(--color-card-background)] p-4 text-center shadow-sm hover:scale-[1.02] transition">
                <div className={`mx-auto flex h-14 w-14 items-center justify-center rounded-full ${action.color}`}>
                  <Icon size={26} />
                </div>
                <h3 className="mt-3 text-[12px] font-black">{action.title}</h3>
              </Link>
            );
          })}
        </div>
      </section>

      <section className="mt-6 px-4">
        <div className="grid grid-cols-2 gap-3">
          {stats.map((stat, index) => {
            const Icon = stat.icon;
            return (
              <div key={index} className="rounded-2xl bg-[var(--color-card-background)] p-4 shadow-sm">
                <Icon size={28} className={stat.color} />
                <h3 className="mt-3 text-[26px] font-black tracking-tight text-[var(--text-primary)]">{stat.value}</h3>
                <p className="text-[12px] text-[var(--text-secondary)]">{stat.title}</p>
              </div>
            );
          })}
        </div>
      </section>

      <section className="mt-6 px-4">
        <div className="rounded-[30px] bg-[var(--color-card-background)] p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-[22px] font-black">Referral Code</h2>
              <p className="mt-1 text-[11px] text-[var(--text-secondary)]">Share & Earn</p>
            </div>
            <Users size={28} className="text-[var(--color-primary-button)]" />
          </div>
          <div className="mt-5 rounded-2xl bg-[var(--color-primary-button)] p-4 text-center">
            <h3 className="text-[28px] font-black tracking-widest text-[var(--color-primary-button)] uppercase">
              {userData?.referralCode || "NO_CODE"}
            </h3>
          </div>
          <Link href="/mlm/invite" className="mt-5 flex items-center justify-center rounded-2xl bg-[var(--color-primary-button)] py-3 text-[14px] font-black text-[var(--button-text-color)] hover:bg-[var(--color-primary-button)] transition">
            Invite Friends
          </Link>
        </div>
      </section>

      <section className="mt-6 px-4">
        <div className="rounded-[30px] bg-[var(--color-card-background)] p-5 shadow-sm">
          <div className="flex items-center gap-3">
            <Medal size={24} className="text-[var(--color-warning)]" />
            <h2 className="text-[22px] font-black">Performance</h2>
          </div>
          <div className="mt-5 flex h-48 items-end gap-2 px-2 border-b border-[var(--color-border)] pb-1">
            {performanceMetrics.map((val, i) => (
              <div key={i} style={{ height: `${val}%` }} className={`w-full rounded-t-xl transition-all duration-500 ${i === 3 ? "bg-[var(--color-warning)]" : "bg-[var(--color-primary-button)]"}`} />
            ))}
          </div>
        </div>
      </section>

      {/* FIXED NAVIGATION */}
      <section className="mt-6 px-4">
        <div className="space-y-3">
          {navigation.map((item, idx) => {
            const ItemIcon = item.icon;
            return (
              <Link key={idx} href={item.href} className="flex items-center justify-between rounded-2xl bg-[var(--color-card-background)] p-4 shadow-sm hover:translate-x-1 transition-transform">
                <div className="flex items-center gap-3">
                  <ItemIcon size={24} className={item.color} />
                  <div>
                    <h3 className="text-[15px] font-black">{item.title}</h3>
                    <p className="text-[11px] text-[var(--text-secondary)]">{item.desc}</p>
                  </div>
                </div>
                <Star size={20} className="text-[var(--text-secondary)]" />
              </Link>
            );
          })}
        </div>
      </section>
    </main>
  );
}
