// src/app/admin/governance/pages/affiliate/page.tsx

"use client";

import {
  AlertTriangle,
  CheckCircle,
  XCircle,
} from "lucide-react";

function AuditCard({
  title,
  status,
  issues,
}: {
  title: string;
  status: "PASS" | "WARNING" | "FAIL";
  issues: string[];
}) {
  return (
    <div className="rounded-3xl border border-white/10 bg-[#111111] p-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-bold">{title}</h3>

        {status === "PASS" && (
          <CheckCircle className="text-green-400" />
        )}

        {status === "WARNING" && (
          <AlertTriangle className="text-yellow-400" />
        )}

        {status === "FAIL" && (
          <XCircle className="text-red-400" />
        )}
      </div>

      <div className="mt-4 space-y-2">
        {issues.map((issue, index) => (
          <div
            key={index}
            className="rounded-xl bg-black/30 p-3 text-sm text-gray-300"
          >
            {issue}
          </div>
        ))}
      </div>
    </div>
  );
}

export default function AffiliateGovernancePage() {
  const governanceScore = 52;

  return (
    <main className="min-h-screen bg-[#050505] p-6 text-white">

      <div className="mb-8">
        <h1 className="text-4xl font-black">
          Affiliate Page Governance Audit
        </h1>

        <p className="mt-2 text-gray-400">
          Audit Report for src/app/affiliate/page.tsx
        </p>
      </div>

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

      <div className="mb-8 grid gap-4 md:grid-cols-4">

        <div className="rounded-2xl bg-green-500/10 p-5">
          <p className="text-sm text-gray-400">Connected</p>
          <h3 className="text-3xl font-black text-green-400">
            10
          </h3>
        </div>

        <div className="rounded-2xl bg-red-500/10 p-5">
          <p className="text-sm text-gray-400">Missing</p>
          <h3 className="text-3xl font-black text-red-400">
            14
          </h3>
        </div>

        <div className="rounded-2xl bg-yellow-500/10 p-5">
          <p className="text-sm text-gray-400">Warnings</p>
          <h3 className="text-3xl font-black text-yellow-400">
            7
          </h3>
        </div>

        <div className="rounded-2xl bg-pink-500/10 p-5">
          <p className="text-sm text-gray-400">Critical</p>
          <h3 className="text-3xl font-black text-pink-400">
            4
          </h3>
        </div>

      </div>

      <div className="grid gap-6 md:grid-cols-2">

        <AuditCard
          title="Route Audit"
          status="PASS"
          issues={[
            "Affiliate Route Found",
            "Firebase Auth Connected",
            "Users Collection Connected",
            "Realtime User Data Working",
          ]}
        />

        <AuditCard
          title="MLM Audit"
          status="FAIL"
          issues={[
            "Dashboard Menu Hardcoded",
            "MLM Features Hardcoded",
            "Rank Logic Missing",
            "Commission Engine Missing",
            "Referral Analytics Missing",
            "Team Business Analytics Missing",
          ]}
        />

        <AuditCard
          title="Ecommerce Audit"
          status="FAIL"
          issues={[
            "No Product Sales Analytics",
            "No Delivered Order Analytics",
            "No Seller Revenue Dashboard",
            "No Ecommerce Revenue Dashboard",
          ]}
        />

        <AuditCard
          title="Watch Earn Audit"
          status="FAIL"
          issues={[
            "Watch Earn Entry Exists",
            "Cycle Status Missing",
            "Locked Reward Missing",
            "Qualified Sales Missing",
            "Reward Analytics Missing",
          ]}
        />

        <AuditCard
          title="Creator Economy Audit"
          status="FAIL"
          issues={[
            "Creator Wallet Missing",
            "Creator Revenue Missing",
            "Creator Dashboard Missing",
            "Creator Analytics Missing",
            "Live Shopping Missing",
          ]}
        />

        <AuditCard
          title="Wallet Audit"
          status="FAIL"
          issues={[
            "commissionWallet Missing",
            "rewardWallet Missing",
            "cashbackWallet Missing",
            "creatorWallet Missing",
            "loyaltyWallet Missing",
            "withdrawableWallet Missing",
            "pendingWithdrawal Missing",
          ]}
        />

        <AuditCard
          title="Admin Control Audit"
          status="FAIL"
          issues={[
            "Dashboard Layout Hardcoded",
            "Menu Structure Hardcoded",
            "Rank System Hardcoded",
            "Referral Rules Hardcoded",
            "No Firestore Settings",
            "No Dynamic Admin Builder",
          ]}
        />

        <AuditCard
          title="Theme Audit"
          status="FAIL"
          issues={[
            "bg-[#f6f7fb] Hardcoded",
            "Gradient Colors Hardcoded",
            "Card Colors Hardcoded",
            "Admin Theme Not Connected",
          ]}
        />

        <AuditCard
          title="Security Audit"
          status="WARNING"
          issues={[
            "Firebase Auth Connected",
            "Role Validation Missing",
            "Admin Permission Missing",
            "Session Audit Missing",
          ]}
        />

        <AuditCard
          title="Referral Audit"
          status="WARNING"
          issues={[
            "Referral Data Connected",
            "Referral Analytics Missing",
            "Referral Rank Missing",
            "Referral Growth Metrics Missing",
          ]}
        />

      </div>

      <div className="mt-8 rounded-3xl border border-white/10 bg-[#111111] p-6">

        <h2 className="mb-4 text-2xl font-black">
          Missing Features
        </h2>

        <div className="grid gap-3 md:grid-cols-2">

          {[
            "Product Sales Dashboard",
            "Delivered Orders Analytics",
            "Creator Economy",
            "Creator Wallet",
            "Creator Revenue Share",
            "Ad Revenue Dashboard",
            "Referral Analytics",
            "Watch Earn Analytics",
            "Rank Analytics",
            "Commission Analytics",
            "Team Business Analytics",
            "Wallet Analytics",
            "Admin Controls",
            "Dynamic Dashboard Builder",
            "Theme Settings",
            "Affiliate Insights",
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
