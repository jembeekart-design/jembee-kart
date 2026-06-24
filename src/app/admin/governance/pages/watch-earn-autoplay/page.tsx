"use client";

import AuditCard from "@/components/governance/AuditCard";

export default function WatchEarnAutoPlayGovernancePage() {
  const governanceScore = 78;

  return (
    <main className="min-h-screen bg-[#050505] p-6 text-white">
      <div className="mb-8">
        <h1 className="text-4xl font-black">
          Video AutoPlay Audit
        </h1>

        <p className="mt-2 text-gray-400">
          Audit Report for
          src/app/mlm/watch-earn/hooks/useVideoAutoPlay.ts
        </p>
      </div>

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

      <div className="grid gap-6 md:grid-cols-2">
        <AuditCard
          title="Hook Architecture"
          status="PASS"
          issues={[
            "Reusable Hook",
            "Simple Implementation",
            "Effect Dependency Correct",
            "No State Leak"
          ]}
        />

        <AuditCard
          title="Playback Audit"
          status="WARNING"
          issues={[
            "Auto Play Depends On Browser",
            "Muted Handling Missing",
            "Audio Permission Missing",
            "Play Failure Possible"
          ]}
        />

        <AuditCard
          title="Performance Audit"
          status="WARNING"
          issues={[
            "QuerySelectorAll On Every Change",
            "Loops Through All Videos",
            "Large Feed Risk",
            "No Optimization Layer"
          ]}
        />

        <AuditCard
          title="Security Audit"
          status="PASS"
          issues={[
            "No Firestore Access",
            "No Sensitive Data",
            "No Auth Risk",
            "Client Safe"
          ]}
        />

        <AuditCard
          title="Governance Audit"
          status="FAIL"
          issues={[
            "Hardcoded Video Selector",
            "No Admin Control",
            "No Config Layer",
            "No Governance Flags"
          ]}
        />

        <AuditCard
          title="Scalability Audit"
          status="WARNING"
          issues={[
            "Poor For 100+ Videos",
            "DOM Traversal Heavy",
            "No Ref Mapping",
            "No Virtualization"
          ]}
        />

        <AuditCard
          title="Memory Audit"
          status="PASS"
          issues={[
            "No Listener Leak",
            "No Timer Leak",
            "No Subscription Leak",
            "Clean Lifecycle"
          ]}
        />

        <AuditCard
          title="Production Readiness"
          status="PASS"
          issues={[
            "Works For MVP",
            "Easy To Maintain",
            "Readable Logic",
            "Stable Hook Design"
          ]}
        />
      </div>

      <div className="mt-8 rounded-3xl border border-white/10 bg-[#111111] p-6">
        <h2 className="mb-4 text-2xl font-black">
          Missing Features
        </h2>

        <div className="grid gap-3 md:grid-cols-2">
          {[
            "Ref Based Video Management",
            "IntersectionObserver",
            "Auto Sound Management",
            "Mute Toggle Support",
            "Performance Analytics",
            "Video Lifecycle Tracking",
            "Admin Playback Config",
            "Governance Scanner Integration",
            "Feed Optimization Engine",
            "Playback Failure Recovery",
            "Mobile Browser Handling",
            "Large Feed Support"
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
