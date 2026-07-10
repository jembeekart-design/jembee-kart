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
    <main className="min-h-screen bg-[var(--primary-color)] pb-20">
      
      {/* HEADER WITH UPDATED BACK ROUTE */}
      <div className="sticky top-0 z-50 bg-[var(--card-color)] px-4 py-3 shadow-sm">
        <div className="flex items-center gap-3">
          <Link
            href="/mlm/dashboard"
            className="flex h-10 w-10 items-center justify-center rounded-full bg-[var(--primary-color)] text-[var(--primary-color)]"
          >
            <ArrowLeft size={20} />
          </Link>
          <div>
            <h1 className="text-[24px] font-black text-[var(--primary-color)]">MLM Network</h1>
            <p className="text-[11px] text-[var(--muted-text-color)]">3-Tier Generation Snapshot Model</p>
          </div>
        </div>
      </div>

      {/* HERO CONTAINER */}
      <section className="px-4 pt-5">
        <div className="overflow-hidden rounded-[30px] bg-gradient-to-br from-[var(--primary-color)] via-[var(--primary-color)] to-[var(--primary-color)] p-5 text-[var(--button-text-color)] shadow-xl">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-[var(--card-color)]/20">
            <Crown size={34} />
          </div>
          <h2 className="mt-5 text-[30px] font-black leading-tight">
            Network Summary
            <br />
            {totalTeamCount} Members 🚀
          </h2>
          
          {/* REAL-TIME TOTAL TEAM BUSINESS COUNTER DISPLAY */}
          <div className="mt-4 flex items-center gap-2 bg-[var(--card-color)]/10 backdrop-blur-md rounded-2xl p-3 border border-[var(--border-color)]/20">
            <Briefcase size={20} className="text-[var(--warning-color)]" />
            <div>
              <p className="text-[10px] font-bold uppercase text-[var(--button-text-color)]/70 tracking-wider">Total Team Business</p>
              <p className="text-xl font-black">₹{totalBusiness}</p>
            </div>
          </div>
        </div>
      </section>

      {/* ANALYTICS SNAPSHOTS */}
      <section className="mt-6 px-4">
        <div className="grid grid-cols-2 gap-3">
          <div className="rounded-2xl bg-[var(--card-color)] p-4 shadow-sm border border-[var(--border-color)]">
            <Users size={28} className="text-[var(--primary-color)]" />
            <h3 className="mt-3 text-[24px] font-black text-[var(--text-color)]">{directCount}</h3>
            <p className="text-[12px] font-bold text-[var(--muted-text-color)]">Direct Referrals (L1)</p>
          </div>

          <div className="rounded-2xl bg-[var(--card-color)] p-4 shadow-sm border border-[var(--border-color)]">
            <UserPlus2 size={28} className="text-[var(--success-color)]" />
            <h3 className="mt-3 text-[24px] font-black text-[var(--text-color)]">{totalTeamCount}</h3>
            <p className="text-[12px] font-bold text-[var(--muted-text-color)]">Total 3-Level Team</p>
          </div>
        </div>
      </section>

      {/* HIGH-UX FILTERED AUTO-GENERATING LEVEL TABS */}
      <section className="mt-6 px-4">
        {Object.keys(networkLevels).filter((level) => networkLevels[Number(level)]?.length > 0).length === 0 ? (
          <div className="text-xs font-bold text-[var(--muted-text-color)] p-2 text-center bg-[var(--background-color)] rounded-xl">
            No active levels to track
          </div>
        ) : (
          <div className="flex bg-[var(--card-color)]/60 p-1.5 rounded-2xl gap-1 overflow-x-auto scrollbar-none">
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
                        ? "bg-gradient-to-r from-[var(--primary-color)] to-[var(--primary-color)] text-[var(--button-text-color)] shadow-md"
                        : "text-[var(--muted-text-color)] hover:text-[var(--text-color)]"
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
        <div className="rounded-[28px] bg-[var(--card-color)] p-5 shadow-sm border border-[var(--border-color)]">
          <h2 className="text-[22px] font-black text-[var(--text-color)] mb-2">
            Downline Matrix - Level {activeLevel}
          </h2>
          <p className="text-xs text-[var(--muted-text-color)] font-medium mb-4">
            {activeLevel === 1 && "Directly sponsored structural network accounts."}
            {activeLevel > 1 && `Indirect accounts generated via Level ${activeLevel - 1} pipeline nodes.`}
          </p>

          {loading ? (
            <div className="mt-6 py-8 text-center text-sm font-bold text-[var(--muted-text-color)] animate-pulse">
              Compiling Record Node Levels...
            </div>
          ) : currentLevelMembers.length === 0 ? (
            <div className="mt-6 py-8 text-center text-sm font-semibold text-[var(--muted-text-color)] bg-[var(--background-color)] rounded-2xl border-2 border-dashed border-[var(--border-color)]">
              Is level pipeline me filhal koi active member nahi hai.
            </div>
          ) : (
            <div className="space-y-4">
              {currentLevelMembers.map((member) => (
                <div
                  key={member.id}
                  className="rounded-2xl border border-[var(--border-color)] bg-[var(--background-color)]/50 p-4 hover:border-[var(--primary-color)] transition-all"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="space-y-1.5 flex-1">
                      <div className="flex items-center gap-2">
                        <h3 className="text-[15px] font-black text-[var(--text-color)]">
                          {member.name || "JembeeKart User"}
                        </h3>
                        <span className="flex items-center gap-1 bg-[var(--primary-color)] text-[var(--primary-color)] text-[10px] font-black px-2 py-0.5 rounded-full">
                          <Shield size={10} />
                          {member.rank || "Member"}
                        </span>
                      </div>

                      {/* DATA RECEPTACLE INFO */}
                      <div className="flex flex-col gap-1 text-[11px] font-medium text-[var(--muted-text-color)]">
                        <p className="flex items-center gap-1.5">
                          <Mail size={12} className="text-[var(--muted-text-color)]" />
                          {member.email || "No email linked"}
                        </p>
                        <p className="flex items-center gap-1.5">
                          <Calendar size={12} className="text-[var(--muted-text-color)]" />
                          Joined: {member.createdAt ? new Date(member.createdAt).toLocaleDateString() : "N/A"}
                        </p>
                      </div>

                      {/* STRUCTURAL VOLUME TRACKERS */}
                      <div className="mt-2 pt-2 border-t border-[var(--border-color)]/60 grid grid-cols-3 gap-2 bg-[var(--card-color)] p-2 rounded-xl border border-[var(--border-color)]">
                        <div>
                          <p className="text-[9px] font-bold text-[var(--muted-text-color)] uppercase">Direct Biz</p>
                          <p className="text-xs font-black text-[var(--text-color)]">₹{member.directBusiness || 0}</p>
                        </div>
                        <div>
                          <p className="text-[9px] font-bold text-[var(--muted-text-color)] uppercase">Team Biz</p>
                          <p className="text-xs font-black text-[var(--primary-color)]">₹{member.teamBusiness || 0}</p>
                        </div>
                        <div>
                          <p className="text-[9px] font-bold text-[var(--muted-text-color)] uppercase">Lifetime Biz</p>
                          <p className="text-xs font-black text-[var(--success-color)]">₹{member.lifetimeBusiness || 0}</p>
                        </div>
                      </div>

                      <p className="text-[11px] font-black text-[var(--primary-color)] tracking-wider pt-1">
                        Code: {member.referralCode || "N/A"}
                      </p>
                    </div>

                    {/* REVENUE STATUS CARDS */}
                    <div className="flex items-center justify-between sm:flex-col sm:justify-center sm:items-end border-t sm:border-0 border-[var(--border-color)] pt-2 sm:pt-0 gap-1">
                      <span className="text-[10px] sm:hidden text-[var(--muted-text-color)] font-bold">Total Earnings:</span>
                      <div className="rounded-full bg-[var(--primary-color)] px-3 py-1 text-[11px] font-black text-[var(--primary-color)]">
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
