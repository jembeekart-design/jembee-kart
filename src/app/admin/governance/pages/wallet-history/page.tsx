"use client";

import AuditCard from "@/components/governance/AuditCard";

export default function WalletHistoryGovernancePage() {
  const governanceScore = 76;

  return (
    <main className="min-h-screen bg-[#050505] p-6 text-white">

      <div className="mb-8">
        <h1 className="text-4xl font-black">
          Wallet History Governance Audit
        </h1>

        <p className="mt-2 text-gray-400">
          Audit Report for src/app/mlm/wallet/history/page.tsx
        </p>
      </div>

      {/* SCORE */}

      <div className="mb-8 rounded-3xl border border-white/10 bg-[#111111] p-6">
        <p className="text-sm text-gray-400">
          Governance Score
        </p>

        <h2 className="mt-2 text-6xl font-black text-green-400">
          {governanceScore}/100
        </h2>

        <p className="mt-3 text-green-400">
          Production Ready: PARTIAL
        </p>
      </div>

      {/* SUMMARY */}

      <div className="mb-8 grid gap-4 md:grid-cols-4">

        <div className="rounded-2xl bg-green-500/10 p-5">
          <p className="text-sm text-gray-400">
            Connected
          </p>
          <h3 className="text-3xl font-black text-green-400">
            15
          </h3>
        </div>

        <div className="rounded-2xl bg-red-500/10 p-5">
          <p className="text-sm text-gray-400">
            Missing
          </p>
          <h3 className="text-3xl font-black text-red-400">
            6
          </h3>
        </div>

        <div className="rounded-2xl bg-yellow-500/10 p-5">
          <p className="text-sm text-gray-400">
            Warnings
          </p>
          <h3 className="text-3xl font-black text-yellow-400">
            4
          </h3>
        </div>

        <div className="rounded-2xl bg-pink-500/10 p-5">
          <p className="text-sm text-gray-400">
            Critical
          </p>
          <h3 className="text-3xl font-black text-pink-400">
            1
          </h3>
        </div>

      </div>

      {/* AUDIT CARDS */}

      <div className="grid gap-6 md:grid-cols-2">

        <AuditCard
          title="Realtime Audit"
          status="PASS"
          issues={[
            "Realtime Firestore Sync Active",
            "Snapshot Listener Connected",
            "Live Transaction Updates",
            "Descending Timeline Working"
          ]}
        />

        <AuditCard
          title="Data Validation Audit"
          status="PASS"
          issues={[
            "Transaction Type Validation",
            "Status Validation",
            "Fallback Handling Present",
            "Timestamp Safety Checks"
          ]}
        />

        <AuditCard
          title="Security Audit"
          status="WARNING"
          issues={[
            "Auth Check Present",
            "Firestore Rules Not Verified",
            "No Access Logging",
            "No Device Tracking"
          ]}
        />

        <AuditCard
          title="Architecture Audit"
          status="PASS"
          issues={[
            "Typed Interfaces Used",
            "Realtime Pattern Clean",
            "Listener Cleanup Present",
            "Memory Leak Prevention"
          ]}
        />

        <AuditCard
          title="Governance Audit"
          status="WARNING"
          issues={[
            "Transaction Types Hardcoded",
            "Status Types Hardcoded",
            "Labels Hardcoded",
            "Admin Config Missing"
          ]}
        />

        <AuditCard
          title="Theme Audit"
          status="FAIL"
          issues={[
            "Theme Context Not Used",
            "Hardcoded Colors Found",
            "Admin Theme Control Missing",
            "Dynamic Branding Missing"
          ]}
        />

        <AuditCard
          title="Analytics Audit"
          status="WARNING"
          issues={[
            "Transaction List Present",
            "No Wallet Analytics",
            "No Charts",
            "No Financial Insights"
          ]}
        />

        <AuditCard
          title="Enterprise Audit"
          status="CRITICAL"
          issues={[
            "Export Missing",
            "Advanced Filters Missing",
            "Search Missing",
            "Audit Trail Dashboard Missing"
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
            "Governance Scanner Integration",
            "Admin Controlled Transaction Types",
            "Wallet Analytics Dashboard",
            "Export CSV",
            "Export PDF",
            "Transaction Search",
            "Advanced Filters",
            "Theme Engine",
            "Audit Trail Dashboard",
            "Fraud Detection",
            "Role Based Access Control",
            "Financial Reports",
            "Compliance Logs",
            "Version Tracking",
            "Enterprise Monitoring"
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
