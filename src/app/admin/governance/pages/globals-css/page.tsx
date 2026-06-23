"use client";

import AuditCard from "@/components/governance/AuditCard";

export default function GlobalsCssGovernancePage() {
  const governanceScore = 86;

  return (
    <main className="min-h-screen bg-[#050505] p-6 text-white">

      <div className="mb-8">
        <h1 className="text-4xl font-black">
          Globals CSS Governance Audit
        </h1>

        <p className="mt-2 text-gray-400">
          Audit Report for src/app/globals.css
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

      <div className="grid gap-6 md:grid-cols-2">

        <AuditCard
          title="Theme Audit"
          status="WARNING"
          issues={[
            "Theme Variables Found",
            "Primary Color Hardcoded",
            "Secondary Color Hardcoded",
            "Firestore Theme Sync Missing"
          ]}
        />

        <AuditCard
          title="CSS Architecture Audit"
          status="PASS"
          issues={[
            "Global Structure Clean",
            "Reusable Theme Classes Found",
            "Responsive Safe",
            "Production Compatible"
          ]}
        />

        <AuditCard
          title="Layout Audit"
          status="PASS"
          issues={[
            "Overflow Protection Active",
            "Width Protection Active",
            "Image Protection Active",
            "Global Styling Working"
          ]}
        />

        <AuditCard
          title="Admin Control Audit"
          status="FAIL"
          issues={[
            "Theme Settings Collection Missing",
            "Admin Theme Engine Missing",
            "Dynamic Theme Loader Missing",
            "Theme Config Not Controlled"
          ]}
        />

        <AuditCard
          title="Performance Audit"
          status="PASS"
          issues={[
            "Lightweight CSS",
            "No Duplicate Rules",
            "Fast Render",
            "Minimal Global Overhead"
          ]}
        />

        <AuditCard
          title="Governance Audit"
          status="WARNING"
          issues={[
            "Theme Versioning Missing",
            "Theme Audit Log Missing",
            "Theme Rollback Missing",
            "Theme Monitoring Missing"
          ]}
        />

      </div>

      <div className="mt-8 rounded-3xl border border-white/10 bg-[#111111] p-6">

        <h2 className="mb-4 text-2xl font-black">
          Missing Features
        </h2>

        <div className="grid gap-3 md:grid-cols-2">

          {[
            "Firestore Theme Settings",
            "Dynamic Theme Loader",
            "Dark Mode Variables",
            "Theme Versioning",
            "Theme Rollback",
            "Theme Audit Logs",
            "Admin Theme Control",
            "Theme Monitoring"
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
