"use client";

import AuditCard from "@/components/governance/AuditCard";

export default function FloatingRewardsGovernancePage() {
  const governanceScore = 82;

  return (
    <main className="min-h-screen bg-[#050505] p-6 text-white">

      <div className="mb-8">
        <h1 className="text-4xl font-black">
          Floating Rewards Audit
        </h1>

        <p className="mt-2 text-gray-400">
          Audit Report for
          {" "}
          src/app/mlm/watch-earn/components/FloatingRewards.tsx
        </p>
      </div>

      {/* SCORE */}

      <div className="mb-8 rounded-3xl border border-white/10 bg-[#111111] p-6">
        <p className="text-sm text-gray-400">
          Governance Score
        </p>

        <h2 className="mt-2 text-6xl font-black text-yellow-400">
          {governanceScore}/100
        </h2>

        <p className="mt-3 text-yellow-400">
          Production Ready: PARTIAL
        </p>
      </div>

      {/* AUDITS */}

      <div className="grid gap-6 md:grid-cols-2">

        <AuditCard
          title="UI Audit"
          status="PASS"
          issues={[
            "Reward Popup Visible",
            "Good User Feedback",
            "Modern Animation",
            "Mobile Friendly"
          ]}
        />

        <AuditCard
          title="Reward System Audit"
          status="WARNING"
          issues={[
            "Reward Source Not Verified",
            "No Reward Validation",
            "No Reward Logs",
            "No Duplicate Check"
          ]}
        />

        <AuditCard
          title="Animation Audit"
          status="PASS"
          issues={[
            "Smooth Coin Animation",
            "Lightweight Effects",
            "Visual Reward Feedback",
            "No Blocking UI"
          ]}
        />

        <AuditCard
          title="Performance Audit"
          status="WARNING"
          issues={[
            "Math.random Runs On Render",
            "Coin Positions Regenerate",
            "Potential Repaint Cost",
            "Animation Optimization Needed"
          ]}
        />

        <AuditCard
          title="Security Audit"
          status="FAIL"
          issues={[
            "Reward Validation Missing",
            "No Fraud Detection",
            "No Server Verification",
            "No Audit Trail"
          ]}
        />

        <AuditCard
          title="Admin Control Audit"
          status="FAIL"
          issues={[
            "Reward Values Hardcoded",
            "Animation Count Hardcoded",
            "No Admin Controls",
            "No Firestore Config"
          ]}
        />

        <AuditCard
          title="Theme Audit"
          status="WARNING"
          issues={[
            "Theme Context Missing",
            "Dynamic Branding Missing",
            "Color Controls Missing",
            "Admin Theme Control Missing"
          ]}
        />

        <AuditCard
          title="Architecture Audit"
          status="WARNING"
          issues={[
            "UI Only Component",
            "No Service Layer",
            "No Analytics Integration",
            "No Governance Scanner Hooks"
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
            "Reward Validation Engine",
            "Reward Audit Logs",
            "Fraud Detection",
            "Server Side Verification",
            "Firestore Reward Tracking",
            "Reward Analytics",
            "Admin Reward Controls",
            "Feature Flags",
            "Theme Engine Integration",
            "Animation Configuration",
            "Reward History Link",
            "Reward Expiry Logic",
            "Governance Scanner Integration",
            "Performance Monitoring",
            "AB Testing Support",
            "Event Tracking"
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
