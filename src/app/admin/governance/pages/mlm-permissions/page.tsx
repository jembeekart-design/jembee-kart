"use client";

import AuditCard from "@/components/governance/AuditCard";

export default function MLMPermissionsGovernancePage() {
  const governanceScore = 58;

  return (
    <main className="min-h-screen bg-[#050505] p-6 text-white">

      {/* HEADER */}

      <div className="mb-8">
        <h1 className="text-4xl font-black">
          MLM Permissions Governance Audit
        </h1>

        <p className="mt-2 text-gray-400">
          Audit Report for src/app/mlm/permissions/page.tsx
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

      {/* SUMMARY */}

      <div className="mb-8 grid gap-4 md:grid-cols-4">

        <div className="rounded-2xl bg-green-500/10 p-5">
          <p className="text-sm text-gray-400">
            Connected
          </p>

          <h3 className="text-3xl font-black text-green-400">
            8
          </h3>
        </div>

        <div className="rounded-2xl bg-red-500/10 p-5">
          <p className="text-sm text-gray-400">
            Missing
          </p>

          <h3 className="text-3xl font-black text-red-400">
            10
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
            1
          </h3>
        </div>

      </div>

      {/* AUDIT CARDS */}

      <div className="grid gap-6 md:grid-cols-2">

        <AuditCard
          title="Permissions UI Audit"
          status="PASS"
          issues={[
            "Camera Permission UI Present",
            "Microphone Permission UI Present",
            "Notification Permission UI Present",
            "Continue Flow Available"
          ]}
        />

        <AuditCard
          title="Browser API Audit"
          status="PASS"
          issues={[
            "Permissions API Used",
            "MediaDevices API Used",
            "Notification API Used",
            "Permission Status Validation Working"
          ]}
        />

        <AuditCard
          title="Authentication Audit"
          status="FAIL"
          issues={[
            "Auth Guard Missing",
            "Anonymous Access Allowed",
            "User Validation Missing",
            "Protected Route Missing"
          ]}
        />

        <AuditCard
          title="Firestore Audit"
          status="FAIL"
          issues={[
            "Permission Logs Missing",
            "User Sync Missing",
            "Realtime Tracking Missing",
            "Firestore Integration Missing"
          ]}
        />

        <AuditCard
          title="Admin Control Audit"
          status="FAIL"
          issues={[
            "Permissions Hardcoded",
            "Redirect Hardcoded",
            "No Dynamic Settings",
            "No Admin Controls"
          ]}
        />

        <AuditCard
          title="Security Audit"
          status="WARNING"
          issues={[
            "Permission Requests Present",
            "No Abuse Detection",
            "No Audit Trail",
            "No Permission Verification Logs"
          ]}
        />

        <AuditCard
          title="Theme Audit"
          status="WARNING"
          issues={[
            "Custom UI Present",
            "Theme Context Missing",
            "Theme Engine Missing",
            "Admin Theme Control Missing"
          ]}
        />

        <AuditCard
          title="Architecture Audit"
          status="WARNING"
          issues={[
            "Good Component Structure",
            "Hardcoded Redirect Found",
            "No Service Layer",
            "Not Fully Enterprise Ready"
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
            "Firestore Permission Logs",
            "Permission History",
            "Permission Analytics",
            "Permission Audit Trail",
            "Feature Flags",
            "Role Based Access",
            "Admin Permission Settings",
            "Push Token Sync",
            "Dynamic Redirect Config",
            "Realtime Permission Monitoring",
            "Theme Engine Integration",
            "Governance Scanner Integration"
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
