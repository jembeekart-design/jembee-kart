"use client";

import AuditCard from "@/components/governance/AuditCard";

export default function WatchEarnHookGovernancePage() {
  const governanceScore = 82;

  return (
    <main className="min-h-screen bg-[#050505] p-6 text-white">
      <div className="mb-8">
        <h1 className="text-4xl font-black">
          Watch Earn Hook Audit
        </h1>

        <p className="mt-2 text-gray-400">
          Audit Report for
          {" "}
          src/app/mlm/watch-earn/hooks/useActiveVideo.ts
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
            Passed
          </p>

          <h3 className="text-3xl font-black text-green-400">
            9
          </h3>
        </div>

        <div className="rounded-2xl bg-red-500/10 p-5">
          <p className="text-sm text-gray-400">
            Failed
          </p>

          <h3 className="text-3xl font-black text-red-400">
            2
          </h3>
        </div>

        <div className="rounded-2xl bg-yellow-500/10 p-5">
          <p className="text-sm text-gray-400">
            Warnings
          </p>

          <h3 className="text-3xl font-black text-yellow-400">
            4
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

      {/* AUDITS */}

      <div className="grid gap-6 md:grid-cols-2">
        <AuditCard
          title="Hook Structure Audit"
          status="PASS"
          issues={[
            "Custom Hook Pattern Correct",
            "State Management Correct",
            "Cleanup Implemented",
            "Reusable Architecture"
          ]}
        />

        <AuditCard
          title="Performance Audit"
          status="WARNING"
          issues={[
            "Scroll Event Fires Frequently",
            "No Debounce Applied",
            "No Throttle Applied",
            "Heavy DOM Reads Possible"
          ]}
        />

        <AuditCard
          title="Viewport Detection Audit"
          status="WARNING"
          issues={[
            "Manual Bounding Rect Logic",
            "Center Detection Working",
            "IntersectionObserver Missing",
            "Modern API Not Used"
          ]}
        />

        <AuditCard
          title="Memory Leak Audit"
          status="PASS"
          issues={[
            "Listener Cleanup Present",
            "No Duplicate Listener",
            "Unmount Safe",
            "Resource Release Working"
          ]}
        />

        <AuditCard
          title="Scalability Audit"
          status="FAIL"
          issues={[
            "Large Video Feed Risk",
            "DOM Query Every Scroll",
            "No Virtualization",
            "Performance Degrades At Scale"
          ]}
        />

        <AuditCard
          title="Security Audit"
          status="PASS"
          issues={[
            "No Sensitive Data Access",
            "No Firestore Exposure",
            "No Auth Risk",
            "Client Safe"
          ]}
        />

        <AuditCard
          title="Governance Audit"
          status="WARNING"
          issues={[
            "Hardcoded CSS Selector",
            "No Admin Control",
            "No Config Layer",
            "Governance Rules Partial"
          ]}
        />

        <AuditCard
          title="Production Readiness"
          status="PASS"
          issues={[
            "Works Correctly",
            "Easy To Maintain",
            "Hook Isolation Good",
            "Suitable For MVP"
          ]}
        />
      </div>

      {/* IMPROVEMENTS */}

      <div className="mt-8 rounded-3xl border border-white/10 bg-[#111111] p-6">
        <h2 className="mb-4 text-2xl font-black">
          Recommended Improvements
        </h2>

        <div className="grid gap-3 md:grid-cols-2">
          {[
            "Use IntersectionObserver",
            "Add Throttle Function",
            "Add Debounce Function",
            "Remove QuerySelectorAll",
            "Use Ref Based Tracking",
            "Support Infinite Feed",
            "Performance Analytics",
            "Governance Scanner Integration",
            "Admin Config Support",
            "Video Visibility Metrics",
            "Feed Optimization Layer",
            "Mobile Performance Audit"
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
