// src/app/admin/governance/pages/account/page.tsx

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

export default function AccountGovernancePage() {
  return (
    <main className="min-h-screen bg-[#050505] p-6 text-white">

      <div className="mb-8">
        <h1 className="text-4xl font-black">
          Account Page Governance Audit
        </h1>

        <p className="mt-2 text-gray-400">
          Audit Report for src/app/account/page.tsx
        </p>
      </div>

      <div className="mb-8 rounded-3xl border border-white/10 bg-[#111111] p-6">
        <p className="text-sm text-gray-400">
          Governance Score
        </p>

        <h2 className="mt-2 text-6xl font-black text-pink-400">
          71/100
        </h2>

        <p className="mt-3 text-red-400">
          Production Ready: NO
        </p>
      </div>

      <div className="mb-8 grid gap-4 md:grid-cols-4">

        <div className="rounded-2xl bg-green-500/10 p-5">
          <p className="text-sm text-gray-400">Connected</p>
          <h3 className="text-3xl font-black text-green-400">15</h3>
        </div>

        <div className="rounded-2xl bg-red-500/10 p-5">
          <p className="text-sm text-gray-400">Missing</p>
          <h3 className="text-3xl font-black text-red-400">8</h3>
        </div>

        <div className="rounded-2xl bg-yellow-500/10 p-5">
          <p className="text-sm text-gray-400">Warnings</p>
          <h3 className="text-3xl font-black text-yellow-400">5</h3>
        </div>

        <div className="rounded-2xl bg-pink-500/10 p-5">
          <p className="text-sm text-gray-400">Critical</p>
          <h3 className="text-3xl font-black text-pink-400">2</h3>
        </div>

      </div>

      <div className="grid gap-6 md:grid-cols-2">

        <AuditCard
          title="Route Audit"
          status="PASS"
          issues={[
            "Account Route Found",
            "Firebase Auth Connected",
            "Realtime Sync Connected",
            "Logout Connected",
          ]}
        />

        <AuditCard
          title="Firestore Audit"
          status="WARNING"
          issues={[
            "users Collection Connected",
            "walletBalance Connected",
            "totalIncome Connected",
            "walletTransactions Missing",
            "withdrawRequests Missing",
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
            "withdrawableWallet Missing",
          ]}
        />

        <AuditCard
          title="Theme Audit"
          status="FAIL"
          issues={[
            "bg-[#f6f7fb] Hardcoded",
            "bg-white Hardcoded",
            "text-black Hardcoded",
            "Admin Theme Not Connected",
          ]}
        />

        <AuditCard
          title="Admin Control Audit"
          status="FAIL"
          issues={[
            "Account Menu Hardcoded",
            "Profile Layout Hardcoded",
            "Wallet Card Hardcoded",
            "No Dynamic Settings",
          ]}
        />

        <AuditCard
          title="Referral Audit"
          status="WARNING"
          issues={[
            "Referral Code Connected",
            "Sponsor Connected",
            "Referral Analytics Missing",
            "Referral Rank Missing",
          ]}
        />

        <AuditCard
          title="Watch Earn Audit"
          status="FAIL"
          issues={[
            "Cycle Status Missing",
            "Videos Watched Missing",
            "Locked Reward Missing",
            "Qualified Sales Missing",
          ]}
        />

        <AuditCard
          title="Creator Economy Audit"
          status="FAIL"
          issues={[
            "Creator Wallet Missing",
            "Creator Earnings Missing",
            "Creator Dashboard Missing",
          ]}
        />

        <AuditCard
          title="Security Audit"
          status="WARNING"
          issues={[
            "Firebase Auth Connected",
            "Role Validation Missing",
            "Session Audit Missing",
          ]}
        />

        <AuditCard
          title="Ecommerce Audit"
          status="PASS"
          issues={[
            "Orders Connected",
            "Wishlist Connected",
            "Address Connected",
            "Payment Methods Connected",
          ]}
        />

      </div>

    </main>
  );
}
