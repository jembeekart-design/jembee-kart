"use client";

import AuditCard from "@/components/governance/AuditCard";

export default function MLMWalletGovernancePage() {
  const governanceScore = 32;

  return (
    <main className="min-h-screen bg-[#050505] p-6 text-white">
      {/* HEADER */}

      <div className="mb-8">
        <h1 className="text-4xl font-black">
          MLM Wallet Governance Audit
        </h1>

        <p className="mt-2 text-gray-400">
          Audit Report for src/app/mlm/wallet/page.tsx
        </p>
      </div>

      {/* SCORE */}

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

      {/* SUMMARY */}

      <div className="mb-8 grid gap-4 md:grid-cols-4">
        <div className="rounded-2xl bg-green-500/10 p-5">
          <p className="text-sm text-gray-400">
            Connected
          </p>

          <h3 className="text-3xl font-black text-green-400">
            3
          </h3>
        </div>

        <div className="rounded-2xl bg-red-500/10 p-5">
          <p className="text-sm text-gray-400">
            Missing
          </p>

          <h3 className="text-3xl font-black text-red-400">
            18
          </h3>
        </div>

        <div className="rounded-2xl bg-yellow-500/10 p-5">
          <p className="text-sm text-gray-400">
            Warnings
          </p>

          <h3 className="text-3xl font-black text-yellow-400">
            8
          </h3>
        </div>

        <div className="rounded-2xl bg-pink-500/10 p-5">
          <p className="text-sm text-gray-400">
            Critical
          </p>

          <h3 className="text-3xl font-black text-pink-400">
            5
          </h3>
        </div>
      </div>

      {/* AUDIT CARDS */}

      <div className="grid gap-6 md:grid-cols-2">

        <AuditCard
          title="Wallet UI Audit"
          status="PASS"
          issues={[
            "Responsive Layout Present",
            "Wallet Summary Present",
            "Transaction UI Present",
            "Good Mobile UX"
          ]}
        />

        <AuditCard
          title="Firestore Audit"
          status="FAIL"
          issues={[
            "Wallet Balance Hardcoded",
            "Transactions Hardcoded",
            "Firestore Collection Missing",
            "Realtime Sync Missing"
          ]}
        />

        <AuditCard
          title="Security Audit"
          status="FAIL"
          issues={[
            "No Auth Guard",
            "No User Validation",
            "No Ownership Check",
            "No Wallet Protection"
          ]}
        />

        <AuditCard
          title="Admin Control Audit"
          status="FAIL"
          issues={[
            "Wallet Config Hardcoded",
            "No Admin Controls",
            "No Dynamic Settings",
            "No Governance Control"
          ]}
        />

        <AuditCard
          title="Theme Audit"
          status="FAIL"
          issues={[
            "Theme Context Missing",
            "Theme Settings Missing",
            "Brand Control Missing",
            "Admin Theme Engine Missing"
          ]}
        />

        <AuditCard
          title="Transaction Audit"
          status="FAIL"
          issues={[
            "Search Missing",
            "Filters Missing",
            "Pagination Missing",
            "Export Missing"
          ]}
        />

        <AuditCard
          title="Architecture Audit"
          status="WARNING"
          issues={[
            "Hardcoded Demo Data",
            "No Repository Layer",
            "No Service Layer",
            "Not Enterprise Ready"
          ]}
        />

        <AuditCard
          title="Scalability Audit"
          status="FAIL"
          issues={[
            "Large History Risk",
            "No Lazy Loading",
            "No Infinite Scroll",
            "No Query Optimization"
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
            "Firestore Wallet Collection",
            "Realtime Wallet Sync",
            "Wallet Analytics",
            "Wallet Transfer Engine",
            "Withdrawal Engine",
            "Withdrawal Approval Workflow",
            "Admin Wallet Controls",
            "Wallet Audit Logs",
            "Wallet Security Rules",
            "Role Based Access Control",
            "Dynamic Theme Engine",
            "Governance Scanner",
            "Export Statements",
            "PDF Reports",
            "Search Transactions",
            "Pagination",
            "Wallet Notifications",
            "Transaction Filters"
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

      {/* FINAL VERDICT */}

      <div className="mt-8 rounded-3xl border border-red-500/20 bg-red-500/5 p-6">
        <h2 className="text-2xl font-black text-red-400">
          JembeeKart Governance Verdict
        </h2>

        <div className="mt-4 space-y-2 text-sm">
          <div>UI Score : 90/100</div>
          <div>Firestore Score : 0/100</div>
          <div>Security Score : 15/100</div>
          <div>Governance Score : 10/100</div>
          <div>Admin Control Score : 0/100</div>
          <div>Scalability Score : 20/100</div>
        </div>

        <div className="mt-5 border-t border-white/10 pt-5">
          <p className="text-lg font-black text-red-400">
            Final Score: 32/100
          </p>

          <p className="mt-2 text-sm text-gray-400">
            Current wallet page is UI only. Production wallet
            architecture, Firestore integration, security layer,
            governance controls and admin-driven configuration
            are missing.
          </p>
        </div>
      </div>
    </main>
  );
}
