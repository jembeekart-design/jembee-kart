"use client";

import AuditCard from "@/components/governance/AuditCard";

export default function OrderIdGovernancePage() {
  const governanceScore = 74;

  return (
    <main className="min-h-screen bg-[#050505] p-6 text-white">

      {/* PAGE INFO */}

      <div className="mb-8">

        <h1 className="text-4xl font-black text-pink-400">
          src/app/order/[id]/page.tsx
        </h1>

        <p className="mt-2 text-gray-400">
          Governance Audit Report
        </p>

        <div className="mt-4 rounded-3xl border border-white/10 bg-[#111111] p-5">

          <p className="text-green-400 font-bold">
            Governance File:
            src/app/admin/governance/pages/order-id/page.tsx
          </p>

          <p className="mt-2 text-cyan-400 font-bold">
            Route:
            /order/[id]
          </p>

          <p className="mt-2 text-yellow-400 font-bold">
            Module:
            Ecommerce → Orders
          </p>

          <p className="mt-2 text-pink-400 font-bold">
            Collections:
            orders
          </p>

        </div>

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
            22
          </h3>
        </div>

        <div className="rounded-2xl bg-red-500/10 p-5">
          <p className="text-sm text-gray-400">
            Missing
          </p>

          <h3 className="text-3xl font-black text-red-400">
            8
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
            2
          </h3>
        </div>

      </div>

      {/* AUDITS */}

      <div className="grid gap-6 md:grid-cols-2">

        <AuditCard
          title="Page Connection Audit"
          status="PASS"
          issues={[
            "File Found: src/app/order/[id]/page.tsx",
            "Route Connected: /order/[id]",
            "useParams Connected",
            "Router Connected",
            "Order ID Loading Working"
          ]}
        />

        <AuditCard
          title="Firestore Audit"
          status="PASS"
          issues={[
            "Orders Collection Connected",
            "getDoc Working",
            "updateDoc Working",
            "Order Status Sync Working"
          ]}
        />

        <AuditCard
          title="Order Tracking Audit"
          status="WARNING"
          issues={[
            "Timeline UI Working",
            "Tracking Events Missing",
            "Shipment API Missing",
            "Courier Status Missing"
          ]}
        />

        <AuditCard
          title="Ecommerce Audit"
          status="PASS"
          issues={[
            "Order Details Loaded",
            "Product Details Loaded",
            "Address Loaded",
            "Price Summary Working"
          ]}
        />

        <AuditCard
          title="Theme Audit"
          status="FAIL"
          issues={[
            "Hardcoded Colors Found",
            "Hardcoded Background Found",
            "ThemeContext Missing",
            "Admin Theme Not Connected"
          ]}
        />

        <AuditCard
          title="Admin Control Audit"
          status="FAIL"
          issues={[
            "Return Rules Hardcoded",
            "Status Colors Hardcoded",
            "Timeline Steps Hardcoded",
            "Admin Config Missing"
          ]}
        />

        <AuditCard
          title="Order Lifecycle Audit"
          status="WARNING"
          issues={[
            "Cancel Order Working",
            "Refund Flow Missing",
            "Exchange Flow Missing",
            "Return Approval Missing"
          ]}
        />

        <AuditCard
          title="Security Audit"
          status="CRITICAL"
          issues={[
            "Order Ownership Validation Missing",
            "User Can Access Any Order ID",
            "Firestore Rule Dependency Required"
          ]}
        />

        <AuditCard
          title="Invoice Audit"
          status="FAIL"
          issues={[
            "Invoice Button Exists",
            "Invoice PDF Missing",
            "GST Invoice Missing"
          ]}
        />

        <AuditCard
          title="MLM Audit"
          status="WARNING"
          issues={[
            "Referral Status Missing",
            "Commission Status Missing",
            "Cashback Status Missing"
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
            "Order Ownership Validation",
            "Invoice PDF System",
            "GST Invoice",
            "Exchange Workflow",
            "Return Workflow",
            "Refund Workflow",
            "Courier Tracking API",
            "Shipment Events",
            "Admin Config Driven Status",
            "Theme Engine Integration",
            "Cashback Status",
            "Referral Commission Status"
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
