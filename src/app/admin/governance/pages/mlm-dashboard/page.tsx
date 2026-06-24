"use client";

import AuditCard from "@/components/governance/AuditCard";

export default function MLMDashboardGovernancePage() {
  const governanceScore = 90;

  return (
    <main className="min-h-screen bg-[#050505] p-6 text-white">

      <div className="mb-8">
        <h1 className="text-4xl font-black">
          MLM Dashboard Governance Audit
        </h1>

        <p className="mt-2 text-gray-400">
          Audit Report for src/app/mlm/dashboard/page.tsx
        </p>
      </div>

      {/* SCORE */}

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

      {/* SUMMARY */}

      <div className="mb-8 grid gap-4 md:grid-cols-4">

        <div className="rounded-2xl bg-green-500/10 p-5">
          <p className="text-sm text-gray-400">Connected</p>
          <h3 className="text-3xl font-black text-green-400">32</h3>
        </div>

        <div className="rounded-2xl bg-red-500/10 p-5">
          <p className="text-sm text-gray-400">Missing</p>
          <h3 className="text-3xl font-black text-red-400">5</h3>
        </div>

        <div className="rounded-2xl bg-yellow-500/10 p-5">
          <p className="text-sm text-gray-400">Warnings</p>
          <h3 className="text-3xl font-black text-yellow-400">4</h3>
        </div>

        <div className="rounded-2xl bg-pink-500/10 p-5">
          <p className="text-sm text-gray-400">Critical</p>
          <h3 className="text-3xl font-black text-pink-400">0</h3>
        </div>

      </div>

      {/* AUDITS */}

      <div className="grid gap-6 md:grid-cols-2">

        <AuditCard
          title="Authentication Audit"
          status="PASS"
          issues={[
            "Firebase Auth Connected",
            "Unauthorized User Redirect Active",
            "Route Protection Working",
            "Session Validation Active"
          ]}
        />

        <AuditCard
          title="Firestore Audit"
          status="PASS"
          issues={[
            "User Document Connected",
            "Realtime Snapshot Active",
            "Live Data Synchronization Working",
            "Firestore Listener Cleanup Added"
          ]}
        />

        <AuditCard
          title="Wallet Audit"
          status="PASS"
          issues={[
            "Total Income Visible",
            "Today's Income Visible",
            "Wallet Module Connected",
            "Income Metrics Working"
          ]}
        />

        <AuditCard
          title="Referral Audit"
          status="PASS"
          issues={[
            "Referral Code Visible",
            "Invite System Connected",
            "Referral Navigation Active",
            "Referral Sharing Ready"
          ]}
        />

        <AuditCard
          title="Team Audit"
          status="PASS"
          issues={[
            "Team Size Visible",
            "Network Module Connected",
            "Realtime Team Metrics Active",
            "Growth Tracking Working"
          ]}
        />

        <AuditCard
          title="Rank Audit"
          status="PASS"
          issues={[
            "Rank System Connected",
            "Rank Display Active",
            "Rank Navigation Working",
            "Achievement Tracking Visible"
          ]}
        />

        <AuditCard
          title="Rewards Audit"
          status="PASS"
          issues={[
            "Reward Count Connected",
            "Reward Metrics Visible",
            "Reward Tracking Active",
            "Realtime Reward Sync Working"
          ]}
        />

        <AuditCard
          title="Notification Audit"
          status="PASS"
          issues={[
            "Unread Notification Counter Active",
            "Notification Route Connected",
            "Realtime Notification Sync Active",
            "Badge System Working"
          ]}
        />

        <AuditCard
          title="Performance Audit"
          status="PASS"
          issues={[
            "Realtime Graph Active",
            "Dynamic Metrics Calculation Working",
            "Reactive Rendering Active",
            "Performance Visualization Working"
          ]}
        />

        <AuditCard
          title="Security Audit"
          status="PASS"
          issues={[
            "Auth Guard Enabled",
            "User Session Validation Active",
            "Protected Dashboard Access",
            "No Public Data Exposure"
          ]}
        />

        <AuditCard
          title="Theme Audit"
          status="WARNING"
          issues={[
            "Hardcoded Colors Found",
            "Theme Context Not Used",
            "Admin Theme Missing",
            "Dynamic Branding Missing"
          ]}
        />

        <AuditCard
          title="Admin Control Audit"
          status="FAIL"
          issues={[
            "Quick Actions Hardcoded",
            "Dashboard Cards Hardcoded",
            "Navigation Menu Hardcoded",
            "Firestore Driven Config Missing"
          ]}
        />

        <AuditCard
          title="Architecture Audit"
          status="WARNING"
          issues={[
            "Dashboard Layout Scalable",
            "Metrics Computation Local",
            "Feature Flags Missing",
            "Partial Admin Control"
          ]}
        />

        <AuditCard
          title="Governance Audit"
          status="WARNING"
          issues={[
            "Audit Logs Missing",
            "Dashboard Health Score Missing",
            "Admin Monitoring Missing",
            "Governance Events Missing"
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
            "Admin Controlled Dashboard",
            "Feature Flag System",
            "Theme Engine Integration",
            "Dashboard Audit Logs",
            "Dashboard Health Score",
            "Governance Monitoring",
            "Realtime Leaderboard",
            "Rank Progress Engine",
            "Goal Tracking System",
            "Dynamic Dashboard Builder",
            "Firestore Driven Quick Actions",
            "Admin Managed Navigation"
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
