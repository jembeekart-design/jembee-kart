"use client";

import AuditCard from "@/components/governance/AuditCard";

export default function EarningsGovernancePage() {
  const governanceScore = 58;

  return (
    <main className="min-h-screen bg-[#050505] p-6 text-white">

      <div className="mb-8">
        <h1 className="text-4xl font-black">
          Earnings Governance Audit
        </h1>

        <p className="mt-2 text-gray-400">
          Audit Report for src/app/mlm/earnings/page.tsx
        </p>
      </div>

      {/* SCORE */}

      <div className="mb-8 rounded-3xl border border-white/10 bg-[#111111] p-6">

        <p className="text-sm text-gray-400">
          Governance Score
        </p>

        <h2 className="mt-2 text-6xl font-black text-yellow-400">
          {governanceScore}/100
        </h2>

        <p className="mt-3 text-yellow-400">
          Production Ready: PARTIAL
        </p>

      </div>

      {/* SUMMARY */}

      <div className="mb-8 grid gap-4 md:grid-cols-4">

        <div className="rounded-2xl bg-green-500/10 p-5">
          <p className="text-sm text-gray-400">Connected</p>
          <h3 className="text-3xl font-black text-green-400">11</h3>
        </div>

        <div className="rounded-2xl bg-red-500/10 p-5">
          <p className="text-sm text-gray-400">Missing</p>
          <h3 className="text-3xl font-black text-red-400">15</h3>
        </div>

        <div className="rounded-2xl bg-yellow-500/10 p-5">
          <p className="text-sm text-gray-400">Warnings</p>
          <h3 className="text-3xl font-black text-yellow-400">8</h3>
        </div>

        <div className="rounded-2xl bg-pink-500/10 p-5">
          <p className="text-sm text-gray-400">Critical</p>
          <h3 className="text-3xl font-black text-pink-400">1</h3>
        </div>

      </div>

      <div className="grid gap-6 md:grid-cols-2">

        <AuditCard
          title="Route Audit"
          status="PASS"
          issues={[
            "Page Route Found",
            "Navigation Working",
            "Back Button Connected",
            "Page Rendering Working"
          ]}
        />

        <AuditCard
          title="UI Audit"
          status="PASS"
          issues={[
            "Dashboard Cards Visible",
            "History Section Working",
            "Growth Chart Visible",
            "Responsive Layout Present"
          ]}
        />

        <AuditCard
          title="Firestore Audit"
          status="CRITICAL"
          issues={[
            "No Firestore Connection",
            "No Realtime Earnings Data",
            "Static Demo Data Used",
            "Production Data Missing"
          ]}
        />

        <AuditCard
          title="Income Audit"
          status="FAIL"
          issues={[
            "Total Earnings Hardcoded",
            "Today Income Hardcoded",
            "Monthly Income Hardcoded",
            "Referral Bonus Hardcoded"
          ]}
        />

        <AuditCard
          title="History Audit"
          status="FAIL"
          issues={[
            "History Array Hardcoded",
            "No Transaction Collection",
            "No Income Logs",
            "No Pagination"
          ]}
        />

        <AuditCard
          title="MLM Audit"
          status="FAIL"
          issues={[
            "Commission Data Missing",
            "Level Income Missing",
            "Rank Income Missing",
            "Bonus Breakdown Missing"
          ]}
        />

        <AuditCard
          title="Theme Audit"
          status="WARNING"
          issues={[
            "Hardcoded Colors Found",
            "Theme Context Missing",
            "Admin Theme Missing",
            "Dynamic Branding Missing"
          ]}
        />

        <AuditCard
          title="Admin Control Audit"
          status="FAIL"
          issues={[
            "Income Cards Hardcoded",
            "Growth Graph Hardcoded",
            "History Hardcoded",
            "Firestore Config Missing"
          ]}
        />

        <AuditCard
          title="Analytics Audit"
          status="WARNING"
          issues={[
            "Growth UI Present",
            "Real Analytics Missing",
            "Trend Engine Missing",
            "Income Forecast Missing"
          ]}
        />

        <AuditCard
          title="Security Audit"
          status="PASS"
          issues={[
            "No Sensitive Operations",
            "No Direct Wallet Mutation",
            "Read Only Interface",
            "Safe Client Rendering"
          ]}
        />

      </div>

      {/* MISSING FEATURES */}

      <div className="mt-8 rounded-3xl border border-white/10 bg-[#111111] p-6">

        <h2 className="mb-4 text-2xl font-black">
          Missing Features
        </h2>

        <div className="grid gap-3 md:grid-cols-2">

          {[
            "Realtime Earnings Data",
            "Firestore Income Collection",
            "Commission Breakdown",
            "Level Income Breakdown",
            "Rank Income Breakdown",
            "Bonus Income Breakdown",
            "Income History Collection",
            "Income Export PDF",
            "Date Filters",
            "Monthly Reports",
            "Yearly Reports",
            "Income Analytics",
            "Income Forecast Engine",
            "Theme Engine Integration",
            "Admin Controlled Dashboard"
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
