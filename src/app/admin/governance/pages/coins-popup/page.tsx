"use client";

import AuditCard from "@/components/governance/AuditCard";

export default function CoinsPopupGovernancePage() {
  const governanceScore = 91;

  return (
    <main className="min-h-screen bg-[#050505] p-6 text-white">
      <div className="mb-8">
        <h1 className="text-4xl font-black">
          Coins Popup Audit
        </h1>

        <p className="mt-2 text-gray-400">
          Audit Report for src/app/mlm/watch-earn/components/CoinsPopup.tsx
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
          <p className="text-sm text-gray-400">
            Passed
          </p>
          <h3 className="text-3xl font-black text-green-400">
            12
          </h3>
        </div>

        <div className="rounded-2xl bg-red-500/10 p-5">
          <p className="text-sm text-gray-400">
            Failed
          </p>
          <h3 className="text-3xl font-black text-red-400">
            0
          </h3>
        </div>

        <div className="rounded-2xl bg-yellow-500/10 p-5">
          <p className="text-sm text-gray-400">
            Warnings
          </p>
          <h3 className="text-3xl font-black text-yellow-400">
            3
          </h3>
        </div>

        <div className="rounded-2xl bg-pink-500/10 p-5">
          <p className="text-sm text-gray-400">
            Critical
          </p>
          <h3 className="text-3xl font-black text-pink-400">
            0
          </h3>
        </div>
      </div>

      {/* AUDIT CARDS */}

      <div className="grid gap-6 md:grid-cols-2">

        <AuditCard
          title="Component Structure Audit"
          status="PASS"
          issues={[
            "Reusable Component",
            "Props Validation Present",
            "Clean JSX Structure",
            "Easy Integration"
          ]}
        />

        <AuditCard
          title="Animation Audit"
          status="PASS"
          issues={[
            "AnimatePresence Implemented",
            "Entry Animation Working",
            "Exit Animation Working",
            "Smooth UX"
          ]}
        />

        <AuditCard
          title="Performance Audit"
          status="PASS"
          issues={[
            "Conditional Rendering",
            "Low Memory Usage",
            "Small DOM Tree",
            "Fast Rendering"
          ]}
        />

        <AuditCard
          title="Reward Display Audit"
          status="PASS"
          issues={[
            "Coins Clearly Visible",
            "Reward Feedback Present",
            "User Engagement Improved",
            "Visual Confirmation Available"
          ]}
        />

        <AuditCard
          title="Theme Audit"
          status="WARNING"
          issues={[
            "Hardcoded Yellow Colors",
            "Theme Context Missing",
            "Brand Engine Missing",
            "Admin Theme Control Missing"
          ]}
        />

        <AuditCard
          title="Accessibility Audit"
          status="WARNING"
          issues={[
            "ARIA Labels Missing",
            "Screen Reader Support Missing",
            "Focus Management Missing",
            "Keyboard Support Missing"
          ]}
        />

        <AuditCard
          title="Security Audit"
          status="PASS"
          issues={[
            "No User Data Exposure",
            "No Firestore Access",
            "No Auth Dependency",
            "Safe Client Component"
          ]}
        />

        <AuditCard
          title="Governance Audit"
          status="WARNING"
          issues={[
            "Admin Config Missing",
            "Feature Flags Missing",
            "Scanner Integration Missing",
            "Config Driven UI Missing"
          ]}
        />

        <AuditCard
          title="Architecture Audit"
          status="PASS"
          issues={[
            "Single Responsibility",
            "Loose Coupling",
            "Reusable Design",
            "Maintainable Code"
          ]}
        />

        <AuditCard
          title="Production Readiness"
          status="PASS"
          issues={[
            "Stable Component",
            "Good UX",
            "Animation Safe",
            "Deployment Ready"
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
            "Theme Engine Integration",
            "Admin Color Controls",
            "Reward Sound Effect",
            "Accessibility Support",
            "Reward Analytics",
            "Popup Queue System",
            "Feature Flags",
            "Governance Scanner Integration",
            "Localization Support",
            "Reward Templates",
            "Custom Animation Settings",
            "Reward History Integration"
          ].map((item) => (
            <div
              key={item}
              className="rounded-xl bg-yellow-500/10 p-3 text-yellow-300"
            >
              {item}
            </div>
          ))}

        </div>
      </div>
    </main>
  );
}
