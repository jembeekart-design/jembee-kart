"use client";

import { useState } from "react";

export default function GovernancePage() {
  const [report] = useState({
    deploymentStatus: "BLOCKED",

    overallScore: 92,

    architectureScore: 96,
    securityScore: 89,
    profitabilityScore: 94,
    themeScore: 100,
    adminControlScore: 90,

    criticalViolations: 3,
    totalViolations: 12,

    violations: [
      {
        severity: "CRITICAL",
        title: "Hardcoded Commission Found",
        file: "src/mlm/distributeCommission.ts",
      },
      {
        severity: "CRITICAL",
        title: "Theme Not Connected",
        file: "src/app/referral/page.tsx",
      },
      {
        severity: "WARNING",
        title: "Duplicate Wallet Logic",
        file: "src/modules/wallet",
      },
    ],
  });

  const getStatusColor = (status: string) => {
    if (status === "PASS") return "text-green-600";
    return "text-red-600";
  };

  return (
    <div className="p-6 space-y-6">

      <div className="border rounded-xl p-6">
        <h1 className="text-3xl font-bold">
          JembeeKart Governance Dashboard
        </h1>

        <p className="text-gray-500 mt-2">
          Architecture • Security • Profitability • Theme • Compliance
        </p>
      </div>

      <div className="grid md:grid-cols-3 gap-4">

        <div className="border rounded-xl p-4">
          <h3 className="font-semibold">
            Deployment Status
          </h3>

          <p
            className={`text-2xl font-bold mt-2 ${getStatusColor(
              report.deploymentStatus
            )}`}
          >
            {report.deploymentStatus}
          </p>
        </div>

        <div className="border rounded-xl p-4">
          <h3 className="font-semibold">
            Overall Score
          </h3>

          <p className="text-2xl font-bold mt-2">
            {report.overallScore}%
          </p>
        </div>

        <div className="border rounded-xl p-4">
          <h3 className="font-semibold">
            Total Violations
          </h3>

          <p className="text-2xl font-bold mt-2">
            {report.totalViolations}
          </p>
        </div>
      </div>

      <div className="grid md:grid-cols-5 gap-4">

        <div className="border rounded-xl p-4">
          <h4>Architecture</h4>
          <p className="text-xl font-bold">
            {report.architectureScore}%
          </p>
        </div>

        <div className="border rounded-xl p-4">
          <h4>Security</h4>
          <p className="text-xl font-bold">
            {report.securityScore}%
          </p>
        </div>

        <div className="border rounded-xl p-4">
          <h4>Profitability</h4>
          <p className="text-xl font-bold">
            {report.profitabilityScore}%
          </p>
        </div>

        <div className="border rounded-xl p-4">
          <h4>Theme</h4>
          <p className="text-xl font-bold">
            {report.themeScore}%
          </p>
        </div>

        <div className="border rounded-xl p-4">
          <h4>Admin Control</h4>
          <p className="text-xl font-bold">
            {report.adminControlScore}%
          </p>
        </div>
      </div>

      <div className="border rounded-xl p-6">
        <h2 className="text-xl font-bold mb-4">
          Violations
        </h2>

        <div className="space-y-3">
          {report.violations.map((item, index) => (
            <div
              key={index}
              className="border rounded-lg p-4"
            >
              <div className="flex justify-between">
                <h3 className="font-semibold">
                  {item.title}
                </h3>

                <span
                  className={
                    item.severity === "CRITICAL"
                      ? "text-red-600"
                      : "text-yellow-600"
                  }
                >
                  {item.severity}
                </span>
              </div>

              <p className="text-sm text-gray-500 mt-2">
                {item.file}
              </p>
            </div>
          ))}
        </div>
      </div>

      <div className="border rounded-xl p-6">
        <h2 className="text-xl font-bold mb-4">
          Governance Checks
        </h2>

        <div className="grid md:grid-cols-2 gap-3">

          <div>✔ Theme Compliance</div>
          <div>✔ Security Compliance</div>

          <div>✔ Profitability Validation</div>
          <div>✔ MLM Validation</div>

          <div>✔ Firestore Validation</div>
          <div>✔ Duplicate Code Detection</div>

          <div>✔ Page Connection Validation</div>
          <div>✔ Admin Control Validation</div>

          <div>✔ Watch & Earn Validation</div>
          <div>✔ Creator Economy Validation</div>

          <div>✔ Wallet Validation</div>
          <div>✔ Anti Fraud Validation</div>
        </div>
      </div>
    </div>
  );
}
