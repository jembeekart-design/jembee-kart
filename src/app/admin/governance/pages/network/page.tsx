"use client";

import AuditCard from "@/components/governance/AuditCard";

export default function NetworkGovernancePage() {
  const governanceScore = 86;

  return (
    <main className="min-h-screen bg-[#050505] p-6 text-white">

      <div className="mb-8">
        <h1 className="text-4xl font-black">
          MLM Network Governance Audit
        </h1>

        <p className="mt-2 text-gray-400">
          Audit Report for src/app/mlm/network/page.tsx
        </p>
      </div>

      <div className="mb-8 rounded-3xl border border-white/10 bg-[#111111] p-6">

        <p className="text-sm text-gray-400">
          Governance Score
        </p>

        <h2 className="mt-2 text-6xl font-black text-green-400">
          {governanceScore}/100
        </h2>

        <p className="mt-3 text-green-400">
          Production Ready: YES
        </p>

      </div>

      <div className="mb-8 grid gap-4 md:grid-cols-4">

        <div className="rounded-2xl bg-green-500/10 p-5">
          <p className="text-sm text-gray-400">Connected</p>
          <h3 className="text-3xl font-black text-green-400">28</h3>
        </div>

        <div className="rounded-2xl bg-red-500/10 p-5">
          <p className="text-sm text-gray-400">Missing</p>
          <h3 className="text-3xl font-black text-red-400">5</h3>
        </div>

        <div className="rounded-2xl bg-yellow-500/10 p-5">
          <p className="text-sm text-gray-400">Warnings</p>
          <h3 className="text-3xl font-black text-yellow-400">6</h3>
        </div>

        <div className="rounded-2xl bg-pink-500/10 p-5">
          <p className="text-sm text-gray-400">Critical</p>
          <h3 className="text-3xl font-black text-pink-400">1</h3>
        </div>

      </div>

      <div className="grid gap-6 md:grid-cols-2">

        <AuditCard
          title="Network Engine Audit"
          status="PASS"
          issues={[
            "Level 1 Query Working",
            "Level 2 Query Working",
            "Level 3 Query Working",
            "Network Tree Rendering Working"
          ]}
        />

        <AuditCard
          title="Firestore Audit"
          status="PASS"
          issues={[
            "Users Collection Connected",
            "SponsorId Query Working",
            "Multi Level Fetch Working",
            "Business Metrics Loaded"
          ]}
        />

        <AuditCard
          title="MLM Architecture Audit"
          status="PASS"
          issues={[
            "Referral Tree Active",
            "Sponsor Chain Working",
            "Direct Team Count Working",
            "Total Team Count Working"
          ]}
        />

        <AuditCard
          title="Performance Audit"
          status="PASS"
          issues={[
            "Chunk Query Optimization Found",
            "IN Query Limit Protected",
            "Controlled Level Loading",
            "Efficient Data Mapping"
          ]}
        />

        <AuditCard
          title="Business Audit"
          status="PASS"
          issues={[
            "Lifetime Business Loaded",
            "Direct Business Loaded",
            "Team Business Loaded",
            "Income Metrics Loaded"
          ]}
        />

        <AuditCard
          title="Theme Audit"
          status="WARNING"
          issues={[
            "Hardcoded Violet Theme Found",
            "Hardcoded Gradient Found",
            "Theme Context Missing",
            "Admin Theme Control Missing"
          ]}
        />

        <AuditCard
          title="Admin Control Audit"
          status="FAIL"
          issues={[
            "Max Level Hardcoded (3)",
            "Network Rules Not Config Driven",
            "Business Rules Not Dynamic",
            "Admin Settings Missing"
          ]}
        />

        <AuditCard
          title="Security Audit"
          status="CRITICAL"
          issues={[
            "Email Visible To Downline",
            "Personal User Data Exposed",
            "Role Validation Missing",
            "Privacy Layer Missing"
          ]}
        />

        <AuditCard
          title="Scalability Audit"
          status="WARNING"
          issues={[
            "Recursive Query Missing",
            "Large Team Limitation Exists",
            "Pagination Missing",
            "Infinite Tree Support Missing"
          ]}
        />

        <AuditCard
          title="Enterprise Audit"
          status="WARNING"
          issues={[
            "Only 3 Levels Supported",
            "No Analytics Layer",
            "No Rank Visualization",
            "No Network Search"
          ]}
        />

      </div>

      <div className="mt-8 rounded-3xl border border-white/10 bg-[#111111] p-6">

        <h2 className="mb-4 text-2xl font-black">
          Missing Features
        </h2>

        <div className="grid gap-3 md:grid-cols-2">

          {[
            "Admin Controlled Max Levels",
            "Theme Engine Integration",
            "Network Search",
            "Network Analytics",
            "Rank Tree Visualization",
            "Pagination System",
            "Privacy Protection Layer",
            "Role Based Access Control",
            "Network Export",
            "Infinite Tree Engine",
            "Config Driven MLM Rules",
            "Governance Logging"
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
