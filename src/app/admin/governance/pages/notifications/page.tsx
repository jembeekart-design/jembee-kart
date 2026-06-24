"use client";

import AuditCard from "@/components/governance/AuditCard";

export default function NotificationsGovernancePage() {
  const governanceScore = 52;

  return (
    <main className="min-h-screen bg-[#050505] p-6 text-white">

      <div className="mb-8">
        <h1 className="text-4xl font-black">
          MLM Notifications Governance Audit
        </h1>

        <p className="mt-2 text-gray-400">
          Audit Report for src/app/mlm/notifications/page.tsx
        </p>
      </div>

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

      <div className="mb-8 grid gap-4 md:grid-cols-4">

        <div className="rounded-2xl bg-green-500/10 p-5">
          <p className="text-sm text-gray-400">Connected</p>
          <h3 className="text-3xl font-black text-green-400">8</h3>
        </div>

        <div className="rounded-2xl bg-red-500/10 p-5">
          <p className="text-sm text-gray-400">Missing</p>
          <h3 className="text-3xl font-black text-red-400">15</h3>
        </div>

        <div className="rounded-2xl bg-yellow-500/10 p-5">
          <p className="text-sm text-gray-400">Warnings</p>
          <h3 className="text-3xl font-black text-yellow-400">7</h3>
        </div>

        <div className="rounded-2xl bg-pink-500/10 p-5">
          <p className="text-sm text-gray-400">Critical</p>
          <h3 className="text-3xl font-black text-pink-400">2</h3>
        </div>

      </div>

      <div className="grid gap-6 md:grid-cols-2">

        <AuditCard
          title="Notification Engine Audit"
          status="FAIL"
          issues={[
            "Notifications Hardcoded",
            "Realtime Engine Missing",
            "Firestore Not Connected",
            "Notification Collection Missing"
          ]}
        />

        <AuditCard
          title="Firestore Audit"
          status="FAIL"
          issues={[
            "No Firestore Query",
            "No Notification Stream",
            "No Read Status Tracking",
            "No User Notification Sync"
          ]}
        />

        <AuditCard
          title="Realtime Audit"
          status="FAIL"
          issues={[
            "No onSnapshot Listener",
            "No Live Updates",
            "No Push Event Sync",
            "Static Notification List"
          ]}
        />

        <AuditCard
          title="Theme Audit"
          status="WARNING"
          issues={[
            "Hardcoded Violet Theme",
            "Hardcoded Colors",
            "Theme Context Missing",
            "Admin Theme Missing"
          ]}
        />

        <AuditCard
          title="Admin Control Audit"
          status="FAIL"
          issues={[
            "Notification Rules Missing",
            "Admin Broadcast Missing",
            "Template Control Missing",
            "Config Driven System Missing"
          ]}
        />

        <AuditCard
          title="Security Audit"
          status="WARNING"
          issues={[
            "No User Validation",
            "No Notification Ownership Check",
            "No Read Permission Check",
            "Security Layer Missing"
          ]}
        />

        <AuditCard
          title="MLM Audit"
          status="FAIL"
          issues={[
            "Referral Events Not Connected",
            "Commission Events Missing",
            "Rank Events Missing",
            "Reward Events Missing"
          ]}
        />

        <AuditCard
          title="Architecture Audit"
          status="WARNING"
          issues={[
            "UI Structure Good",
            "Backend Missing",
            "No Event Pipeline",
            "Demo Data Only"
          ]}
        />

        <AuditCard
          title="Analytics Audit"
          status="FAIL"
          issues={[
            "Unread Counter Missing",
            "Read Analytics Missing",
            "Click Tracking Missing",
            "Notification Insights Missing"
          ]}
        />

        <AuditCard
          title="Enterprise Audit"
          status="FAIL"
          issues={[
            "No Pagination",
            "No Infinite Scroll",
            "No Search",
            "No Category Filters"
          ]}
        />

      </div>

      <div className="mt-8 rounded-3xl border border-white/10 bg-[#111111] p-6">

        <h2 className="mb-4 text-2xl font-black">
          Missing Features
        </h2>

        <div className="grid gap-3 md:grid-cols-2">

          {[
            "Firestore Notifications Collection",
            "Realtime Notification Stream",
            "Unread Counter",
            "Mark As Read",
            "Mark All Read",
            "Push Notification System",
            "FCM Integration",
            "Referral Event Notifications",
            "Commission Notifications",
            "Rank Upgrade Notifications",
            "Reward Notifications",
            "Admin Broadcast Notifications",
            "Notification Search",
            "Notification Filters",
            "Notification Analytics",
            "Audit Logging"
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
