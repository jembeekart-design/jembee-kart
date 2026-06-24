"use client";

import AuditCard from "@/components/governance/AuditCard";

export default function InviteGovernancePage() {
  const governanceScore = 76;

  return (
    <main className="min-h-screen bg-[#050505] p-6 text-white">

      <div className="mb-8">
        <h1 className="text-4xl font-black">
          Invite Governance Audit
        </h1>

        <p className="mt-2 text-gray-400">
          Audit Report for src/app/mlm/invite/page.tsx
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

      <div className="mb-8 grid gap-4 md:grid-cols-4">

        <div className="rounded-2xl bg-green-500/10 p-5">
          <p className="text-sm text-gray-400">Connected</p>
          <h3 className="text-3xl font-black text-green-400">20</h3>
        </div>

        <div className="rounded-2xl bg-red-500/10 p-5">
          <p className="text-sm text-gray-400">Missing</p>
          <h3 className="text-3xl font-black text-red-400">8</h3>
        </div>

        <div className="rounded-2xl bg-yellow-500/10 p-5">
          <p className="text-sm text-gray-400">Warnings</p>
          <h3 className="text-3xl font-black text-yellow-400">6</h3>
        </div>

        <div className="rounded-2xl bg-pink-500/10 p-5">
          <p className="text-sm text-gray-400">Critical</p>
          <h3 className="text-3xl font-black text-pink-400">0</h3>
        </div>

      </div>

      <div className="grid gap-6 md:grid-cols-2">

        <AuditCard
          title="Authentication Audit"
          status="PASS"
          issues={[
            "Firebase Auth Connected",
            "User Session Validation Working",
            "Referral User Loading Working",
            "Secure User Context Active"
          ]}
        />

        <AuditCard
          title="Firestore Audit"
          status="PASS"
          issues={[
            "Users Collection Connected",
            "User Profile Loading Working",
            "Referral Code Loading Working",
            "Firestore Read Access Working"
          ]}
        />

        <AuditCard
          title="Referral Audit"
          status="PASS"
          issues={[
            "Referral Link Generated",
            "Referral Code Visible",
            "Referral Name Visible",
            "Share Flow Working"
          ]}
        />

        <AuditCard
          title="Clipboard Audit"
          status="PASS"
          issues={[
            "Copy Function Working",
            "Clipboard API Connected",
            "Copy Feedback Working",
            "Referral Copy Enabled"
          ]}
        />

        <AuditCard
          title="WhatsApp Audit"
          status="PASS"
          issues={[
            "WhatsApp Sharing Working",
            "Encoded Messages Working",
            "Referral Link Attached",
            "External Share Flow Active"
          ]}
        />

        <AuditCard
          title="Telegram Audit"
          status="PASS"
          issues={[
            "Telegram Sharing Working",
            "Referral URL Shared",
            "Message Payload Working",
            "External Share Flow Active"
          ]}
        />

        <AuditCard
          title="QR Audit"
          status="FAIL"
          issues={[
            "QR UI Placeholder Found",
            "Real QR Generation Missing",
            "Referral QR Not Generated",
            "QR Download Missing"
          ]}
        />

        <AuditCard
          title="Theme Audit"
          status="WARNING"
          issues={[
            "Hardcoded Colors Found",
            "Theme Context Missing",
            "Admin Theme Missing",
            "Brand Settings Hardcoded"
          ]}
        />

        <AuditCard
          title="Admin Control Audit"
          status="FAIL"
          issues={[
            "Referral URL Hardcoded",
            "Default Domain Hardcoded",
            "Share Message Hardcoded",
            "Admin Config Missing"
          ]}
        />

        <AuditCard
          title="Security Audit"
          status="PASS"
          issues={[
            "User Specific Referral Code",
            "No Sensitive Data Exposure",
            "Safe Firestore Reads",
            "Share Flow Protected"
          ]}
        />

        <AuditCard
          title="Architecture Audit"
          status="WARNING"
          issues={[
            "Window Origin Dependency",
            "Static Fallback Domain",
            "Config Driven URL Missing",
            "Partial Dynamic Structure"
          ]}
        />

        <AuditCard
          title="Growth Audit"
          status="WARNING"
          issues={[
            "Referral Sharing Present",
            "Invite Analytics Missing",
            "Conversion Tracking Missing",
            "Referral Performance Missing"
          ]}
        />

      </div>

      <div className="mt-8 rounded-3xl border border-white/10 bg-[#111111] p-6">

        <h2 className="mb-4 text-2xl font-black">
          Missing Features
        </h2>

        <div className="grid gap-3 md:grid-cols-2">

          {[
            "Real QR Code Generator",
            "QR Download System",
            "Referral Analytics",
            "Invite Conversion Tracking",
            "Share History",
            "Referral Click Tracking",
            "Dynamic Domain Settings",
            "Admin Controlled Share Messages",
            "Theme Engine Integration",
            "Referral Campaign Manager",
            "Deep Link Generator",
            "Social Share Templates"
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
