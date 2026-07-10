"use client";

export const dynamic = "force-dynamic";

import { useEffect, useState } from "react";
import {
  Activity,
  Users,
  ShoppingCart,
  Wallet,
  Bell,
  ShieldCheck,
  Clock3,
  Search,
  CheckCircle2,
  AlertTriangle
} from "lucide-react";

import { collection, onSnapshot, query, orderBy, limit } from "firebase/firestore";
import { auth, db } from "@/firebase/config";
import { useRouter } from "next/navigation";

// ✅ FIX 1: Removed manual 'time' string and locked data schema on Firestore Timestamp context
interface ActivityLog {
  id: string;
  title?: string;
  user?: string;
  type?: string;
  createdAt?: any; // Firestore Timestamp reference mapping object
}

export default function ActivityTrackerPage() {
  const router = useRouter();
  const [activities, setActivities] = useState<ActivityLog[]>([]);
  const [search, setSearch] = useState("");

  // Telemetry Aggregator Dashboard Counters
  const [stats, setStats] = useState({
    users: 0,
    orders: 0,
    finance: 0,
    alerts: 0,
  });
  useEffect(() => {
  const unsubscribe = auth.onAuthStateChanged((user) => {
    if (!user) {
      router.replace("/login");
    }
  });

  return () => unsubscribe();
}, [router]);

  // ✅ FIX 2: Modularized Icon Engine for multi-vector events support
  function getActivityIcon(type?: string) {
    switch (type) {
      case "User":
      case "Signup":
        return <Users size={22} className="text-[var(--text-color)]" />;
      case "Order":
        return <ShoppingCart size={22} className="text-[var(--text-color)]" />;
      case "Finance":
      case "Withdrawal":
        return <Wallet size={22} className="text-[var(--text-color)]" />;
      case "Security":
        return <ShieldCheck size={22} className="text-[var(--text-color)]" />;
      default:
        return <Activity size={22} className="text-[var(--text-color)]" />;
    }
  }

  function getActivityBgColor(type?: string) {
    switch (type) {
      case "User":
      case "Signup":
        return "bg-[var(--primary-color)]";
      case "Order":
        return "bg-[var(--success-color)]";
      case "Finance":
      case "Withdrawal":
        return "bg-[var(--warning-color)]";
      case "Security":
        return "bg-[var(--danger-color)]";
      default:
        return "bg-[var(--primary-color)]";
    }
  }

  // Realtime Live Logs Chronological Tracking pipeline
  useEffect(() => {
    const activityQuery = query(
      collection(db, "activityLogs"),
      orderBy("createdAt", "desc"),
      limit(100)
    );

    const unsubscribe = onSnapshot(
      activityQuery,
      (snapshot) => {
        const data = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        })) as ActivityLog[];
        
        setActivities(data);
        
        const securityCount = data.filter((item) => item.type === "Security").length;
        setStats((prev) => ({ ...prev, alerts: securityCount }));
      },
      (error) => {
        console.error("Firestore logging socket query channel exception:", error);
      }
    );

    return () => unsubscribe();
  }, []);

  // Realtime Counters Sockets Aggregations Network
  useEffect(() => {
    const unsubUsers = onSnapshot(
      collection(db, "users"),
      (snap) => setStats((prev) => ({ ...prev, users: snap.size })),
      (err) => console.error("Users socket pipe failure:", err)
    );

    const unsubOrders = onSnapshot(
      collection(db, "orders"),
      (snap) => setStats((prev) => ({ ...prev, orders: snap.size })),
      (err) => console.error("Orders socket pipe failure:", err)
    );

    const unsubWithdraw = onSnapshot(
      collection(db, "withdrawRequests"),
      (snap) => setStats((prev) => ({ ...prev, finance: snap.size })),
      (err) => console.error("Withdrawals socket pipe failure:", err)
    );

    return () => {
      unsubUsers();
      unsubOrders();
      unsubWithdraw();
    };
  }, []);

  // Filter Engine
  const filteredActivities = activities.filter((item) => {
    const titleStr = item.title || "Untitled Activity";
    const userStr = item.user || "System";
    const typeStr = item.type || "General";
    
    return `${titleStr} ${userStr} ${typeStr}`
      .toLowerCase()
      .includes(search.toLowerCase());
  });

  return (
    <main className="min-h-screen bg-[var(--primary-color)] p-4 text-[var(--button-text-color)]">
      {/* HEADER */}
      <div className="mb-8 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="flex h-16 w-16 items-center justify-center rounded-[28px] bg-[var(--primary-color)]">
            <Activity size={30} className="text-[var(--text-color)]" />
          </div>
          <div>
            <h1 className="text-3xl font-black">Activity Tracker</h1>
            <p className="mt-1 text-sm text-[var(--muted-text-color)]">
              Track realtime admin & user activities
            </p>
          </div>
        </div>
      </div>

      {/* STATS MATRIX SECTION */}
      <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
        <StatCard
          title="Users"
          value={stats.users.toLocaleString("en-IN")}
          icon={<Users size={22} />}
        />
        <StatCard
          title="Orders"
          value={stats.orders.toLocaleString("en-IN")}
          icon={<ShoppingCart size={22} />}
        />
        <StatCard
          title="Finance"
          value={stats.finance.toLocaleString("en-IN")}
          icon={<Wallet size={22} />}
        />
        <StatCard
          title="Alerts"
          value={stats.alerts.toLocaleString("en-IN")}
          icon={<Bell size={22} />}
        />
      </div>

      {/* SEARCH BOX MODULE */}
      <div className="mt-6 flex flex-col gap-4 md:flex-row">
        <div className="flex flex-1 items-center gap-3 rounded-[24px] border border-[var(--border-color)]/10 bg-[var(--primary-color)] px-4 py-3">
          <Search size={20} className="text-[var(--muted-text-color)]" />
          <input
            type="text"
            placeholder="Search activity..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-transparent outline-none placeholder:text-[var(--muted-text-color)]"
          />
        </div>
      </div>

      {/* REALTIME LIVE ACTIVITIES FEED LAYOUT */}
      <div className="mt-6 space-y-4">
        {filteredActivities.map((item, index) => (
          <div
            key={item.id || index}
            className="rounded-[28px] border border-[var(--border-color)]/10 bg-[var(--primary-color)] p-5 animate-fadeIn"
          >
            <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
              <div className="flex items-start gap-4">
                {/* Dynamic Background Wrapper Logic applied */}
                <div
                  className={`flex h-14 w-14 items-center justify-center rounded-2xl ${getActivityBgColor(
                    item.type
                  )}`}
                >
                  {/* ✅ FIX 2 (Cont...): Cleaner call execution node pattern */}
                  {getActivityIcon(item.type)}
                </div>

                <div>
                  <h2 className="text-2xl font-black">
                    {item.title || "Untitled Activity"}
                  </h2>
                  <p className="mt-1 text-sm text-[var(--muted-text-color)]">
                    {item.user || "System"}
                  </p>
                  <div className="mt-3 flex items-center gap-2 text-sm text-[var(--muted-text-color)]">
                    <Clock3 size={15} />
                    {/* ✅ FIX 1 (Cont...): Formatted Client-side Local Timestamp Rendering with defensive fallback control */}
                    {item.createdAt?.toDate
                      ? item.createdAt.toDate().toLocaleString("en-IN")
                      : "Recently"}
                  </div>
                </div>
              </div>

              <div
                className={`w-max rounded-full px-4 py-2 text-sm font-bold ${
                  item.type === "Security"
                    ? "bg-[var(--danger-color)]/20 text-[var(--danger-color)]"
                    : item.type === "Order"
                    ? "bg-[var(--success-color)]/20 text-[var(--success-color)]"
                    : "bg-[var(--primary-color)]/20 text-[var(--primary-color)]"
                }`}
              >
                {item.type || "General"}
              </div>
            </div>
          </div>
        ))}

        {filteredActivities.length === 0 && (
          <div className="py-12 text-center text-sm font-medium text-[var(--muted-text-color)]">
            No activity logs found.
          </div>
        )}
      </div>

      {/* MONITORING PLACARD */}
      <div className="mt-6 rounded-[30px] bg-gradient-to-r from-[var(--primary-color)] to-[var(--primary-color)] p-6">
        <div className="flex items-center gap-3">
          <CheckCircle2 size={26} />
          <h2 className="text-3xl font-black">Realtime Monitoring</h2>
        </div>
        <p className="mt-3 max-w-2xl text-sm text-[var(--button-text-color)]/90">
          All activities are monitored instantly with realtime tracking, analytics & security logs.
        </p>
      </div>

      {/* SUSPICIOUS WARNING CONTROL */}
      <div className="mt-6 rounded-[28px] border border-[var(--warning-color)]/20 bg-[var(--warning-color)]/10 p-5">
        <div className="flex items-start gap-4">
          <AlertTriangle size={24} className="text-[var(--warning-color)]" />
          <div>
            <h3 className="text-xl font-black text-[var(--warning-color)]">Suspicious Activity Detection</h3>
            <p className="mt-2 text-sm text-[var(--text-color)]">
              AI automatically detects unusual login, payment or admin activity for protection.
            </p>
          </div>
        </div>
      </div>
    </main>
  );
}

function StatCard({
  title,
  value,
  icon
}: {
  title: string;
  value: string;
  icon: React.ReactNode;
}) {
  return (
    <div className="rounded-[28px] border border-[var(--border-color)]/10 bg-[var(--primary-color)] p-5">
      <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[var(--primary-color)] text-[var(--text-color)]">
        {icon}
      </div>
      <p className="mt-4 text-sm text-[var(--muted-text-color)]">{title}</p>
      <h2 className="mt-2 text-3xl font-black">{value}</h2>
    </div>
  );
}
