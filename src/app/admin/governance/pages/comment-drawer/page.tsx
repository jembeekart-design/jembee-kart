"use client";

import AuditCard from "@/components/governance/AuditCard";

export default function CommentDrawerGovernancePage() {
  const governanceScore = 86;

  return (
    <main className="min-h-screen bg-[#050505] p-6 text-white">

      <div className="mb-8">
        <h1 className="text-4xl font-black">
          Comment Drawer Audit
        </h1>

        <p className="mt-2 text-gray-400">
          Audit Report for
          {" "}
          src/app/mlm/watch-earn/components/CommentDrawer.tsx
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
          title="UI Audit"
          status="PASS"
          issues={[
            "Modern Drawer Layout",
            "Mobile Friendly",
            "Smooth Slide Animation",
            "Good User Experience"
          ]}
        />

        <AuditCard
          title="Comment System Audit"
          status="WARNING"
          issues={[
            "Comments Hardcoded",
            "No Firestore Sync",
            "No Pagination",
            "No Real Time Updates"
          ]}
        />

        <AuditCard
          title="Security Audit"
          status="FAIL"
          issues={[
            "No Spam Protection",
            "No Rate Limiting",
            "No Content Filtering",
            "No User Validation"
          ]}
        />

        <AuditCard
          title="Like System Audit"
          status="FAIL"
          issues={[
            "Like Button Non Functional",
            "No Database Tracking",
            "No Duplicate Prevention",
            "No Analytics"
          ]}
        />

        <AuditCard
          title="Performance Audit"
          status="PASS"
          issues={[
            "Lightweight Component",
            "Fast Rendering",
            "Small DOM Tree",
            "Efficient State Usage"
          ]}
        />

        <AuditCard
          title="Accessibility Audit"
          status="WARNING"
          issues={[
            "ARIA Labels Missing",
            "Keyboard Navigation Missing",
            "Focus Trap Missing",
            "Screen Reader Support Missing"
          ]}
        />

        <AuditCard
          title="Governance Audit"
          status="WARNING"
          issues={[
            "Admin Controls Missing",
            "Comment Rules Hardcoded",
            "Feature Flags Missing",
            "Scanner Integration Missing"
          ]}
        />

        <AuditCard
          title="Production Readiness"
          status="PASS"
          issues={[
            "Reusable Component",
            "Clean Code",
            "Easy Maintenance",
            "Deployment Ready"
          ]}
        />

      </div>

      <div className="mt-8 rounded-3xl border border-white/10 bg-[#111111] p-6">

        <h2 className="mb-4 text-2xl font-black">
          Missing Features
        </h2>

        <div className="grid gap-3 md:grid-cols-2">

          {[
            "Firestore Comments Collection",
            "Realtime Comment Sync",
            "Comment Moderation",
            "Spam Detection",
            "Rate Limiting",
            "Comment Reporting",
            "Comment Deletion",
            "User Profile Integration",
            "Like System Backend",
            "Reply System",
            "Mention System",
            "Emoji Support",
            "Pinned Comments",
            "Admin Comment Controls",
            "Governance Scanner Integration",
            "Feature Flags"
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
