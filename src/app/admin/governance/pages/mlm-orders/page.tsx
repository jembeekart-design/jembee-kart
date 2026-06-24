"use client";

import AuditCard from "@/components/governance/AuditCard";

export default function OrdersGovernancePage() {
  const governanceScore = 38;

  return (
    <main className="min-h-screen bg-[#050505] p-6 text-white">

      <div className="mb-8">
        <h1 className="text-4xl font-black">
          Orders Governance Audit
        </h1>

        <p className="mt-2 text-gray-400">
          Audit Report for src/app/mlm/orders/page.tsx
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
            4
          </h3>
        </div>

        <div className="rounded-2xl bg-red-500/10 p-5">
          <p className="text-sm text-gray-400">
            Missing
          </p>
          <h3 className="text-3xl font-black text-red-400">
            12
          </h3>
        </div>

        <div className="rounded-2xl bg-yellow-500/10 p-5">
          <p className="text-sm text-gray-400">
            Warnings
          </p>
          <h3 className="text-3xl font-black text-yellow-400">
            6
          </h3>
        </div>

        <div className="rounded-2xl bg-pink-500/10 p-5">
          <p className="text-sm text-gray-400">
            Critical
          </p>
          <h3 className="text-3xl font-black text-pink-400">
            3
          </h3>
        </div>

      </div>

      {/* AUDIT CARDS */}

      <div className="grid gap-6 md:grid-cols-2">

        <AuditCard
          title="Orders UI Audit"
          status="PASS"
          issues={[
            "Mobile Friendly Layout",
            "Order Cards Present",
            "Status Indicators Present",
            "Responsive Design Working"
          ]}
        />

        <AuditCard
          title="Firestore Audit"
          status="FAIL"
          issues={[
            "Orders Collection Missing",
            "Realtime Sync Missing",
            "User Filtering Missing",
            "Firestore Listener Missing"
          ]}
        />

        <AuditCard
          title="Tracking Audit"
          status="FAIL"
          issues={[
            "Tracking Number Missing",
            "Courier Details Missing",
            "Delivery Timeline Missing",
            "Track Button Non Functional"
          ]}
        />

        <AuditCard
          title="Admin Control Audit"
          status="FAIL"
          issues={[
            "Status Hardcoded",
            "Orders Hardcoded",
            "No Admin Management",
            "No Dynamic Configuration"
          ]}
        />

        <AuditCard
          title="Theme Audit"
          status="WARNING"
          issues={[
            "Dark Theme Present",
            "Theme Context Missing",
            "Admin Theme Control Missing",
            "Dynamic Branding Missing"
          ]}
        />

        <AuditCard
          title="Security Audit"
          status="WARNING"
          issues={[
            "No Auth Guard",
            "No Role Validation",
            "No Ownership Check",
            "No Access Logging"
          ]}
        />

        <AuditCard
          title="Scalability Audit"
          status="FAIL"
          issues={[
            "Pagination Missing",
            "Search Missing",
            "Filtering Missing",
            "Large Dataset Risk"
          ]}
        />

        <AuditCard
          title="Architecture Audit"
          status="WARNING"
          issues={[
            "Hardcoded Demo Data",
            "No Service Layer",
            "No Repository Pattern",
            "Not Enterprise Ready"
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
            "Firestore Orders Collection",
            "Realtime Order Sync",
            "Order Search",
            "Order Filters",
            "Pagination",
            "Tracking System",
            "Delivery Timeline",
            "Invoice Download",
            "Return Request",
            "Cancel Order",
            "Audit Logs",
            "Admin Order Management",
            "Theme Engine",
            "Order Analytics",
            "Governance Scanner Integration",
            "Role Based Access Control"
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
