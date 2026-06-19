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
      { severity: "CRITICAL", title: "Hardcoded Commission Found", file: "src/mlm/distributeCommission.ts" },
      { severity: "CRITICAL", title: "Theme Not Connected", file: "src/app/referral/page.tsx" },
      { severity: "WARNING", title: "Duplicate Wallet Logic", file: "src/modules/wallet" },
    ],
  });

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 p-8 font-sans">
      {/* Header */}
      <header className="mb-10 border-b border-slate-800 pb-6">
        <h1 className="text-4xl font-extralight tracking-tight text-white">
          JembeeKart <span className="font-semibold text-indigo-500">Governance</span>
        </h1>
        <p className="text-slate-400 mt-2 tracking-widest uppercase text-xs">
          System Integrity & Performance Command Center
        </p>
      </header>

      {/* Main Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        {[
          { label: "Deployment Status", value: report.deploymentStatus, color: report.deploymentStatus === "PASS" ? "text-emerald-400" : "text-rose-400" },
          { label: "Overall System Health", value: `${report.overallScore}%`, color: "text-white" },
          { label: "Active Violations", value: report.totalViolations, color: "text-amber-400" },
        ].map((stat, i) => (
          <div key={i} className="bg-slate-900/50 border border-slate-800 p-6 rounded-2xl backdrop-blur-sm">
            <h3 className="text-slate-400 text-sm font-medium uppercase tracking-wider">{stat.label}</h3>
            <p className={`text-4xl font-light mt-3 ${stat.color}`}>{stat.value}</p>
          </div>
        ))}
      </div>

      {/* Metric Cards */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-10">
        {[
          { name: "Architecture", val: report.architectureScore },
          { name: "Security", val: report.securityScore },
          { name: "Profitability", val: report.profitabilityScore },
          { name: "Theme", val: report.themeScore },
          { name: "Admin Control", val: report.adminControlScore },
        ].map((m, i) => (
          <div key={i} className="bg-slate-900/30 border border-slate-800 p-4 rounded-xl text-center hover:border-indigo-500/50 transition-all">
            <h4 className="text-xs text-slate-500 mb-1">{m.name}</h4>
            <p className="text-2xl font-semibold">{m.val}%</p>
          </div>
        ))}
      </div>

      {/* Violations Section */}
      <div className="bg-slate-900/40 border border-slate-800 rounded-2xl p-8 mb-10">
        <h2 className="text-xl font-light mb-6 text-white border-b border-slate-800 pb-4">Incident Log</h2>
        <div className="space-y-4">
          {report.violations.map((item, index) => (
            <div key={index} className="flex justify-between items-center bg-slate-950 p-4 rounded-lg border border-slate-800">
              <div>
                <h3 className="font-medium text-slate-200">{item.title}</h3>
                <p className="text-xs text-slate-500 font-mono mt-1">{item.file}</p>
              </div>
              <span className={`text-[10px] font-bold uppercase tracking-widest px-3 py-1 rounded-full ${item.severity === "CRITICAL" ? "bg-rose-500/10 text-rose-400" : "bg-amber-500/10 text-amber-400"}`}>
                {item.severity}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Footer Checks */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 opacity-70">
        {[
          "Theme Compliance", "Security Compliance", "Profitability Validation", "MLM Validation",
          "Firestore Logic", "Duplicate Code Detection", "Page Connections", "Admin Security",
          "Watch & Earn", "Creator Economy", "Wallet Protocol", "Anti-Fraud System"
        ].map((check) => (
          <div key={check} className="text-xs text-slate-400 border border-slate-800/50 p-3 rounded bg-slate-900/20">
            ✓ {check}
          </div>
        ))}
      </div>
    </div>
  );
}
