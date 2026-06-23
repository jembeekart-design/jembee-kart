"use client";

import AuditCard from "@/components/governance/AuditCard";

export default function CheckoutGovernancePage() {
  const governanceScore = 71;

  return (
    <main className="min-h-screen bg-[#050505] p-6 text-white">

      <div className="mb-8">
        <h1 className="text-4xl font-black">
          Checkout Governance Audit
        </h1>

        <p className="mt-2 text-gray-400">
          Audit Report for src/app/checkout/page.tsx
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
            18
          </h3>
        </div>

        <div className="rounded-2xl bg-red-500/10 p-5">
          <p className="text-sm text-gray-400">
            Missing
          </p>

          <h3 className="text-3xl font-black text-red-400">
            9
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
            2
          </h3>
        </div>

      </div>

      {/* AUDITS */}

      <div className="grid gap-6 md:grid-cols-2">

        <AuditCard
          title="Route Audit"
          status="PASS"
          issues={[
            "Checkout Route Found",
            "Checkout Page Connected",
            "Router Navigation Working",
            "Suspense Boundary Working"
          ]}
        />

        <AuditCard
          title="Firestore Audit"
          status="PASS"
          issues={[
            "Products Collection Connected",
            "Orders Collection Connected",
            "Address Collection Connected",
            "Realtime Firestore Access Working"
          ]}
        />

        <AuditCard
          title="Ecommerce Audit"
          status="PASS"
          issues={[
            "Product Loading Connected",
            "Address Loading Connected",
            "Order Creation Connected",
            "COD Checkout Connected"
          ]}
        />

        <AuditCard
          title="Wallet Audit"
          status="FAIL"
          issues={[
            "Cashback Processing Missing",
            "Reward Wallet Processing Missing",
            "Commission Wallet Processing Missing",
            "Withdrawable Wallet Missing"
          ]}
        />

        <AuditCard
          title="Referral Audit"
          status="WARNING"
          issues={[
            "referralEligible Flag Connected",
            "Referral Distribution Missing",
            "Rank Bonus Missing",
            "Sponsor Commission Missing"
          ]}
        />

        <AuditCard
          title="Watch Earn Audit"
          status="FAIL"
          issues={[
            "Reward Unlock Integration Missing",
            "Qualified Sales Counter Missing",
            "Reward Cycle Update Missing",
            "Watch Earn Sync Missing"
          ]}
        />

        <AuditCard
          title="Creator Economy Audit"
          status="FAIL"
          issues={[
            "Creator Commission Missing",
            "Creator Revenue Share Missing",
            "Creator Sales Attribution Missing"
          ]}
        />

        <AuditCard
          title="Admin Control Audit"
          status="CRITICAL"
          issues={[
            "Product Price Hardcoded",
            "Discount Hardcoded",
            "Delivery Date Hardcoded",
            "Seller Hardcoded",
            "No Dynamic Checkout Settings"
          ]}
        />

        <AuditCard
          title="Theme Audit"
          status="FAIL"
          issues={[
            "bg-[#f8f9fe] Hardcoded",
            "Purple Colors Hardcoded",
            "White Cards Hardcoded",
            "Admin Theme Not Connected"
          ]}
        />

        <AuditCard
          title="Security Audit"
          status="WARNING"
          issues={[
            "Firebase Auth Connected",
            "Firestore Connected",
            "Role Validation Missing",
            "Order Validation Missing"
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
            "Cashback Engine",
            "Referral Commission Engine",
            "Reward Unlock Engine",
            "Creator Revenue Share",
            "Dynamic Delivery Rules",
            "Dynamic Checkout Settings",
            "Seller Mapping Engine",
            "Audit Logs",
            "Fraud Detection",
            "Admin Controlled Pricing"
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
