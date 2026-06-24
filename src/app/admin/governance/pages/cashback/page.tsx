"use client";

import AuditCard from "@/components/governance/AuditCard";

export default function CashbackGovernancePage() {
  const governanceScore = 88;

  return (
    <main className="min-h-screen bg-[#050505] p-6 text-white">

      <div className="mb-8">
        <h1 className="text-4xl font-black">
          Cashback Governance Audit
        </h1>

        <p className="mt-2 text-gray-400">
          Audit Report for src/app/mlm/cashback/page.tsx
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
          Production Ready: YES
        </p>
      </div>

      {/* SUMMARY */}

      <div className="mb-8 grid gap-4 md:grid-cols-4">

        <div className="rounded-2xl bg-green-500/10 p-5">
          <p className="text-sm text-gray-400">
            Connected
          </p>

          <h3 className="text-3xl font-black text-green-400">
            28
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
            0
          </h3>
        </div>

      </div>

      {/* AUDITS */}

      <div className="grid gap-6 md:grid-cols-2">

        <AuditCard
          title="Wallet Audit"
          status="PASS"
          issues={[
            "Wallet Balance Connected",
            "Commission Wallet Connected",
            "Reward Wallet Connected",
            "Cashback Wallet Connected"
          ]}
        />

        <AuditCard
          title="Realtime Firestore Audit"
          status="PASS"
          issues={[
            "onSnapshot Connected",
            "Realtime Wallet Sync Active",
            "Realtime Transactions Active",
            "Firestore Monitoring Working"
          ]}
        />

        <AuditCard
          title="Cloud Function Audit"
          status="PASS"
          issues={[
            "httpsCallable Connected",
            "Wallet Transfer Secured",
            "Cloud Execution Working",
            "Direct Client Mutation Removed"
          ]}
        />

        <AuditCard
          title="Transaction Audit"
          status="PASS"
          issues={[
            "Transaction History Connected",
            "Status Validation Active",
            "Type Validation Active",
            "Audit Trail Visible"
          ]}
        />

        <AuditCard
          title="Search Audit"
          status="PASS"
          issues={[
            "Search Input Working",
            "Transaction Search Working",
            "Order Reference Search Working",
            "Realtime Filtering Active"
          ]}
        />

        <AuditCard
          title="Filter Audit"
          status="PASS"
          issues={[
            "Success Filter Working",
            "Pending Filter Working",
            "Failed Filter Working",
            "All Records Filter Working"
          ]}
        />

        <AuditCard
          title="Security Audit"
          status="PASS"
          issues={[
            "Cloud Function Protected",
            "Auth Validation Active",
            "Transfer Threshold Validation Active",
            "Client Side Protection Present"
          ]}
        />

        <AuditCard
          title="Performance Audit"
          status="PASS"
          issues={[
            "Memory Cleanup Added",
            "Timeout Cleanup Added",
            "Realtime Streams Managed",
            "Efficient State Updates"
          ]}
        />

        <AuditCard
          title="Configuration Audit"
          status="PASS"
          issues={[
            "Transfer Limit Dynamic",
            "Firestore Config Connected",
            "App Config Collection Working",
            "Config Loading Active"
          ]}
        />

        <AuditCard
          title="Theme Audit"
          status="FAIL"
          issues={[
            "Hardcoded Colors Found",
            "Theme Context Not Used",
            "Admin Theme Missing",
            "Dynamic Branding Missing"
          ]}
        />

        <AuditCard
          title="Architecture Audit"
          status="WARNING"
          issues={[
            "Region Hardcoded",
            "Collection Names Hardcoded",
            "Dashboard Routes Hardcoded",
            "Partial Config Driven Structure"
          ]}
        />

        <AuditCard
          title="Governance Audit"
          status="WARNING"
          issues={[
            "Audit Logging Missing",
            "Wallet Health Monitoring Missing",
            "Transfer Governance Missing",
            "Compliance Logs Missing"
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
            "Wallet Freeze System",
            "Fraud Detection Layer",
            "Transfer Approval Workflow",
            "Admin Wallet Monitoring",
            "Audit Log Collection",
            "Wallet Health Score",
            "Theme Engine Integration",
            "Admin Theme Control",
            "Feature Flag System",
            "Governance Event Logging",
            "Dynamic Cloud Function Region",
            "Dynamic Route Configuration"
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
