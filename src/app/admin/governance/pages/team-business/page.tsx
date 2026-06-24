"use client";

import AuditCard from "@/components/governance/AuditCard";

export default function TeamBusinessGovernancePage() {
  const governanceScore = 28;

  return (
    <main className="min-h-screen bg-[#050505] p-6 text-white">

      <div className="mb-8">
        <h1 className="text-4xl font-black">
          Team Business Governance Audit
        </h1>

        <p className="mt-2 text-gray-400">
          Audit Report for src/app/mlm/team-business/page.tsx
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
            3
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
            5
          </h3>
        </div>

        <div className="rounded-2xl bg-pink-500/10 p-5">
          <p className="text-sm text-gray-400">
            Critical
          </p>
          <h3 className="text-3xl font-black text-pink-400">
            4
          </h3>
        </div>

      </div>

      {/* AUDIT CARDS */}

      <div className="grid gap-6 md:grid-cols-2">

        <AuditCard
          title="UI Audit"
          status="PASS"
          issues={[
            "Clean Layout",
            "Business Summary Card Present",
            "Member Cards Present",
            "Mobile Responsive"
          ]}
        />

        <AuditCard
          title="Firestore Audit"
          status="FAIL"
          issues={[
            "No Firestore Collection",
            "No Realtime Sync",
            "No Team Query",
            "No Business Aggregation"
          ]}
        />

        <AuditCard
          title="Business Logic Audit"
          status="CRITICAL"
          issues={[
            "Business Data Hardcoded",
            "Members Hardcoded",
            "Calculation On Client",
            "No Validation Layer"
          ]}
        />

        <AuditCard
          title="Admin Control Audit"
          status="FAIL"
          issues={[
            "No Admin Configuration",
            "No Dynamic Settings",
            "No Business Rules Engine",
            "No Governance Controls"
          ]}
        />

        <AuditCard
          title="Security Audit"
          status="CRITICAL"
          issues={[
            "No Auth Guard",
            "No Ownership Validation",
            "No Access Control",
            "No Audit Trail"
          ]}
        />

        <AuditCard
          title="Analytics Audit"
          status="FAIL"
          issues={[
            "No Growth Analytics",
            "No Team Insights",
            "No Charts",
            "No Historical Trends"
          ]}
        />

        <AuditCard
          title="Scalability Audit"
          status="FAIL"
          issues={[
            "Static Dataset",
            "No Pagination",
            "No Search",
            "Large Team Risk"
          ]}
        />

        <AuditCard
          title="Architecture Audit"
          status="FAIL"
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
            "Realtime Team Business",
            "Firestore Team Collection",
            "Team Analytics",
            "Growth Charts",
            "Business History",
            "Search Members",
            "Pagination",
            "Level Wise Business",
            "Admin Controls",
            "Business Rules Engine",
            "Audit Logs",
            "Role Based Access",
            "Governance Scanner",
            "Theme Engine",
            "Export Reports",
            "Commission Mapping",
            "Rank Contribution Tracking",
            "Enterprise Analytics Dashboard"
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
