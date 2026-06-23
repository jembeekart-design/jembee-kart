// src/app/admin/governance/pages/qikink-create-order/page.tsx

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

export default function QikinkCreateOrderGovernancePage() {
  const governanceScore = 68;

  return (
    <main className="min-h-screen bg-[#050505] p-6 text-white">

      <div className="mb-8">
        <h1 className="text-4xl font-black">
          Qikink Create Order Audit
        </h1>

        <p className="mt-2 text-gray-400">
          Governance Report for Qikink Order API
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
            6
          </h3>
        </div>

        <div className="rounded-2xl bg-red-500/10 p-5">
          <p className="text-sm text-gray-400">Missing</p>
          <h3 className="text-3xl font-black text-red-400">
            11
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
            3
          </h3>
        </div>

      </div>

      <div className="grid gap-6 md:grid-cols-2">

        <AuditCard
          title="Qikink Connection Audit"
          status="PASS"
          issues={[
            "Qikink Token API Connected",
            "Qikink Order API Connected",
            "Environment Variables Used",
            "SKU Validation Present",
            "Error Handling Present",
          ]}
        />

        <AuditCard
          title="Security Audit"
          status="FAIL"
          issues={[
            "Firebase Auth Missing",
            "Role Validation Missing",
            "Admin Validation Missing",
            "Rate Limiting Missing",
            "Order Ownership Validation Missing",
          ]}
        />

        <AuditCard
          title="Ecommerce Audit"
          status="WARNING"
          issues={[
            "Order Sent To Qikink",
            "Product Validation Missing",
            "Stock Validation Missing",
            "Seller Validation Missing",
            "Profit Validation Missing",
          ]}
        />

        <AuditCard
          title="Firestore Audit"
          status="FAIL"
          issues={[
            "Order History Missing",
            "Audit Logs Missing",
            "Qikink Logs Missing",
            "Order Tracking Missing",
          ]}
        />

        <AuditCard
          title="Admin Control Audit"
          status="FAIL"
          issues={[
            "Country Code Hardcoded",
            "Gateway Logic Hardcoded",
            "Shipping Logic Hardcoded",
            "No Firestore Settings",
          ]}
        />

        <AuditCard
          title="Fraud Audit"
          status="FAIL"
          issues={[
            "Duplicate Order Check Missing",
            "Bot Protection Missing",
            "Abuse Detection Missing",
            "Fraud Monitoring Missing",
          ]}
        />

        <AuditCard
          title="Master Model Audit"
          status="WARNING"
          issues={[
            "Qikink Connected",
            "Admin Control Missing",
            "Order Analytics Missing",
            "Profit Engine Missing",
          ]}
        />

        <AuditCard
          title="Deployment Audit"
          status="WARNING"
          issues={[
            "API Functional",
            "Needs Firestore Tracking",
            "Needs Audit Logs",
            "Needs Security Layer",
          ]}
        />

      </div>

      <div className="mt-8 rounded-3xl border border-white/10 bg-[#111111] p-6">

        <h2 className="mb-4 text-2xl font-black">
          Missing Features
        </h2>

        <div className="grid gap-3 md:grid-cols-2">

          {[
            "Firebase Authentication",
            "Role Validation",
            "Order Ownership Check",
            "Firestore Order Logs",
            "Audit Logs",
            "Product Validation",
            "Seller Validation",
            "Stock Validation",
            "Fraud Detection",
            "Rate Limiting",
            "Admin Settings",
            "Retry Queue",
            "Webhook Verification",
            "Profit Calculation",
            "Cashback Validation",
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
