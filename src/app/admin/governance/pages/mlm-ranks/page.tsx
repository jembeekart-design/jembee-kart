"use client";

import AuditCard from "@/components/governance/AuditCard";

export default function MLMRanksGovernancePage() {
  const governanceScore = 42;

  return (
    <main className="min-h-screen bg-[#050505] p-6 text-white">

      <div className="mb-8">
        <h1 className="text-4xl font-black">
          MLM Ranks Governance Audit
        </h1>

        <p className="mt-2 text-gray-400">
          Audit Report for src/app/mlm/ranks/page.tsx
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
            5
          </h3>
        </div>

        <div className="rounded-2xl bg-red-500/10 p-5">
          <p className="text-sm text-gray-400">
            Missing
          </p>
          <h3 className="text-3xl font-black text-red-400">
            14
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
            3
          </h3>
        </div>

      </div>

      {/* AUDIT CARDS */}

      <div className="grid gap-6 md:grid-cols-2">

        <AuditCard
          title="Ranks UI Audit"
          status="PASS"
          issues={[
            "Rank Cards Present",
            "Progress Bar Present",
            "Achievement Section Present",
            "Responsive Layout Working"
          ]}
        />

        <AuditCard
          title="Firestore Audit"
          status="FAIL"
          issues={[
            "Rank Data Hardcoded",
            "No Firestore Rank Collection",
            "Realtime Rank Sync Missing",
            "No Dynamic Rewards"
          ]}
        />

        <AuditCard
          title="Progress Audit"
          status="WARNING"
          issues={[
            "Progress Bar Working",
            "Target Calculation Hardcoded",
            "No Live Team Count",
            "No Auto Rank Upgrade"
          ]}
        />

        <AuditCard
          title="Admin Control Audit"
          status="FAIL"
          issues={[
            "Rank Names Hardcoded",
            "Rank Rewards Hardcoded",
            "Member Targets Hardcoded",
            "No Admin Configuration"
          ]}
        />

        <AuditCard
          title="Theme Audit"
          status="WARNING"
          issues={[
            "Premium UI Present",
            "Theme Context Missing",
            "Theme Engine Missing",
            "Admin Branding Missing"
          ]}
        />

        <AuditCard
          title="Security Audit"
          status="FAIL"
          issues={[
            "No Auth Guard",
            "No User Validation",
            "No Access Logging",
            "No Permission Control"
          ]}
        />

        <AuditCard
          title="Scalability Audit"
          status="WARNING"
          issues={[
            "Static Rank System",
            "No Rank Engine",
            "No Achievement Service",
            "Future Scaling Limited"
          ]}
        />

        <AuditCard
          title="Architecture Audit"
          status="FAIL"
          issues={[
            "Business Rules Hardcoded",
            "Rewards Hardcoded",
            "No Service Layer",
            "Not Governance Compliant"
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
            "Firestore Rank Collection",
            "Realtime Rank Engine",
            "Auto Rank Upgrade",
            "Rank Achievement Logs",
            "Rank History",
            "Admin Rank Builder",
            "Dynamic Rewards",
            "Rank Analytics",
            "Rank Notifications",
            "Governance Scanner",
            "Theme Engine",
            "Role Based Access",
            "Audit Logs",
            "Feature Flags",
            "Version Control",
            "Enterprise Rank System"
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
