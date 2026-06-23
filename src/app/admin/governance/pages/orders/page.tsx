"use client";

import AuditCard from "@/components/governance/AuditCard";

export default function OrdersGovernancePage() {
  const governanceScore = 78;

  return (
    <main className="min-h-screen bg-[#050505] p-6 text-white">

      <div className="mb-8">

        <h1 className="text-4xl font-black">
          Orders Governance Audit
        </h1>

        <p className="mt-2 text-gray-400">
          Audit Report for src/app/orders/page.tsx
        </p>

      </div>

      {/* SCORE */}

      <div className="mb-8 rounded-3xl border border-white/10 bg-[#111111] p-6">

        <p className="text-sm text-gray-400">
          Governance Score
        </p>

        <h2 className="mt-2 text-6xl font-black text-pink-400">
          {governanceScore}/100
        </h2>

        <p className="mt-3 text-yellow-400">
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
            24
          </h3>
        </div>

        <div className="rounded-2xl bg-red-500/10 p-5">
          <p className="text-sm text-gray-400">
            Missing
          </p>

          <h3 className="text-3xl font-black text-red-400">
            7
          </h3>
        </div>

        <div className="rounded-2xl bg-yellow-500/10 p-5">
          <p className="text-sm text-gray-400">
            Warnings
          </p>

          <h3 className="text-3xl font-black text-yellow-400">
            5
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

      {/* AUDITS */}

      <div className="grid gap-6 md:grid-cols-2">

        <AuditCard
          title="Route Audit"
          status="PASS"
          issues={[
            "Orders Route Found",
            "Orders Page Connected",
            "Navigation Working",
            "Order Details Route Connected"
          ]}
        />

        <AuditCard
          title="Firestore Audit"
          status="PASS"
          issues={[
            "Orders Collection Connected",
            "Realtime Snapshot Working",
            "User Filter Working",
            "Order Sync Working"
          ]}
        />

        <AuditCard
          title="Authentication Audit"
          status="PASS"
          issues={[
            "Firebase Auth Connected",
            "User Orders Filtered",
            "Auth Listener Working"
          ]}
        />

        <AuditCard
          title="Search Audit"
          status="PASS"
          issues={[
            "Order Search Working",
            "Product Search Working",
            "Realtime Filtering Working"
          ]}
        />

        <AuditCard
          title="Order Status Audit"
          status="WARNING"
          issues={[
            "Status UI Working",
            "Status Colors Hardcoded",
            "Admin Status Config Missing"
          ]}
        />

        <AuditCard
          title="Theme Audit"
          status="FAIL"
          issues={[
            "Hardcoded Colors Found",
            "ThemeContext Missing",
            "Admin Theme Not Connected"
          ]}
        />

        <AuditCard
          title="Admin Control Audit"
          status="FAIL"
          issues={[
            "Tabs Hardcoded",
            "Status Mapping Hardcoded",
            "Bottom Navigation Hardcoded",
            "Admin Config Missing"
          ]}
        />

        <AuditCard
          title="Ecommerce Audit"
          status="PASS"
          issues={[
            "Order Listing Working",
            "Order Statistics Working",
            "Order Search Working",
            "Order Details Access Working"
          ]}
        />

        <AuditCard
          title="Security Audit"
          status="CRITICAL"
          issues={[
            "Firestore Rules Required",
            "Orders Access Depends On Security Rules",
            "Backend Validation Missing"
          ]}
        />

        <AuditCard
          title="MLM Audit"
          status="WARNING"
          issues={[
            "Commission Status Missing",
            "Cashback Status Missing",
            "Referral Status Missing"
          ]}
        />

        <AuditCard
          title="Analytics Audit"
          status="WARNING"
          issues={[
            "Basic Statistics Working",
            "Advanced Analytics Missing",
            "Order Insights Missing"
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
            "Theme Engine Integration",
            "Admin Controlled Status Colors",
            "Admin Controlled Tabs",
            "Commission Status",
            "Cashback Status",
            "Referral Status",
            "Order Analytics Dashboard",
            "Order Export System",
            "Audit Logs",
            "Role Based Access Control",
            "Config Driven Navigation"
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
