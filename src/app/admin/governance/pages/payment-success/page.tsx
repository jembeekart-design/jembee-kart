"use client";

import AuditCard from "@/components/governance/AuditCard";

export default function PaymentSuccessGovernancePage() {
  const governanceScore = 52;

  return (
    <main className="min-h-screen bg-[#050505] p-6 text-white">

      <div className="mb-8">

        <h1 className="text-4xl font-black">
          Payment Success Governance Audit
        </h1>

        <p className="mt-2 text-gray-400">
          Audit Report for src/app/payment-success/page.tsx
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
          <h3 className="text-3xl font-black text-green-400">11</h3>
        </div>

        <div className="rounded-2xl bg-red-500/10 p-5">
          <p className="text-sm text-gray-400">Missing</p>
          <h3 className="text-3xl font-black text-red-400">14</h3>
        </div>

        <div className="rounded-2xl bg-yellow-500/10 p-5">
          <p className="text-sm text-gray-400">Warnings</p>
          <h3 className="text-3xl font-black text-yellow-400">5</h3>
        </div>

        <div className="rounded-2xl bg-pink-500/10 p-5">
          <p className="text-sm text-gray-400">Critical</p>
          <h3 className="text-3xl font-black text-pink-400">4</h3>
        </div>

      </div>

      {/* AUDITS */}

      <div className="grid gap-6 md:grid-cols-2">

        <AuditCard
          title="Route Audit"
          status="PASS"
          issues={[
            "Payment Success Route Found",
            "Auth Listener Working",
            "Firestore User Read Working"
          ]}
        />

        <AuditCard
          title="Referral Audit"
          status="CRITICAL"
          issues={[
            "Referral Code Auto Generated",
            "Business Logic Hardcoded",
            "Referral Activation Trigger Hardcoded",
            "Admin Control Missing"
          ]}
        />

        <AuditCard
          title="MLM Audit"
          status="CRITICAL"
          issues={[
            "mlmActive Forced TRUE",
            "Purchase Validation Missing",
            "Order Validation Missing",
            "Admin Rules Missing"
          ]}
        />

        <AuditCard
          title="Ecommerce Audit"
          status="FAIL"
          issues={[
            "Order Data Not Loaded",
            "Order Number Missing",
            "Product Summary Missing",
            "Order Verification Missing"
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
          status="CRITICAL"
          issues={[
            "Referral Logic Hardcoded",
            "MLM Activation Hardcoded",
            "Referral Format Hardcoded",
            "Admin Config Missing"
          ]}
        />

        <AuditCard
          title="Security Audit"
          status="WARNING"
          issues={[
            "User Validation Exists",
            "Order Ownership Missing",
            "Payment Verification Missing"
          ]}
        />

        <AuditCard
          title="Payment Audit"
          status="CRITICAL"
          issues={[
            "Payment Success Page Can Open Directly",
            "No Payment Gateway Verification",
            "No Transaction Validation",
            "Fraud Risk Present"
          ]}
        />

        <AuditCard
          title="Wallet Audit"
          status="FAIL"
          issues={[
            "Cashback Status Missing",
            "Reward Status Missing",
            "Commission Status Missing"
          ]}
        />

        <AuditCard
          title="JembeeKart Architecture Audit"
          status="FAIL"
          issues={[
            "Ecommerce First Rule Violated",
            "MLM Activated Directly",
            "Order Delivery Validation Missing",
            "Master Model Not Followed"
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
            "Payment Verification",
            "Transaction Validation",
            "Order Verification",
            "Delivered Order Validation",
            "Admin MLM Rules",
            "Admin Referral Rules",
            "Theme Engine Integration",
            "Cashback Status",
            "Commission Status",
            "Reward Status",
            "Order Summary",
            "Invoice Link",
            "Order Tracking Link",
            "Audit Logs"
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
