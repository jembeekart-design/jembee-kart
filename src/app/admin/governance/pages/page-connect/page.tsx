"use client";

import AuditCard from "@/components/governance/AuditCard";

export default function PageConnectionAuditPage() {
  const governanceScore = 72;

  return (
    <main className="min-h-screen bg-[#050505] p-6 text-white">

      <div className="mb-8">
        <h1 className="text-4xl font-black">
          Page Connection Audit
        </h1>

        <p className="mt-2 text-gray-400">
          Route & Navigation Connection Scanner
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
          Needs Navigation Fixes
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">

        <AuditCard
          title="Connected Pages"
          status="PASS"
          issues={[
            "/mlm/dashboard",
            "/mlm/wallet",
            "/mlm/network",
            "/mlm/orders",
            "/mlm/support"
          ]}
        />

        <AuditCard
          title="Disconnected Pages"
          status="FAIL"
          issues={[
            "/mlm/watch-earn/upload",
            "/mlm/ranks",
            "/mlm/team-business",
            "/mlm/permissions"
          ]}
        />

        <AuditCard
          title="Navbar Audit"
          status="WARNING"
          issues={[
            "Watch Earn Upload Missing",
            "Ranks Link Missing",
            "Support Link Missing"
          ]}
        />

        <AuditCard
          title="Admin Audit"
          status="WARNING"
          issues={[
            "Governance Center Not Linked",
            "Scanner Dashboard Missing"
          ]}
        />

      </div>

      <div className="mt-8 rounded-3xl border border-white/10 bg-[#111111] p-6">

        <h2 className="mb-4 text-2xl font-black">
          Missing Connections
        </h2>

        <div className="grid gap-3 md:grid-cols-2">

          {[
            "/mlm/watch-earn/upload",
            "/mlm/team-business",
            "/mlm/ranks",
            "/mlm/permissions",
            "/admin/governance/all"
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
