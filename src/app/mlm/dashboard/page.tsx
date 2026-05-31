"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { onAuthStateChanged } from "firebase/auth";
import { doc, getDoc, onSnapshot, collection, query, where, limit } from "firebase/firestore";
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

// Strict Interface for Firestore Node Mapping
interface UserData {
  name?: string;
  totalEarnings?: number;
  todayIncome?: number;
  rank?: string;
  teamCount?: number;
  rewardCount?: number;
  referralCode?: string;
}

export default function MLMDashboardPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [userData, setUserData] = useState<UserData | null>(null);
  const [unreadNotifications, setUnreadNotifications] = useState(0);
  
  // Dynamic Performance States (Stores scaling metrics parsed directly from schema counters)
  const [performanceMetrics, setPerformanceMetrics] = useState<number[]>([16, 24, 20, 36, 44]); 

  useEffect(() => {
    // 🛑 2. Strict Authentication Protection Lock & Real-time Layer Binding
    const unsubscribeAuth = onAuthStateChanged(auth, (user) => {
      if (!user) {
        console.warn("Unauthorized navigation intercepted. Redirecting to auth gate.");
        router.push("/login");
        return;
      }

      /* ======================================================
      1, 3, 5 & 6. FIRESTORE REAL-TIME DATA PIPELINE INTEGRATION
      ====================================================== */
      const userRef = doc(db, "users", user.uid);
      
      // Using onSnapshot for active real-time dashboard frame sync without page reloads
      const unsubscribeData = onSnapshot(userRef, (docSnap) => {
        if (docSnap.exists()) {
          const data = docSnap.data() as UserData;
          setUserData(data);

          // 5. Dynamic Graph Performance Processing Block
          // We parse structural system counters to derive visual height increments reactively
          const tCount = data.teamCount || 0;
          const rCount = data.rewardCount || 0;
          const todayInc = data.todayIncome || 0;
          
          const computedGraphValues = [
            Math.min(48, Math.max(12, tCount * 2)), 
            Math.min(48, Math.max(12, rCount * 3)), 
            Math.min(48, Math.max(12, Math.floor(todayInc / 100))),
            Math.min(48, Math.max(12, (tCount + rCount) * 1.5)),
            Math.min(48, Math.max(12, Math.floor((data.totalEarnings || 0) / 2000)))
          ];
          setPerformanceMetrics(computedGraphValues);
        } else {
          console.error("User metrics configuration block empty inside Firestore database.");
        }
        setLoading(false);
      }, (error) => {
        console.error("Firestore synchronizer channel disrupted:", error);
        setLoading(false);
      });

      /* ======================================================
      4. NOTIFICATION COUNTER PIPELINE (UNREAD TRIGGERS)
      ====================================================== */
      const notificationsRef = collection(db, "users", user.uid, "notifications");
      const unreadQuery = query(notificationsRef, where("read", "==", false), limit(10));
      
      const unsubscribeNotifications = onSnapshot(unreadQuery, (snapshot) => {
        setUnreadNotifications(snapshot.size);
      });

      return () => {
        unsubscribeData();
        unsubscribeNotifications();
      };
    });

    return () => unsubscribeAuth();
  }, [router]);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#f6f6f6] text-sm font-black text-violet-700 uppercase tracking-widest">
        Loading JembeeKart Metrics...
      </div>
    );
  }

  // Formatting configurations to present structural data seamlessly
  const formattedTotalEarnings = (userData?.totalEarnings || 0).toLocaleString("en-IN");
  const formattedTodayIncome = (userData?.todayIncome || 0).toLocaleString("en-IN");

  const quickActions = [
    { title: "Invite", href: "/mlm/invite", icon: Users, color: "bg-violet-100 text-violet-700" },
    { title: "Wallet", href: "/mlm/wallet", icon: Wallet, color: "bg-green-100 text-green-700" },
    { title: "Network", href: "/mlm/network", icon: Network, color: "bg-orange-100 text-orange-700" },
    { title: "Tasks", href: "/mlm/tasks", icon: Gift, color: "bg-pink-100 text-pink-700" }
  ];

  const stats = [
    { title: "Total Team", value: userData?.teamCount || 0, icon: Users, color: "text-violet-700" },
    { title: "Today's Income", value: `装${formattedTodayIncome}`, icon: Sparkles, color: "text-green-600" },
    { title: "Rank", value: userData?.rank || "Bronze Member", icon: Crown, color: "text-yellow-600" },
    { title: "Rewards", value: userData?.rewardCount || 0, icon: Trophy, color: "text-orange-600" }
  ];

  return (
    <main className="min-h-screen bg-[#f6f6f6] pb-28">
      {/* HEADER */}
      <div className="sticky top-0 z-50 bg-white px-4 py-3 shadow-sm">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-[28px] font-black text-violet-700">MLM Dashboard</h1>
            {/* ✅ 3. Dynamic User Name Welcome Greeting Display */}
            <p className="text-[11px] text-gray-500">
              Welcome Back, <span className="font-bold text-gray-800">{userData?.name || "Partner"}</span> 👋
            </p>
          </div>

          <Link
            href="/mlm/notifications"
            className="relative flex h-12 w-12 items-center justify-center rounded-full bg-violet-100 text-violet-700"
          >
            <Bell size={22} />
            {/* ✅ 4. Dynamic Unread Notification Red Dot Condition Interceptor */}
            {unreadNotifications > 0 && (
              <div className="absolute right-2 top-2 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[9px] font-black text-white border-2 border-white animate-bounce">
                {unreadNotifications}
              </div>
            )}
          </Link>
        </div>
      </div>

      {/* ✅ 7. SHOPPING STREAMING ALIGNMENT GATEWAY */}
      <section className="px-4 pt-4">
        <Link
          href="/"
          className="flex items-center justify-center gap-2 w-full rounded-2xl bg-white border-2 border-dashed border-violet-200 py-3 text-[13px] font-black text-violet-700 hover:bg-violet-50 transition active:scale-[0.99]"
        >
          <ShoppingBag size={18} />
          Continue Shopping
        </Link>
      </section>

      {/* HERO SECTION (DYNAMIC EARNINGS) */}
      <section className="px-4 pt-4">
        <div className="overflow-hidden rounded-[32px] bg-gradient-to-br from-violet-700 via-fuchsia-600 to-orange-500 p-5 text-white shadow-xl">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-[13px] text-white/80">Total Earnings</p>
              {/* ✅ 1. Live Firestore Dynamic Data Sync */}
              <h2 className="mt-2 text-[42px] font-black">₹{formattedTotalEarnings}</h2>
            </div>
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-white/20">
              <Wallet size={34} />
            </div>
          </div>

          <div className="mt-6 flex items-center justify-between">
            <div>
              <p className="text-[11px] text-white/80">Current Rank</p>
              <h3 className="mt-1 text-[20px] font-black">{userData?.rank || "Bronze Member"} 👑</h3>
            </div>
            <Link href="/mlm/ranks" className="rounded-2xl bg-white px-4 py-2 text-[12px] font-black text-violet-700">
              View Rank
            </Link>
          </div>
        </div>
      </section>

      {/* QUICK ACTIONS */}
      <section className="mt-6 px-4">
        <div className="grid grid-cols-4 gap-3">
          {quickActions.map((action, index) => {
            const Icon = action.icon;
            return (
              <Link key={index} href={action.href} className="rounded-3xl bg-white p-4 text-center shadow-sm hover:scale-[1.02] transition">
                <div className={`mx-auto flex h-14 w-14 items-center justify-center rounded-full ${action.color}`}>
                  <Icon size={26} />
                </div>
                <h3 className="mt-3 text-[12px] font-black">{action.title}</h3>
              </Link>
            );
          })}
        </div>
      </section>

      {/* STATS OVERVIEW (LIVE SYNCHRONIZED) */}
      <section className="mt-6 px-4">
        <div className="grid grid-cols-2 gap-3">
          {stats.map((stat, index) => {
            const Icon = stat.icon;
            return (
              <div key={index} className="rounded-2xl bg-white p-4 shadow-sm">
                <Icon size={28} className={stat.color} />
                {/* ✅ 1. Dynamic Metric Node Mapping */}
                <h3 className="mt-3 text-[26px] font-black tracking-tight text-gray-800">{stat.value}</h3>
                <p className="text-[12px] text-gray-500">{stat.title}</p>
              </div>
            );
          })}
        </div>
      </section>

      {/* REFERRAL SYSTEM FRAMEWORK */}
      <section className="mt-6 px-4">
        <div className="rounded-[30px] bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-[22px] font-black">Referral Code</h2>
              <p className="mt-1 text-[11px] text-gray-500">Share & Earn</p>
            </div>
            <Users size={28} className="text-violet-700" />
          </div>

          <div className="mt-5 rounded-2xl bg-violet-50 p-4 text-center">
            {/* ✅ 6. Dynamic referralCode implementation from Firestore Document states */}
            <h3 className="text-[28px] font-black tracking-widest text-violet-700 uppercase">
              {userData?.referralCode || "NO_CODE"}
            </h3>
          </div>

          <Link href="/mlm/invite" className="mt-5 flex items-center justify-center rounded-2xl bg-violet-700 py-3 text-[14px] font-black text-white hover:bg-violet-800 transition">
            Invite Friends
          </Link>
        </div>
      </section>

      {/* PERFORMANCE REAL-TIME RENDER GRAPH */}
      <section className="mt-6 px-4">
        <div className="rounded-[30px] bg-white p-5 shadow-sm">
          <div className="flex items-center gap-3">
            <Medal size={24} className="text-yellow-600" />
            <h2 className="text-[22px] font-black">Performance</h2>
          </div>

          {/* ✅ 5. Render heights reactively based on live analytics variables instead of fixed utility classes */}
          <div className="mt-5 flex h-48 items-end gap-2 px-2 border-b border-gray-100 pb-1">
            <div style={{ height: `${performanceMetrics[0]}%` }} className="w-full rounded-t-xl bg-violet-200 transition-all duration-500" title="Team Weightage" />
            <div style={{ height: `${performanceMetrics[1]}%` }} className="w-full rounded-t-xl bg-violet-400 transition-all duration-500" title="Rewards Scaler" />
            <div style={{ height: `${performanceMetrics[2]}%` }} className="w-full rounded-t-xl bg-fuchsia-400 transition-all duration-500" title="Today Velocity" />
            <div style={{ height: `${performanceMetrics[3]}%` }} className="w-full rounded-t-xl bg-orange-400 transition-all duration-500" title="Compound Velocity" />
            <div style={{ height: `${performanceMetrics[4]}%` }} className="w-full rounded-t-xl bg-violet-700 transition-all duration-500" title="Earnings Matrix" />
          </div>
          <div className="flex justify-between text-[9px] font-black uppercase text-gray-400 mt-2 px-1">
            <span>Team</span>
            <span>Rwd</span>
            <span>Td.Inc</span>
            <span>Cmp</span>
            <span>Earn</span>
          </div>
        </div>
      </section>

      {/* EXTRA MODULE NAVIGATION HUB */}
      <section className="mt-6 px-4">
        <div className="space-y-3">
          {[
            { href: "/mlm/earnings", icon: Sparkles, title: "Earnings", desc: "MLM income details", color: "text-green-600" },
            { href: "/mlm/leaderboard", icon: Trophy, title: "Leaderboard", desc: "Top MLM performers", color: "text-yellow-600" },
            { href: "/mlm/support", icon: ShieldCheck, title: "MLM Support", desc: "Help & live support", color: "text-orange-600" }
          ].map((item, idx) => {
            const ItemIcon = item.icon;
            return (
              <Link key={idx} href={item.href} className="flex items-center justify-between rounded-2xl bg-white p-4 shadow-sm hover:translate-x-1 transition-transform">
                <div className="flex items-center gap-3">
                  <ItemIcon size={24} className={item.color} />
                  <div>
                    <h3 className="text-[15px] font-black">{item.title}</h3>
                    <p className="text-[11px] text-gray-500">{item.desc}</p>
                  </div>
                </div>
                <Star size={20} className="text-gray-400" />
              </Link>
            );
          })}
        </div>
      </section>
    </main>
  );
}
