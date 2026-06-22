"use client";

import { AlertTriangle, CheckCircle, XCircle, Shield, Database, Image, Cpu, Settings } from "lucide-react";

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
        <h3 className="text-lg font-bold">{title}</h3>

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

export default function AIBannerGovernancePage() {
  const governanceScore = 58;

  return (
    <main className="min-h-screen bg-[#050505] p-6 text-white">

      {/* Header */}

      <div className="mb-8">
        <h1 className="text-4xl font-black">
          AI Banner Governance Audit
        </h1>

        <p className="mt-2 text-gray-400">
          Audit Report for AI Banner Generator Module
        </p>
      </div>

      {/* Score */}

      <div className="mb-8 rounded-3xl border border-white/10 bg-[#111111] p-6">
        <p className="text-sm text-gray-400">
          Governance Score
        </p>

        <h2 className="mt-2 text-6xl font-black text-pink-400">
          {governanceScore}/100
        </h2>

        <p className="mt-3 text-red-400">
          Production Ready: NO
        </p>
      </div>

      {/* Summary */}

      <div className="mb-8 grid gap-4 md:grid-cols-4">

        <div className="rounded-2xl bg-green-500/10 p-5">
          <p className="text-sm text-gray-400">
            Connected
          </p>
          <h3 className="text-3xl font-black text-green-400">
            5
          </h3>
        </div>

        <div className="rounded-2xl bg-red-500/10 p-5">
          <p className="text-sm text-gray-400">
            Missing
          </p>
          <h3 className="text-3xl font-black text-red-400">
            11
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
            3
          </h3>
        </div>

      </div>

      {/* Audit Grid */}

      <div className="grid gap-6 md:grid-cols-2">

        <AuditCard
          title="Route Audit"
          status="PASS"
          issues={[
            "AI Banner Route Found",
            "Page Component Loaded",
            "UI Rendering Successful",
          ]}
        />

        <AuditCard
          title="Firestore Audit"
          status="FAIL"
          issues={[
            "aiGeneratedBanners Collection Missing",
            "bannerTemplates Collection Missing",
            "homepageBanners Collection Missing",
          ]}
        />

        <AuditCard
          title="AI Engine Audit"
          status="FAIL"
          issues={[
            "OpenAI Not Connected",
            "Gemini Not Connected",
            "Using Fake setTimeout Generator",
          ]}
        />

        <AuditCard
          title="Storage Audit"
          status="FAIL"
          issues={[
            "Firebase Storage Missing",
            "Generated Images Not Saved",
          ]}
        />

        <AuditCard
          title="Button Audit"
          status="WARNING"
          issues={[
            "Generate Button Exists",
            "Save Button Not Connected",
            "Download Button Not Connected",
            "Delete Button Not Connected",
          ]}
        />

        <AuditCard
          title="Theme Audit"
          status="WARNING"
          issues={[
            "Hardcoded Colors Found",
            "Hardcoded Background Found",
            "Admin Theme Not Connected",
          ]}
        />

        <AuditCard
          title="Admin Control Audit"
          status="FAIL"
          issues={[
            "Templates Hardcoded",
            "Categories Hardcoded",
            "No Dynamic Settings",
          ]}
        />

        <AuditCard
          title="Security Audit"
          status="WARNING"
          issues={[
            "Role Validation Missing",
            "Permission Layer Missing",
          ]}
        />

      </div>

      {/* Missing Features */}

      <div className="mt-8 rounded-3xl border border-white/10 bg-[#111111] p-6">

        <h2 className="mb-4 text-2xl font-black">
          Missing Features
        </h2>

        <div className="grid gap-3 md:grid-cols-2">

          {[
            "AI API Integration",
            "Banner History",
            "Banner Analytics",
            "Firebase Storage",
            "Homepage Sync",
            "Audit Logs",
            "Admin Permissions",
            "Template Management",
            "Banner Categories",
            "HD Export System",
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
