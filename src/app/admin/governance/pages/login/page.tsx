"use client";

import {
  AlertTriangle,
  CheckCircle,
  XCircle,
} from "lucide-react";

function AuditCard({
  title,
  status,
  issues,
}: {
  title: string;
  status: "PASS" | "WARNING" | "FAIL";
  issues: string[];
}) {
  return (
    <div className="rounded-3xl border border-white/10 bg-[#111111] p-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-bold">
          {title}
        </h3>

        {status === "PASS" && (
          <CheckCircle className="text-green-400" />
        )}

        {status === "WARNING" && (
          <AlertTriangle className="text-yellow-400" />
        )}

        {status === "FAIL" && (
          <XCircle className="text-red-400" />
        )}
      </div>

      <div className="mt-4 space-y-2">
        {issues.map((issue, index) => (
          <div
            key={index}
            className="rounded-xl bg-black/30 p-3 text-sm text-gray-300"
          >
            {issue}
          </div>
        ))}
      </div>
    </div>
  );
}

export default function LoginGovernancePage() {
  const governanceScore = 72;

  return (
    <main className="min-h-screen bg-[#050505] p-6 text-white">

      <div className="mb-8">
        <h1 className="text-4xl font-black">
          Login Page Governance Audit
        </h1>

        <p className="mt-2 text-gray-400">
          Audit Report For Authentication System
        </p>
      </div>

      <div className="mb-8 rounded-3xl border border-white/10 bg-[#111111] p-6">
        <p className="text-sm text-gray-400">
          Governance Score
        </p>

        <h2 className="mt-2 text-6xl font-black text-pink-400">
          {governanceScore}/100
        </h2>

        <p className="mt-3 text-yellow-400">
          Production Ready : PARTIAL
        </p>
      </div>

      <div className="mb-8 grid gap-4 md:grid-cols-4">

        <div className="rounded-2xl bg-green-500/10 p-5">
          <p className="text-sm text-gray-400">
            Connected
          </p>

          <h3 className="text-3xl font-black text-green-400">
            9
          </h3>
        </div>

        <div className="rounded-2xl bg-red-500/10 p-5">
          <p className="text-sm text-gray-400">
            Missing
          </p>

          <h3 className="text-3xl font-black text-red-400">
            12
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
            4
          </h3>
        </div>

      </div>

      <div className="grid gap-6 md:grid-cols-2">

        <AuditCard
          title="Authentication Audit"
          status="PASS"
          issues={[
            "Firebase Email Login Connected",
            "Google Login Connected",
            "Email Verification Enabled",
            "Firestore User Verification Connected",
          ]}
        />

        <AuditCard
          title="Referral Audit"
          status="PASS"
          issues={[
            "Referral Code Capture Working",
            "Signup Referral Transfer Working",
            "Referral Storage Working",
          ]}
        />

        <AuditCard
          title="Theme Audit"
          status="FAIL"
          issues={[
            "Hardcoded Background Color Found",
            "Hardcoded Gradient Found",
            "Theme Settings Not Connected",
            "Admin Theme Engine Missing",
          ]}
        />

        <AuditCard
          title="Notification Audit"
          status="FAIL"
          issues={[
            "Alert Messages Hardcoded",
            "Notification Templates Missing",
            "Admin Notification Engine Missing",
          ]}
        />

        <AuditCard
          title="Security Audit"
          status="WARNING"
          issues={[
            "Email Verification Present",
            "Device Tracking Missing",
            "IP Tracking Missing",
            "Fraud Detection Missing",
          ]}
        />

        <AuditCard
          title="Admin Control Audit"
          status="FAIL"
          issues={[
            "Redirect Rules Hardcoded",
            "Google Provider Hardcoded",
            "No Dynamic Login Settings",
          ]}
        />

        <AuditCard
          title="Audit Log System"
          status="FAIL"
          issues={[
            "Login Audit Collection Missing",
            "Failed Login Tracking Missing",
            "Suspicious Activity Logs Missing",
          ]}
        />

        <AuditCard
          title="Business Compliance"
          status="WARNING"
          issues={[
            "Account Active Check Missing",
            "KYC Check Missing",
            "Wallet Freeze Check Missing",
            "Fraud Flag Check Missing",
          ]}
        />

      </div>

      <div className="mt-8 rounded-3xl border border-white/10 bg-[#111111] p-6">

        <h2 className="mb-4 text-2xl font-black">
          Connected Pages
        </h2>

        <div className="grid gap-3 md:grid-cols-2">

          {[
            "/",
            "/signup",
            "/verify-email",
          ].map((item) => (
            <div
              key={item}
              className="rounded-xl bg-green-500/10 p-3 text-green-300"
            >
              {item}
            </div>
          ))}

        </div>

      </div>

      <div className="mt-8 rounded-3xl border border-white/10 bg-[#111111] p-6">

        <h2 className="mb-4 text-2xl font-black">
          Missing Features
        </h2>

        <div className="grid gap-3 md:grid-cols-2">

          {[
            "Theme Settings",
            "Login Settings",
            "Notification Templates",
            "Device Fingerprint",
            "IP Monitoring",
            "Fraud Detection",
            "Login Audit Logs",
            "KYC Validation",
            "Account Status Validation",
            "Wallet Freeze Validation",
            "Redirect Rules Engine",
            "Admin Authentication Control",
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
