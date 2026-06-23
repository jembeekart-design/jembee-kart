// src/app/admin/governance/pages/address/page.tsx

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

export default function AddressGovernancePage() {
  const governanceScore = 72;

  return (
    <main className="min-h-screen bg-[#050505] p-6 text-white">

      <div className="mb-8">
        <h1 className="text-4xl font-black">
          Address Page Governance Audit
        </h1>

        <p className="mt-2 text-gray-400">
          Audit Report for src/app/address/page.tsx
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
          Production Ready: PARTIAL
        </p>
      </div>

      <div className="mb-8 grid gap-4 md:grid-cols-4">

        <div className="rounded-2xl bg-green-500/10 p-5">
          <p className="text-sm text-gray-400">Connected</p>
          <h3 className="text-3xl font-black text-green-400">
            8
          </h3>
        </div>

        <div className="rounded-2xl bg-red-500/10 p-5">
          <p className="text-sm text-gray-400">Missing</p>
          <h3 className="text-3xl font-black text-red-400">
            8
          </h3>
        </div>

        <div className="rounded-2xl bg-yellow-500/10 p-5">
          <p className="text-sm text-gray-400">Warnings</p>
          <h3 className="text-3xl font-black text-yellow-400">
            5
          </h3>
        </div>

        <div className="rounded-2xl bg-pink-500/10 p-5">
          <p className="text-sm text-gray-400">Critical</p>
          <h3 className="text-3xl font-black text-pink-400">
            2
          </h3>
        </div>

      </div>

      <div className="grid gap-6 md:grid-cols-2">

        <AuditCard
          title="Route Audit"
          status="PASS"
          issues={[
            "Address Route Found",
            "Page Rendering Working",
            "Save Button Connected",
            "Load Address Connected",
          ]}
        />

        <AuditCard
          title="Firestore Audit"
          status="WARNING"
          issues={[
            "users/{uid}/addresses/default Connected",
            "createdAt Connected",
            "updatedAt Connected",
            "Address Analytics Missing",
            "Address Audit Logs Missing",
          ]}
        />

        <AuditCard
          title="Theme Audit"
          status="FAIL"
          issues={[
            "bg-slate-50 Hardcoded",
            "bg-white Hardcoded",
            "text-slate-900 Hardcoded",
            "violet Theme Hardcoded",
            "Admin Theme Not Connected",
          ]}
        />

        <AuditCard
          title="Admin Control Audit"
          status="FAIL"
          issues={[
            "Address Fields Hardcoded",
            "Validation Rules Hardcoded",
            "No Dynamic Form Builder",
            "No Admin Address Settings",
          ]}
        />

        <AuditCard
          title="Address Feature Audit"
          status="WARNING"
          issues={[
            "Single Address Only",
            "Multiple Address Missing",
            "Default Address Switch Missing",
            "Address Delete Missing",
          ]}
        />

        <AuditCard
          title="Security Audit"
          status="WARNING"
          issues={[
            "Firebase Auth Connected",
            "User Ownership Protected",
            "Role Validation Missing",
            "Address Audit Trail Missing",
          ]}
        />

        <AuditCard
          title="Ecommerce Audit"
          status="PASS"
          issues={[
            "Shipping Address Working",
            "Checkout Compatible",
            "Address Save Working",
            "Order Address Ready",
          ]}
        />

        <AuditCard
          title="Maps Audit"
          status="FAIL"
          issues={[
            "Google Maps Missing",
            "Current Location Missing",
            "GPS Detection Missing",
            "Delivery Zone Validation Missing",
          ]}
        />

      </div>

      <div className="mt-8 rounded-3xl border border-white/10 bg-[#111111] p-6">

        <h2 className="mb-4 text-2xl font-black">
          Missing Features
        </h2>

        <div className="grid gap-3 md:grid-cols-2">

          {[
            "Multiple Address Support",
            "Home Address",
            "Office Address",
            "Other Address",
            "Default Address Switch",
            "Google Maps Picker",
            "Current Location",
            "Delivery Availability Check",
            "Address Analytics",
            "Address Audit Logs",
            "Admin Address Settings",
            "Dynamic Address Fields",
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
