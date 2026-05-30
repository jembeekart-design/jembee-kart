"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

import { onAuthStateChanged } from "firebase/auth";
import {
  collection,
  query,
  where,
  getDocs,
} from "firebase/firestore";

import { auth, db } from "@/firebase/config";

import {
  ArrowLeft,
  Crown,
  Users,
  UserPlus2,
  Mail,
  Calendar,
  Shield,
} from "lucide-react";

export default function MLMNetworkPage() {
  const [loading, setLoading] = useState(true);
  const [activeLevel, setActiveLevel] = useState<number>(1);
  
  /* ======================================================
  FUTURE PROOF STATE: 100% DYNAMIC AND SCALABLE FOR 10+ LEVELS
  ====================================================== */
  const [networkLevels, setNetworkLevels] = useState<Record<number, any[]>>({});
  
  // Core counter matrices
  const [directCount, setDirectCount] = useState(0);
  const [totalTeamCount, setTotalTeamCount] = useState(0);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (user) => {
      try {
        setLoading(true);
        if (!user) {
          setLoading(false);
          return;
        }

        // Fresh multi-level operational mapping ledger
        const localLevels: Record<number, any[]> = {
          1: [],
          2: [],
          3: [],
        };

        /* ======================================================
        LAYER 1: FETCH LEVEL 1 (DIRECT REFERRALS)
        ====================================================== */
        const q1 = query(
          collection(db, "users"),
          where("sponsorId", "==", user.uid)
        );
        const snap1 = await getDocs(q1);
        
        const l1Members = snap1.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        })) as any[];
        
        localLevels[1] = l1Members;
        setDirectCount(l1Members.length);

        /* ======================================================
        LAYER 2: FETCH LEVEL 2 (DIRECTS OF LEVEL 1)
        ====================================================== */
        if (l1Members.length > 0) {
          const l1Uids = l1Members.map((m) => m.uid);
          const chunks = [];
          
          for (let i = 0; i < l1Uids.length; i += 10) {
            chunks.push(l1Uids.slice(i, i + 10));
          }

          for (const chunk of chunks) {
            const q2 = query(
              collection(db, "users"),
              where("sponsorId", "in", chunk)
            );
            const snap2 = await getDocs(q2);
            const mappedL2 = snap2.docs.map((doc) => ({
              id: doc.id,
              ...doc.data(),
            })) as any[];
            localLevels[2] = [...localLevels[2], ...mappedL2];
          }

          /* ======================================================
          LAYER 3: FETCH LEVEL 3 (DIRECTS OF LEVEL 2)
          ====================================================== */
          if (localLevels[2].length > 0) {
            const l2Uids = localLevels[2].map((m) => m.uid);
            const l2Chunks = [];
            
            for (let i = 0; i < l2Uids.length; i += 10) {
              l2Chunks.push(l2Uids.slice(i, i + 10));
            }

            for (const chunk of l2Chunks) {
              const q3 = query(
                collection(db, "users"),
                where("sponsorId", "in", chunk)
              );
              const snap3 = await getDocs(q3);
              const mappedL3 = snap3.docs.map((doc) => ({
                id: doc.id,
                ...doc.data(),
              })) as any[];
              localLevels[3] = [...localLevels[3], ...mappedL3];
            }
          }
        }

        // Automatically saves records (Even if some levels are empty, Object.keys handles safely)
        setNetworkLevels(localLevels);
        
        // Comprehensive matrix count calculation
        const overallCount = Object.values(localLevels).reduce((acc, curr) => acc + curr.length, 0);
        setTotalTeamCount(overallCount);

      } catch (error) {
        console.error("Multi-level Network Record Processing Error:", error);
      } finally {
        setLoading(false);
      }
    });

    return () => unsub();
  }, []);

  const currentLevelMembers = networkLevels[activeLevel] || [];

  return (
    <main className="min-h-screen bg-[#f6f7fb] pb-20">
      
      {/* HEADER WITH UPDATED BACK ROUTE */}
      <div className="sticky top-0 z-50 bg-white px-4 py-3 shadow-sm">
        <div className="flex items-center gap-3">
          <Link
            href="/mlm/dashboard"
            className="flex h-10 w-10 items-center justify-center rounded-full bg-violet-100 text-violet-700"
          >
            <ArrowLeft size={20} />
          </Link>
          <div>
            <h1 className="text-[24px] font-black text-violet-700">MLM Network</h1>
            <p className="text-[11px] text-gray-500">Scalable Generation Model Infrastructure</p>
          </div>
        </div>
      </div>

      {/* HERO CONTAINER */}
      <section className="px-4 pt-5">
        <div className="overflow-hidden rounded-[30px] bg-gradient-to-br from-violet-700 via-fuchsia-600 to-orange-500 p-5 text-white shadow-xl">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-white/20">
            <Crown size={34} />
          </div>
          <h2 className="mt-5 text-[30px] font-black leading-tight">
            Total Network Tree
            <br />
            {totalTeamCount} Members 🚀
          </h2>
          <p className="mt-3 text-[13px] leading-6 text-white/90">
            Aapka level structure dynamic keys format par deployed hai. Isse structural deep nodes traversal handle karna 100% stable ho jata hai.
          </p>
        </div>
      </section>

      {/* ANALYTICS SNAPSHOTS */}
      <section className="mt-6 px-4">
        <div className="grid grid-cols-2 gap-3">
          <div className="rounded-2xl bg-white p-4 shadow-sm border border-gray-100">
            <Users size={28} className="text-violet-700" />
            <h3 className="mt-3 text-[24px] font-black text-gray-900">{directCount}</h3>
            <p className="text-[12px] font-bold text-gray-400">Direct Referrals (L1)</p>
          </div>

          <div className="rounded-2xl bg-white p-4 shadow-sm border border-gray-100">
            <UserPlus2 size={28} className="text-green-600" />
            <h3 className="mt-3 text-[24px] font-black text-gray-900">{totalTeamCount}</h3>
            <p className="text-[12px] font-bold text-gray-400">Total Generation Downline</p>
          </div>
        </div>
      </section>

      {/* DYNAMIC AUTO-GENERATING LEVEL TABS */}
      <section className="mt-6 px-4">
        <div className="flex bg-gray-200/60 p-1.5 rounded-2xl gap-1 overflow-x-auto scrollbar-none">
          {Object.keys(networkLevels).map((levelStr) => {
            const lvl = Number(levelStr);
            return (
              <button
                key={lvl}
                onClick={() => setActiveLevel(lvl)}
                className={`flex-1 min-w-[75px] py-3 text-center text-xs font-black rounded-xl transition-all ${
                  activeLevel === lvl
                    ? "bg-gradient-to-r from-violet-600 to-indigo-600 text-white shadow-md"
                    : "text-gray-500 hover:text-gray-900"
                }`}
              >
                Level {lvl} ({networkLevels[lvl]?.length || 0})
              </button>
            );
          })}
        </div>
      </section>

      {/* DOWNLINE NODE PANEL GRID */}
      <section className="mt-4 px-4">
        <div className="rounded-[28px] bg-white p-5 shadow-sm border border-gray-100">
          <h2 className="text-[22px] font-black text-gray-900 mb-2">
            Downline Matrix - Level {activeLevel}
          </h2>
          <p className="text-xs text-gray-400 font-medium mb-4">
            {activeLevel === 1 && "Directly sponsored structural network accounts."}
            {activeLevel === 2 && "Indirect accounts generated via Level 1 pipeline nodes."}
            {activeLevel === 3 && "Passive generation tree elements from Level 2 team nodes."}
          </p>

          {loading ? (
            <div className="mt-6 py-8 text-center text-sm font-bold text-gray-400 animate-pulse">
              Compiling Record Node Levels...
            </div>
          ) : currentLevelMembers.length === 0 ? (
            <div className="mt-6 py-8 text-center text-sm font-semibold text-gray-400 bg-gray-50 rounded-2xl border-2 border-dashed border-gray-100">
              Level {activeLevel} downline pipeline me koi active member nahi mila.
            </div>
          ) : (
            <div className="space-y-4">
              {currentLevelMembers.map((member) => (
                <div
                  key={member.id}
                  className="rounded-2xl border border-gray-100 bg-gray-50/50 p-4 hover:border-violet-200 transition-all"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="space-y-1.5 flex-1">
                      <div className="flex items-center gap-2">
                        <h3 className="text-[15px] font-black text-gray-900">
                          {member.name || "JembeeKart User"}
                        </h3>
                        <span className="flex items-center gap-1 bg-indigo-50 text-indigo-600 text-[10px] font-black px-2 py-0.5 rounded-full">
                          <Shield size={10} />
                          {member.rank || "Member"}
                        </span>
                      </div>

                      {/* DATA RECEPTACLE INFO */}
                      <div className="flex flex-col gap-1 text-[11px] font-medium text-gray-500">
                        <p className="flex items-center gap-1.5">
                          <Mail size={12} className="text-gray-400" />
                          {member.email || "No email linked"}
                        </p>
                        <p className="flex items-center gap-1.5">
                          <Calendar size={12} className="text-gray-400" />
                          Joined: {member.createdAt ? new Date(member.createdAt).toLocaleDateString() : "N/A"}
                        </p>
                      </div>

                      {/* STRUCTURAL VOLUME TRACKERS */}
                      <div className="mt-2 pt-2 border-t border-gray-200/60 grid grid-cols-3 gap-2 bg-white p-2 rounded-xl border border-gray-100">
                        <div>
                          <p className="text-[9px] font-bold text-gray-400 uppercase">Direct Biz</p>
                          <p className="text-xs font-black text-gray-800">₹{member.directBusiness || 0}</p>
                        </div>
                        <div>
                          <p className="text-[9px] font-bold text-gray-400 uppercase">Team Biz</p>
                          <p className="text-xs font-black text-indigo-600">₹{member.teamBusiness || 0}</p>
                        </div>
                        <div>
                          <p className="text-[9px] font-bold text-gray-400 uppercase">Lifetime Biz</p>
                          <p className="text-xs font-black text-emerald-600">₹{member.lifetimeBusiness || 0}</p>
                        </div>
                      </div>

                      <p className="text-[11px] font-black text-violet-600 tracking-wider pt-1">
                        Code: {member.referralCode || "N/A"}
                      </p>
                    </div>

                    {/* REVENUE STATUS CARDS */}
                    <div className="flex items-center justify-between sm:flex-col sm:justify-center sm:items-end border-t sm:border-0 border-gray-100 pt-2 sm:pt-0 gap-1">
                      <span className="text-[10px] sm:hidden text-gray-400 font-bold">Total Earnings:</span>
                      <div className="rounded-full bg-violet-100 px-3 py-1 text-[11px] font-black text-violet-700">
                        ₹{member.totalIncome || 0}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* STANDARD BASELINE PAYOUT INFO CONFIG */}
      <section className="mt-6 px-4">
        <div className="rounded-[28px] bg-white p-5 shadow-sm border border-gray-100">
          <h2 className="text-[22px] font-black text-gray-900">Distribution Levels Configuration</h2>
          <div className="mt-4 space-y-3">
            <div className="flex items-center justify-between rounded-2xl bg-violet-50 p-4">
              <div>
                <h3 className="text-[15px] font-black text-violet-900">Level 1</h3>
                <p className="text-[11px] font-semibold text-violet-600/80">Direct Joining Profit Tier</p>
              </div>
              <div className="rounded-full bg-violet-700 px-3 py-1 text-[11px] font-black text-white">10%</div>
            </div>

            <div className="flex items-center justify-between rounded-2xl bg-pink-50 p-4">
              <div>
                <h3 className="text-[15px] font-black text-pink-900">Level 2</h3>
                <p className="text-[11px] font-semibold text-pink-600/80">Indirect Team Registration Income</p>
              </div>
              <div className="rounded-full bg-pink-600 px-3 py-1 text-[11px] font-black text-white">5%</div>
            </div>

            <div className="flex items-center justify-between rounded-2xl bg-orange-50 p-4">
              <div>
                <h3 className="text-[15px] font-black text-orange-900">Level 3</h3>
                <p className="text-[11px] font-semibold text-orange-600/80">Passive Generation Team Stream</p>
              </div>
              <div className="rounded-full bg-orange-500 px-3 py-1 text-[11px] font-black text-white">2%</div>
            </div>
          </div>
        </div>
      </section>

    </main>
  );
}
