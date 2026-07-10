"use client";

export const dynamic = "force-dynamic";

import { useEffect, useState } from "react";
import {
  collection,
  doc,
  updateDoc,
  onSnapshot
} from "firebase/firestore";
import { db } from "@/firebase/config";
import {
  User,
  ShieldAlert,
  ShieldCheck,
  Search,
  Wallet,
  Network,
  Package,
  Save,
  Users,
  UserCheck,
  UserX,
  Award,
  Lock,
  Unlock,
  QrCode,
  Fingerprint
} from "lucide-react";

// ✅ 1. UserItem Interface Matrix with Extended MLM & Control Nodes
interface UserItem {
  id: string;
  name?: string;
  email?: string;
  role?: string;
  isBlocked?: boolean;
  photo?: string;
  mlmActive?: boolean;
  joinedPackage?: boolean;
  walletBalance?: number;
  totalReferrals?: number;
  // New Scalable Schema Fields
  uid?: string;
  shareCode?: string;
  rank?: string;
  walletLocked?: boolean;
  accountStatus?: string;
}

export default function UsersPage() {
  const [users, setUsers] = useState<UserItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  // Target Specific User Local Form Editing Matrices
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<Partial<UserItem>>({});

  // Operational Dashboard Stats Engine
  const [stats, setStats] = useState({
    total: 0,
    mlmActive: 0,
    blocked: 0,
    referrals: 0,
  });

  // Realtime Synchronization Multi-Socket Layer (onSnapshot)
  useEffect(() => {
    const unsubscribe = onSnapshot(
      collection(db, "users"),
      (snapshot) => {
        const data = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        })) as UserItem[];

        setUsers(data);

        // Compute Live Metrics Aggregates
        let mlmCount = 0;
        let blockedCount = 0;
        let referralSum = 0;

        data.forEach((u) => {
          if (u.mlmActive) mlmCount++;
          if (u.isBlocked) blockedCount++;
          referralSum += u.totalReferrals || 0;
        });

        setStats({
          total: data.length,
          mlmActive: mlmCount,
          blocked: blockedCount,
          referrals: referralSum,
        });

        setLoading(false);
      },
      (error) => {
        console.error("Realtime User management socket pipeline exception:", error);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, []);

  // Initialize Local Component Memory Buffer state for Editing Fields safely
  const startEditing = (user: UserItem) => {
    setEditingId(user.id);
    setEditForm({
      name: user.name || "",
      role: user.role || "user",
      photo: user.photo || "",
    });
  };

  // ✅ 2. saveUserChanges() with EMAIL REMOVED to avoid Firebase Auth drift parameters
  const saveUserChanges = async (id: string) => {
    try {
      const userRef = doc(db, "users", id);
      await updateDoc(userRef, {
        name: editForm.name,
        role: editForm.role,
        photo: editForm.photo,
      });
      setEditingId(null);
    } catch (error) {
      console.error("Failed to commit user parameters update context:", error);
    }
  };

  // Binary Safety Toggle Engine for system protection (Replaces destructive Delete action)
  const toggleBlockStatus = async (id: string, currentStatus: boolean) => {
    try {
      const userRef = doc(db, "users", id);
      await updateDoc(userRef, {
        isBlocked: !currentStatus,
        accountStatus: !currentStatus ? "Suspended" : "Active" // System level assignment syncing
      });
    } catch (error) {
      console.error("Failed to execute block status validation mutation:", error);
    }
  };

  // Dynamic Wallet Security Lockdown Controller Toggle
  const toggleWalletLock = async (id: string, currentLockState: boolean) => {
    try {
      const userRef = doc(db, "users", id);
      await updateDoc(userRef, {
        walletLocked: !currentLockState
      });
    } catch (error) {
      console.error("Failed to change account tracking infrastructure parameters:", error);
    }
  };

  // Live Concatenated Query Processing Core
  const filteredUsers = users.filter((user) => {
    const nameStr = user.name || "System User";
    const emailStr = user.email || "";
    const roleStr = user.role || "user";
    const shareStr = user.shareCode || "";
    return `${nameStr} ${emailStr} ${roleStr} ${shareStr}`
      .toLowerCase()
      .includes(search.toLowerCase());
  });

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[var(--card-color)] font-black text-sm uppercase tracking-widest text-[var(--primary-color)]">
        Syncing User Management Pipeline Engine...
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-[var(--primary-color)] p-4 text-[var(--button-text-color)]">
      {/* HEADER */}
      <div className="mb-6">
        <h1 className="text-3xl font-black">Users Manager</h1>
        <p className="mt-1 text-sm text-[var(--muted-text-color)]">Manage, monitor and block user parameters globally</p>
      </div>

      {/* Operational Telemetry Metric Status Cards Row */}
      <div className="grid grid-cols-2 gap-4 mb-6 md:grid-cols-4">
        <StatCard title="Total Users" value={stats.total.toLocaleString("en-IN")} icon={<Users size={22} />} color="bg-[var(--primary-color)]" />
        <StatCard title="Active MLM" value={stats.mlmActive.toLocaleString("en-IN")} icon={<UserCheck size={22} />} color="bg-[var(--primary-color)]" />
        <StatCard title="Blocked Users" value={stats.blocked.toLocaleString("en-IN")} icon={<UserX size={22} />} color="bg-[var(--danger-color)]" />
        <StatCard title="Total Referrals" value={stats.referrals.toLocaleString("en-IN")} icon={<Award size={22} />} color="bg-[var(--warning-color)]" />
      </div>

      {/* SEARCH HOOK CONTAINER */}
      <div className="mb-6 flex items-center gap-3 rounded-[24px] border border-[var(--border-color)]/10 bg-[var(--primary-color)] px-4 py-3">
        <Search size={20} className="text-[var(--muted-text-color)]" />
        <input
          type="text"
          placeholder="Search users by name, email, role, or referral code..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full bg-transparent outline-none placeholder:text-[var(--muted-text-color)] text-sm"
        />
      </div>

      {/* REALTIME USER CARDS FEED GRID */}
      <div className="space-y-5">
        {filteredUsers.map((user) => {
          const isUserEditing = editingId === user.id;

          return (
            <div
              key={user.id}
              className={`overflow-hidden rounded-[30px] border transition-all ${
                user.isBlocked ? "border-[var(--danger-color)]/30 bg-[var(--primary-color)]" : "border-[var(--border-color)]/10 bg-[var(--primary-color)]"
              }`}
            >
              {/* TOP PROFILE CONTROL ACTION BAR */}
              <div className="flex items-center justify-between border-b border-[var(--border-color)]/10 p-4">
                <div className="flex items-center gap-4">
                  {user.photo ? (
                    <img
                      src={user.photo}
                      alt={user.name}
                      className="h-16 w-16 rounded-full object-cover ring-2 ring-white/10"
                    />
                  ) : (
                    <div className="flex h-16 w-16 items-center justify-center rounded-full bg-[var(--primary-color)] font-black">
                      <User size={28} />
                    </div>
                  )}

                  <div>
                    <h2 className="text-lg font-black flex items-center gap-2">
                      {user.name || "Untitled User"}
                      {user.isBlocked && (
                        <span className="text-xs bg-[var(--danger-color)]/20 text-[var(--danger-color)] px-2.5 py-0.5 rounded-full font-bold">
                          BLOCKED
                        </span>
                      )}
                    </h2>
                    <p className="text-sm text-[var(--muted-text-color)]">{user.email || "No email mapping"}</p>
                  </div>
                </div>

                {/* CONTROL ACTION SYSTEMS */}
                <div className="flex items-center gap-2">
                  {/* Dynamic Wallet Lockdown Vector Toggle Button */}
                  <button
                    onClick={() => toggleWalletLock(user.id, !!user.walletLocked)}
                    className={`flex h-10 w-10 items-center justify-center rounded-xl transition ${
                      user.walletLocked
                        ? "bg-[var(--warning-color)]/20 text-[var(--warning-color)] hover:bg-[var(--warning-color)]/30"
                        : "bg-[var(--card-color)]/5 text-[var(--muted-text-color)] hover:bg-[var(--card-color)]/10"
                    }`}
                    title={user.walletLocked ? "Unlock Wallet" : "Lock Wallet"}
                  >
                    {user.walletLocked ? <Lock size={18} /> : <Unlock size={18} />}
                  </button>

                  {/* Binary State Soft Toggling Action Node */}
                  <button
                    onClick={() => toggleBlockStatus(user.id, !!user.isBlocked)}
                    className={`flex h-10 w-10 items-center justify-center rounded-xl transition ${
                      user.isBlocked
                        ? "bg-[var(--success-color)]/20 text-[var(--success-color)] hover:bg-[var(--success-color)]/30"
                        : "bg-[var(--danger-color)]/20 text-[var(--danger-color)] hover:bg-[var(--danger-color)]/30"
                    }`}
                    title={user.isBlocked ? "Unblock User" : "Block User"}
                  >
                    {user.isBlocked ? <ShieldCheck size={18} /> : <ShieldAlert size={18} />}
                  </button>
                </div>
              </div>

              {/* OPERATIONAL CARD WORKSPACE BODY */}
              <div className="p-4 space-y-5">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* NAME LAYER INTERFACE */}
                  <div>
                    <p className="mb-2 text-xs font-bold uppercase tracking-wider text-[var(--muted-text-color)]">User Name</p>
                    <input
                      type="text"
                      disabled={!isUserEditing}
                      value={isUserEditing ? editForm.name : user.name || ""}
                      onChange={(e) => setEditForm((p) => ({ ...p, name: e.target.value }))}
                      className="w-full rounded-2xl border border-[var(--border-color)]/5 bg-[var(--primary-color)] px-4 py-3 text-sm outline-none disabled:opacity-50 text-[var(--button-text-color)]"
                    />
                  </div>

                  {/* EMAIL LAYER INTERFACE (READ ONLY MATRIX APPLIED TO DEFEND AUTH PIPELINES) */}
                  <div>
                    <p className="mb-2 text-xs font-bold uppercase tracking-wider text-[var(--muted-text-color)]">Email Address (Auth Protected)</p>
                    <input
                      type="text"
                      disabled={true}
                      value={user.email || ""}
                      className="w-full rounded-2xl border border-[var(--border-color)]/5 bg-[var(--primary-color)] px-4 py-3 text-sm outline-none opacity-40 text-[var(--muted-text-color)] cursor-not-allowed"
                    />
                  </div>

                  {/* ROLE SELECTION INPUT DROPDOWN MAPPED */}
                  <div>
                    <p className="mb-2 text-xs font-bold uppercase tracking-wider text-[var(--muted-text-color)]">Role Node Privilege</p>
                    <select
                      disabled={!isUserEditing}
                      value={isUserEditing ? editForm.role : user.role || "user"}
                      onChange={(e) => setEditForm((p) => ({ ...p, role: e.target.value }))}
                      className="w-full rounded-2xl border border-[var(--border-color)]/5 bg-[var(--primary-color)] px-4 py-3 text-sm outline-none disabled:opacity-50 appearance-none text-[var(--button-text-color)] cursor-pointer"
                    >
                      <option value="user" className="bg-[var(--primary-color)]">User Node</option>
                      <option value="admin" className="bg-[var(--primary-color)]">Admin Node</option>
                    </select>
                  </div>

                  {/* PHOTO SCHEMA LAYER INTERFACE */}
                  <div>
                    <p className="mb-2 text-xs font-bold uppercase tracking-wider text-[var(--muted-text-color)]">Photo Dynamic URI Link</p>
                    <input
                      type="text"
                      disabled={!isUserEditing}
                      value={isUserEditing ? editForm.photo : user.photo || ""}
                      onChange={(e) => setEditForm((p) => ({ ...p, photo: e.target.value }))}
                      className="w-full rounded-2xl border border-[var(--border-color)]/5 bg-[var(--primary-color)] px-4 py-3 text-sm outline-none disabled:opacity-50 text-[var(--button-text-color)]"
                    />
                  </div>
                </div>

                {/* EDIT/SAVE BUTTON INTERFACES CONTROL */}
                <div className="flex justify-end pt-2">
                  {isUserEditing ? (
                    <button
                      onClick={() => saveUserChanges(user.id)}
                      className="flex items-center gap-2 rounded-xl bg-[var(--primary-color)] px-5 py-2.5 text-sm font-bold text-[var(--text-color)] transition hover:bg-[var(--primary-color)] active:scale-95"
                    >
                      <Save size={16} />
                      Save Changes
                    </button>
                  ) : (
                    <button
                      onClick={() => startEditing(user)}
                      className="rounded-xl border border-[var(--border-color)]/10 bg-[var(--card-color)]/5 px-5 py-2.5 text-sm font-bold transition hover:bg-[var(--card-color)]/10"
                    >
                      Edit Profile
                    </button>
                  )}
                </div>

                {/* ✅ 3. EXTRA CONFIGURATION INFO BOX Matrix (Rank, ShareCode, Account Status, Wallet Status) */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 bg-[var(--primary-color)]/40 p-4 rounded-2xl border border-[var(--border-color)]/5">
                  <div>
                    <p className="text-[10px] uppercase font-bold text-[var(--muted-text-color)] tracking-wider flex items-center gap-1">
                      <Award size={12} className="text-[var(--primary-color)]" /> Rank Node
                    </p>
                    <p className="text-sm font-black mt-1 text-[var(--primary-color)]">{user.rank || "Member"}</p>
                  </div>

                  <div>
                    <p className="text-[10px] uppercase font-bold text-[var(--muted-text-color)] tracking-wider flex items-center gap-1">
                      <QrCode size={12} className="text-[var(--primary-color)]" /> Referral Code
                    </p>
                    <p className="text-sm font-mono font-bold mt-1 text-[var(--primary-color)]">{user.shareCode || "UNASSIGNED"}</p>
                  </div>

                  <div>
                    <p className="text-[10px] uppercase font-bold text-[var(--muted-text-color)] tracking-wider flex items-center gap-1">
                      <Fingerprint size={12} className="text-[var(--primary-color)]" /> Account Status
                    </p>
                    <p className={`text-sm font-black mt-1 ${user.isBlocked ? "text-[var(--danger-color)]" : "text-[var(--success-color)]"}`}>
                      {user.accountStatus || (user.isBlocked ? "Suspended" : "Active")}
                    </p>
                  </div>

                  <div>
                    <p className="text-[10px] uppercase font-bold text-[var(--muted-text-color)] tracking-wider flex items-center gap-1">
                      <Lock size={12} className="text-[var(--warning-color)]" /> Wallet Matrix
                    </p>
                    <p className={`text-sm font-black mt-1 ${user.walletLocked ? "text-[var(--danger-color)]" : "text-[var(--success-color)]"}`}>
                      {user.walletLocked ? "Locked" : "Unlocked"}
                    </p>
                  </div>
                </div>

                {/* LIVE FINANCIAL & SYSTEM SNAPSHOTS PANEL */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 pt-2">
                  <div className="rounded-2xl border border-[var(--border-color)]/5 bg-[var(--primary-color)] p-4 flex items-center gap-3">
                    <Wallet size={18} className="text-[var(--warning-color)]" />
                    <div>
                      <p className="text-[10px] uppercase font-bold text-[var(--muted-text-color)] tracking-wider">Wallet Balance</p>
                      <p className="text-base font-black text-[var(--warning-color)]">₹{(user.walletBalance || 0).toLocaleString("en-IN")}</p>
                    </div>
                  </div>

                  <div className="rounded-2xl border border-[var(--border-color)]/5 bg-[var(--primary-color)] p-4 flex items-center gap-3">
                    <Network size={18} className="text-[var(--primary-color)]" />
                    <div>
                      <p className="text-[10px] uppercase font-bold text-[var(--muted-text-color)] tracking-wider">Total Referrals</p>
                      <p className="text-base font-black text-[var(--primary-color)]">{user.totalReferrals || 0} Members</p>
                    </div>
                  </div>

                  <div className="rounded-2xl border border-[var(--border-color)]/5 bg-[var(--primary-color)] p-4 flex items-center gap-3">
                    <Package size={18} className="text-[var(--primary-color)]" />
                    <div>
                      <p className="text-[10px] uppercase font-bold text-[var(--muted-text-color)] tracking-wider">Package Activation</p>
                      <span className={`text-xs font-black px-2 py-0.5 rounded ${user.joinedPackage ? "bg-[var(--success-color)]/20 text-[var(--success-color)]" : "bg-[var(--danger-color)]/20 text-[var(--danger-color)]"}`}>
                        {user.joinedPackage ? "ACTIVE" : "INACTIVE"}
                      </span>
                    </div>
                  </div>

                  <div className="rounded-2xl border border-[var(--border-color)]/5 bg-[var(--primary-color)] p-4 flex items-center gap-3">
                    <UserCheck size={18} className="text-[var(--primary-color)]" />
                    <div>
                      <p className="text-[10px] uppercase font-bold text-[var(--muted-text-color)] tracking-wider">MLM Matrix Status</p>
                      <span className={`text-xs font-black px-2 py-0.5 rounded ${user.mlmActive ? "bg-[var(--primary-color)]/20 text-[var(--primary-color)]" : "bg-[var(--card-color)]/10 text-[var(--muted-text-color)]"}`}>
                        {user.mlmActive ? "MATRIX RUNNING" : "NOT SIGNED"}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          );
        })}

        {filteredUsers.length === 0 && (
          <div className="py-12 text-center text-sm font-medium text-[var(--muted-text-color)]">
            No matching user documents found in collection array layout.
          </div>
        )}
      </div>
    </main>
  );
}

// Stats Card Internal Dynamic Renderer Component Block
function StatCard({
  title,
  value,
  icon,
  color,
}: {
  title: string;
  value: string;
  icon: React.ReactNode;
  color: string;
}) {
  return (
    <div className="rounded-[28px] border border-[var(--border-color)]/10 bg-[var(--primary-color)] p-5">
      <div className={`flex h-12 w-12 items-center justify-center rounded-2xl ${color} text-[var(--text-color)] mb-3`}>
        {icon}
      </div>
      <p className="text-xs text-[var(--muted-text-color)] font-bold uppercase tracking-wide">{title}</p>
      <h2 className="mt-1 text-2xl font-black">{value}</h2>
    </div>
  );
}
