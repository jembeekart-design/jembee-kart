"use client";

import AuditCard from "@/components/governance/AuditCard";

export default function WatchEarnGovernancePage() {
  const governanceScore = 41;

  return (
    <main className="min-h-screen bg-[#050505] p-6 text-white">
      {/* HEADER */}

      <div className="mb-8">
        <h1 className="text-4xl font-black">
          Watch & Earn Governance Audit
        </h1>

        <p className="mt-2 text-gray-400">
          Audit Report for src/app/mlm/watch-earn/page.tsx
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
            7
          </h3>
        </div>

        <div className="rounded-2xl bg-red-500/10 p-5">
          <p className="text-sm text-gray-400">
            Missing
          </p>

          <h3 className="text-3xl font-black text-red-400">
            16
          </h3>
        </div>

        <div className="rounded-2xl bg-yellow-500/10 p-5">
          <p className="text-sm text-gray-400">
            Warnings
          </p>

          <h3 className="text-3xl font-black text-yellow-400">
            9
          </h3>
        </div>

        <div className="rounded-2xl bg-pink-500/10 p-5">
          <p className="text-sm text-gray-400">
            Critical
          </p>

          <h3 className="text-3xl font-black text-pink-400">
            6
          </h3>
        </div>
      </div>

      {/* AUDIT CARDS */}

      <div className="grid gap-6 md:grid-cols-2">

        <AuditCard
          title="Video Feed Audit"
          status="PASS"
          issues={[
            "Vertical Feed Present",
            "Auto Play Working",
            "Pause / Play Working",
            "Video Loader Connected"
          ]}
        />

        <AuditCard
          title="Reward Engine Audit"
          status="FAIL"
          issues={[
            "Coins Hardcoded",
            "Reward Logic Client Side",
            "Reward Validation Missing",
            "Reward Rules Not Admin Controlled"
          ]}
        />

        <AuditCard
          title="Firestore Audit"
          status="FAIL"
          issues={[
            "Reward Sync Missing",
            "Transaction Logs Missing",
            "Reward Collection Missing",
            "Watch History Missing"
          ]}
        />

        <AuditCard
          title="Security Audit"
          status="FAIL"
          issues={[
            "No Device Validation",
            "No Session Validation",
            "Reward Bypass Risk",
            "No Cloud Verification"
          ]}
        />

        <AuditCard
          title="Anti Fraud Audit"
          status="FAIL"
          issues={[
            "Multi Device Detection Missing",
            "Bot Detection Missing",
            "Watch Validation Missing",
            "Duplicate Reward Prevention Missing"
          ]}
        />

        <AuditCard
          title="Admin Control Audit"
          status="FAIL"
          issues={[
            "Coins Hardcoded",
            "Ad Duration Hardcoded",
            "Reward Amount Hardcoded",
            "No Admin Config Engine"
          ]}
        />

        <AuditCard
          title="Theme Audit"
          status="WARNING"
          issues={[
            "Theme Context Missing",
            "Admin Theme Missing",
            "Brand Engine Missing",
            "Dynamic Theme Missing"
          ]}
        />

        <AuditCard
          title="Architecture Audit"
          status="WARNING"
          issues={[
            "Business Logic In UI",
            "Reward Engine In Client",
            "No Service Layer",
            "Not Enterprise Ready"
          ]}
        />

        <AuditCard
          title="Scalability Audit"
          status="WARNING"
          issues={[
            "Large Feed Risk",
            "No Pagination",
            "No Feed Optimization",
            "Memory Leak Risk"
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
            "Watch Transaction Collection",
            "Reward Transaction Logs",
            "Reward Approval Engine",
            "Cloud Function Reward Distribution",
            "Anti Fraud Engine",
            "Bot Detection",
            "Device Validation",
            "Session Validation",
            "Watch Analytics",
            "Reward Analytics",
            "Wallet Integration",
            "Reward Unlock Rules",
            "Admin Reward Controls",
            "Feature Flags",
            "Governance Scanner",
            "Audit Logs",
            "Video Completion Validation",
            "Suspicious Activity Detection",
            "Reward Rollback System",
            "Realtime Reward Sync"
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
          <div>UI Score : 95/100</div>
          <div>Reward Engine Score : 20/100</div>
          <div>Firestore Score : 15/100</div>
          <div>Security Score : 10/100</div>
          <div>Admin Control Score : 0/100</div>
          <div>Governance Score : 5/100</div>
        </div>

        <div className="mt-5 border-t border-white/10 pt-5">
          <p className="text-lg font-black text-red-400">
            Final Score: 41/100
          </p>

          <p className="mt-2 text-sm text-gray-400">
            Watch & Earn page UI bahut strong hai lekin reward
            system client-side hardcoded hai. Production launch
            se pehle reward engine, anti-fraud system, wallet
            integration, Firestore logging aur admin-controlled
            configuration mandatory hai.
          </p>
        </div>

      </div>
    </main>
  );
}
