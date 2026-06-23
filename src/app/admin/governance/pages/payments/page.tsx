"use client";

import AuditCard from "@/components/governance/AuditCard";

export default function PaymentsGovernancePage() {
  const governanceScore = 41;

  return (
    <main className="min-h-screen bg-[#050505] p-6 text-white">

      <div className="mb-8">

        <h1 className="text-4xl font-black">
          Payments Governance Audit
        </h1>

        <p className="mt-2 text-gray-400">
          Audit Report for src/app/payments/page.tsx
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

        <p className="mt-3 text-red-400">
          Production Ready: NO
        </p>

      </div>

      {/* SUMMARY */}

      <div className="mb-8 grid gap-4 md:grid-cols-4">

        <div className="rounded-2xl bg-green-500/10 p-5">
          <p className="text-sm text-gray-400">Connected</p>
          <h3 className="text-3xl font-black text-green-400">8</h3>
        </div>

        <div className="rounded-2xl bg-red-500/10 p-5">
          <p className="text-sm text-gray-400">Missing</p>
          <h3 className="text-3xl font-black text-red-400">18</h3>
        </div>

        <div className="rounded-2xl bg-yellow-500/10 p-5">
          <p className="text-sm text-gray-400">Warnings</p>
          <h3 className="text-3xl font-black text-yellow-400">6</h3>
        </div>

        <div className="rounded-2xl bg-pink-500/10 p-5">
          <p className="text-sm text-gray-400">Critical</p>
          <h3 className="text-3xl font-black text-pink-400">5</h3>
        </div>

      </div>

      {/* AUDITS */}

      <div className="grid gap-6 md:grid-cols-2">

        <AuditCard
          title="Route Audit"
          status="PASS"
          issues={[
            "Payments Route Found",
            "Router Navigation Working",
            "Payment Screen Rendering"
          ]}
        />

        <AuditCard
          title="Order Audit"
          status="CRITICAL"
          issues={[
            "Order Creation Missing",
            "Firestore Order Write Missing",
            "Order Validation Missing",
            "Order Summary Hardcoded"
          ]}
        />

        <AuditCard
          title="Payment Gateway Audit"
          status="CRITICAL"
          issues={[
            "Cashfree Missing",
            "Razorpay Missing",
            "PhonePe Missing",
            "Payment Verification Missing"
          ]}
        />

        <AuditCard
          title="Theme Audit"
          status="FAIL"
          issues={[
            "Hardcoded Colors Found",
            "ThemeContext Missing",
            "Admin Theme Missing"
          ]}
        />

        <AuditCard
          title="Admin Control Audit"
          status="CRITICAL"
          issues={[
            "Payment Methods Hardcoded",
            "Payment Settings Hardcoded",
            "No Firestore Config",
            "Admin Controls Missing"
          ]}
        />

        <AuditCard
          title="Ecommerce Audit"
          status="FAIL"
          issues={[
            "Product Data Missing",
            "Cart Data Missing",
            "Address Validation Missing",
            "Seller Validation Missing"
          ]}
        />

        <AuditCard
          title="Security Audit"
          status="CRITICAL"
          issues={[
            "Payment Verification Missing",
            "Amount Tampering Protection Missing",
            "Transaction Validation Missing"
          ]}
        />

        <AuditCard
          title="Wallet Audit"
          status="FAIL"
          issues={[
            "Cashback Logic Missing",
            "Reward Logic Missing",
            "Commission Logic Missing"
          ]}
        />

        <AuditCard
          title="JembeeKart Architecture Audit"
          status="CRITICAL"
          issues={[
            "Config First Architecture Violated",
            "Admin First Control Missing",
            "Firestore Driven Rules Missing",
            "Master Model Violation"
          ]}
        />

        <AuditCard
          title="UI Audit"
          status="WARNING"
          issues={[
            "UI Looks Good",
            "Responsive Layout Present",
            "Business Logic Not Connected"
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
            "Firestore Order Creation",
            "Cashfree Integration",
            "Razorpay Integration",
            "Payment Verification",
            "Transaction Logs",
            "Order Validation",
            "Address Validation",
            "Cart Validation",
            "Seller Validation",
            "Theme Engine",
            "Admin Payment Settings",
            "Admin Payment Methods",
            "Reward Engine",
            "Cashback Engine",
            "Commission Engine",
            "Audit Logs",
            "Fraud Detection",
            "Config Driven Payments"
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
