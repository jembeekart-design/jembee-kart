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
  Briefcase,
} from "lucide-react";

export default function MLMNetworkPage() {
  const [loading, setLoading] = useState(true);
  const [activeLevel, setActiveLevel] = useState<number>(1);
  
  /* ======================================================
  CONTROLLED LEVEL STATE: RESTRICTED TO 3 LEVELS FOR NETWORK SNAPSHOT
  ====================================================== */
  const [networkLevels, setNetworkLevels] = useState<Record<number, any[]>>({});
  
  // Core counter matrices
  const [directCount, setDirectCount] = useState(0);
  const [totalTeamCount, setTotalTeamCount] = useState(0);
  
  // Total Business Volume Tracker State
  const [totalBusiness, setTotalBusiness] = useState(0);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (user) => {
      try {
        setLoading(true);
        if (!user) {
          setLoading(false);
          return;
        }

        /* ======================================================
        DYNAMIC 3-LEVEL INITIALIZATION
        ====================================================== */
        const MAX_LEVEL = 3;
        const localLevels: Record<number, any[]> = {};

        for (let i = 1; i <= MAX_LEVEL; i++) {
          localLevels[i] = [];
        }

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
        SAFE PLATFORM OPTIMIZATION: Restricted to 10 max element chunks
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
          SAFE PLATFORM OPTIMIZATION: Restricted to 10 max element chunks
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

        // Setting structural level records state
        setNetworkLevels(localLevels);

        /* ======================================================
        DYNAMIC ACTIVE LEVEL SELECTION LOGIC
        ====================================================== */
        const availableLevels = Object.keys(localLevels)
          .map(Number)
          .filter((lvl) => localLevels[lvl].length > 0);

        if (availableLevels.length > 0) {
          setActiveLevel(availableLevels[0]);
        }
        
        // Comprehensive matrix count calculation
        const overallCount = Object.values(localLevels).reduce((acc, curr) => acc + curr.length, 0);
        setTotalTeamCount(overallCount);

        /* ======================================================
        COMPUTING TOTAL BUSINESS VOLUME PIPELINE
        ====================================================== */
        const business = Object.values(localLevels)
          .flat()
          .reduce(
            (sum: number, member: any) => sum + (member.lifetimeBusiness || 0),
            0
          );

        setTotalBusiness(business);

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
            <p className="text-[11px] text-gray-500">3-Tier Generation Snapshot Model</p>
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
            Network Summary
            <br />
            {totalTeamCount} Members 🚀
          </h2>
          
          {/* REAL-TIME TOTAL TEAM BUSINESS COUNTER DISPLAY */}
          <div className="mt-4 flex items-center gap-2 bg-white/10 backdrop-blur-md rounded-2xl p-3 border border-white/20">
            <Briefcase size={20} className="text-orange-200" />
            <div>
              <p className="text-[10px] font-bold uppercase text-white/70 tracking-wider">Total Team Business</p>
              <p className="text-xl font-black">₹{totalBusiness}</p>
            </div>
          </div>
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
            <p className="text-[12px] font-bold text-gray-400">Total 3-Level Team</p>
          </div>
        </div>
      </section>

      {/* HIGH-UX FILTERED AUTO-GENERATING LEVEL TABS */}
      <section className="mt-6 px-4">
        {Object.keys(networkLevels).filter((level) => networkLevels[Number(level)]?.length > 0).length === 0 ? (
          <div className="text-xs font-bold text-gray-400 p-2 text-center bg-gray-100 rounded-xl">
            No active levels to track
          </div>
        ) : (
          <div className="flex bg-gray-200/60 p-1.5 rounded-2xl gap-1 overflow-x-auto scrollbar-none">
            {Object.keys(networkLevels)
              .filter((level) => networkLevels[Number(level)]?.length > 0)
              .map((levelStr) => {
                const lvl = Number(levelStr);
                return (
                  <button
                    key={lvl}
                    onClick={() => setActiveLevel(lvl)}
                    className={`flex-1 min-w-[85px] py-3 text-center text-xs font-black rounded-xl transition-all ${
                      activeLevel === lvl
                        ? "bg-gradient-to-r from-violet-600 to-indigo-600 text-white shadow-md"
                        : "text-gray-500 hover:text-gray-900"
                    }`}
                  >
                    Lvl {lvl} ({networkLevels[lvl]?.length || 0})
                  </button>
                );
              })}
          </div>
        )}
      </section>

      {/* DOWNLINE NODE PANEL GRID */}
      <section className="mt-4 px-4">
        <div className="rounded-[28px] bg-white p-5 shadow-sm border border-gray-100">
          <h2 className="text-[22px] font-black text-gray-900 mb-2">
            Downline Matrix - Level {activeLevel}
          </h2>
          <p className="text-xs text-gray-400 font-medium mb-4">
            {activeLevel === 1 && "Directly sponsored structural network accounts."}
            {activeLevel > 1 && `Indirect accounts generated via Level ${activeLevel - 1} pipeline nodes.`}
          </p>

          {loading ? (
            <div className="mt-6 py-8 text-center text-sm font-bold text-gray-400 animate-pulse">
              Compiling Record Node Levels...
            </div>
          ) : currentLevelMembers.length === 0 ? (
            <div className="mt-6 py-8 text-center text-sm font-semibold text-gray-400 bg-gray-50 rounded-2xl border-2 border-dashed border-gray-100">
              Is level pipeline me filhal koi active member nahi hai.
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

    </main>
  );
}
