"use client";

import AuditCard from "@/components/governance/AuditCard";

export default function LeaderboardGovernancePage() {
  const governanceScore = 58;

  return (
    <main className="min-h-screen bg-[#050505] p-6 text-white">

      <div className="mb-8">
        <h1 className="text-4xl font-black">
          Leaderboard Governance Audit
        </h1>

        <p className="mt-2 text-gray-400">
          Audit Report for src/app/mlm/leaderboard/page.tsx
        </p>
      </div>

      <div className="mb-8 rounded-3xl border border-white/10 bg-[#111111] p-6">

        <p className="text-sm text-gray-400">
          Governance Score
        </p>

        <h2 className="mt-2 text-6xl font-black text-red-400">
          {governanceScore}/100
        </h2>

        <p className="mt-3 text-red-400">
          Production Ready: NO
        </p>

      </div>

      <div className="mb-8 grid gap-4 md:grid-cols-4">

        <div className="rounded-2xl bg-green-500/10 p-5">
          <p className="text-sm text-gray-400">Connected</p>
          <h3 className="text-3xl font-black text-green-400">10</h3>
        </div>

        <div className="rounded-2xl bg-red-500/10 p-5">
          <p className="text-sm text-gray-400">Missing</p>
          <h3 className="text-3xl font-black text-red-400">14</h3>
        </div>

        <div className="rounded-2xl bg-yellow-500/10 p-5">
          <p className="text-sm text-gray-400">Warnings</p>
          <h3 className="text-3xl font-black text-yellow-400">8</h3>
        </div>

        <div className="rounded-2xl bg-pink-500/10 p-5">
          <p className="text-sm text-gray-400">Critical</p>
          <h3 className="text-3xl font-black text-pink-400">3</h3>
        </div>

      </div>

      <div className="grid gap-6 md:grid-cols-2">

        <AuditCard
          title="Data Source Audit"
          status="FAIL"
          issues={[
            "Firestore Not Connected",
            "Leaderboard Hardcoded",
            "No Real-Time Data",
            "Production Data Missing"
          ]}
        />

        <AuditCard
          title="MLM Audit"
          status="FAIL"
          issues={[
            "Rank Calculation Missing",
            "Income Ranking Missing",
            "Team Ranking Missing",
            "Dynamic MLM Engine Missing"
          ]}
        />

        <AuditCard
          title="Security Audit"
          status="WARNING"
          issues={[
            "User Names Hardcoded",
            "Income Hardcoded",
            "Public Data Exposure Risk",
            "No Access Rules Validation"
          ]}
        />

        <AuditCard
          title="Leaderboard Logic Audit"
          status="FAIL"
          issues={[
            "Top 3 Hardcoded",
            "Rank List Hardcoded",
            "No Sorting Engine",
            "No Ranking Algorithm"
          ]}
        />

        <AuditCard
          title="Theme Audit"
          status="WARNING"
          issues={[
            "Yellow Theme Hardcoded",
            "No Theme Context",
            "Admin Theme Missing",
            "Brand Config Missing"
          ]}
        />

        <AuditCard
          title="Performance Audit"
          status="PASS"
          issues={[
            "Fast Rendering",
            "No Expensive Queries",
            "Lightweight UI",
            "Good Mobile Performance"
          ]}
        />

        <AuditCard
          title="Admin Control Audit"
          status="FAIL"
          issues={[
            "Leaderboard Settings Missing",
            "Admin Ranking Rules Missing",
            "Reward Rules Missing",
            "Visibility Controls Missing"
          ]}
        />

        <AuditCard
          title="Analytics Audit"
          status="FAIL"
          issues={[
            "No Leaderboard Analytics",
            "No Performance Tracking",
            "No Growth Metrics",
            "No Trend Analysis"
          ]}
        />

        <AuditCard
          title="Architecture Audit"
          status="WARNING"
          issues={[
            "UI Good",
            "Backend Missing",
            "Static Demo Data",
            "Not Enterprise Ready"
          ]}
        />

        <AuditCard
          title="Enterprise Audit"
          status="FAIL"
          issues={[
            "No Firestore Query",
            "No Pagination",
            "No Search",
            "No Rank Engine"
          ]}
        />

      </div>

      <div className="mt-8 rounded-3xl border border-white/10 bg-[#111111] p-6">

        <h2 className="mb-4 text-2xl font-black">
          Critical Missing Features
        </h2>

        <div className="grid gap-3 md:grid-cols-2">

          {[
            "Realtime Firestore Leaderboard",
            "Dynamic Rank Calculation",
            "Top Earners Query Engine",
            "Team Size Ranking",
            "Monthly Ranking",
            "Weekly Ranking",
            "Search Member",
            "Pagination",
            "Admin Ranking Control",
            "Reward Distribution Rules",
            "Leaderboard Analytics",
            "Trend Analysis",
            "Growth Tracking",
            "Achievement System",
            "Top Performer Badges",
            "Governance Logging"
          ].map((item) => (
            <div
              key={item}
              className="rounded-xl bg-red-500/10 p-3 text-red-300"
            >
              {item}
            </div>
          ))}

        </div>

      </div>

    </main>
  );
}
