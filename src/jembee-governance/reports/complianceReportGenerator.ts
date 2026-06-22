"use client";

import { useState, useEffect } from "react";
import { GovernanceDashboardReport } from "@/jembee-governance/types/governance.types";

const Badge = ({ children, className }: { children: React.ReactNode; className?: string }) => (
  <div className={`px-3 py-1 rounded-lg border text-[10px] font-bold uppercase tracking-wider ${className}`}>
    {children}
  </div>
);

export default function GovernancePage() {
  const [report, setReport] = useState<GovernanceDashboardReport | null>(null);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  const fetchData = async () => {
    try {
      const res = await fetch("/api/governance");
      const data = await res.json();
      if (data.report) setReport(data.report);
    } catch (e) { console.error("Fetch error", e); }
    finally { setLoading(false); }
  };

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 30000);
    return () => clearInterval(interval);
  }, []);

  if (loading && !report) return <div className="min-h-screen flex items-center justify-center bg-[#020617] text-indigo-500">Initializing Engine...</div>;
  if (!report) return <div className="min-h-screen flex items-center justify-center bg-[#020617] text-red-400">Report unavailable.</div>;

  return (
    <div className="min-h-screen bg-[#020617] text-white p-8 font-sans">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-2xl font-bold">JembeeKart Governance</h1>
          <p className="text-slate-500 text-sm">System Compliance & Security Monitoring</p>
        </div>
        <button onClick={() => window.location.reload()} className="px-4 py-2 bg-indigo-600 rounded-xl text-sm font-medium hover:bg-indigo-500">Refresh</button>
      </div>

      {/* 1. Hero Stats & Summary Row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="bg-slate-900/40 border border-slate-800 rounded-2xl p-5"><p className="text-xs text-slate-500">Deployment</p><h3 className={`text-2xl font-bold ${report.deploymentStatus === "PASS" ? "text-emerald-400" : "text-red-400"}`}>{report.deploymentStatus}</h3></div>
        <div className="bg-slate-900/40 border border-slate-800 rounded-2xl p-5"><p className="text-xs text-slate-500">Overall Health</p><h3 className="text-2xl font-bold">{report.overallScore}%</h3></div>
        <div className="bg-slate-900/40 border border-slate-800 rounded-2xl p-5"><p className="text-xs text-slate-500">Total Violations</p><h3 className="text-2xl font-bold">{report.totalViolations}</h3></div>
      </div>

      <div className="grid grid-cols-3 gap-4 mb-8">
        <div className="bg-red-950/20 border border-red-900 rounded-xl p-4"><p className="text-red-400 text-xs">Critical</p><h3 className="text-2xl font-bold">{report.criticalCount}</h3></div>
        <div className="bg-orange-950/20 border border-orange-900 rounded-xl p-4"><p className="text-orange-400 text-xs">Errors</p><h3 className="text-2xl font-bold">{report.errorCount}</h3></div>
        <div className="bg-yellow-950/20 border border-yellow-900 rounded-xl p-4"><p className="text-yellow-400 text-xs">Warnings</p><h3 className="text-2xl font-bold">{report.warningCount}</h3></div>
      </div>

      {/* 2. Metrics Grid (8 Core Parameters) */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        {[ {n: "Architecture", v: report.architectureScore}, {n: "Security", v: report.securityScore}, {n: "Profitability", v: report.profitabilityScore}, {n: "Theme", v: report.themeScore}, {n: "Admin Control", v: report.adminControlScore}, {n: "Duplicate", v: report.duplicateCodeScore}, {n: "Hardcoded", v: report.hardcodedRuleScore}, {n: "Page Connect", v: report.pageConnectionScore} ].map((m, i) => (
          <div key={i} className="bg-slate-900/40 p-4 rounded-2xl border border-slate-800"><h4 className="text-[10px] text-slate-500 uppercase">{m.n}</h4><p className="text-lg font-semibold">{m.v}%</p></div>
        ))}
      </div>

      {/* 3. Specialized Governance Stats */}
      <div className="grid md:grid-cols-3 gap-4 mb-8">
        <div className="bg-slate-900/40 border border-slate-800 rounded-2xl p-5"><p className="text-xs text-slate-500">MLM Health</p><h3 className="text-2xl font-bold text-emerald-400">{report.mlmGovernance?.healthScore}%</h3></div>
        <div className="bg-slate-900/40 border border-slate-800 rounded-2xl p-5"><p className="text-xs text-slate-500">Wallet Integrity</p><h3 className="text-2xl font-bold text-cyan-400">{report.walletGovernance?.integrityScore}%</h3></div>
        <div className="bg-slate-900/40 border border-slate-800 rounded-2xl p-5"><p className="text-xs text-slate-500">Profit Leakage</p><h3 className="text-2xl font-bold text-red-400">{report.mlmGovernance?.profitLeakageCount}</h3></div>
      </div>

      {/* 4. MLM Audit Table & Trend/Log */}
      <div className="grid lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 bg-slate-900/40 border border-slate-800 rounded-3xl p-6">
          <h3 className="text-lg font-bold mb-4">MLM Commission Audit</h3>
          <table className="w-full text-sm">
            <thead className="text-slate-500 border-b border-slate-800"><tr><th className="pb-3 text-left">Order ID</th><th className="pb-3 text-left">Profit</th><th className="pb-3 text-left">Commission</th><th className="pb-3 text-left">Status</th></tr></thead>
            <tbody className="divide-y divide-slate-800">
              {report.mlmAuditItems?.map((item: any, i: number) => (
                <tr key={i}><td className="py-3 font-mono text-indigo-400">{item.orderId}</td><td className="py-3">${item.profit}</td><td className="py-3">${item.commission}</td><td className="py-3"><Badge className={item.status === "VERIFIED" ? "border-emerald-900 text-emerald-400" : "border-red-900 text-red-400"}>{item.status}</Badge></td></tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="bg-slate-900/40 border border-slate-800 rounded-3xl p-6">
          <h3 className="text-lg font-bold mb-6">Governance Trend</h3>
          <div className="flex items-end justify-between h-40 gap-2">
            {report.history?.map((item, i) => (
              <div key={i} className="flex-1 flex flex-col items-center">
                <div className="w-full rounded-t bg-indigo-500" style={{ height: `${Math.max(item.overallScore, 20)}%` }} />
                <span className="text-[9px] mt-2 text-slate-500">{item.scanDate.split('-')[2]}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* 5. Incident Log */}
      <div className="mt-8 bg-slate-900/40 border border-slate-800 rounded-3xl p-6">
        <h3 className="text-lg font-bold mb-6">Incident Log</h3>
        <div className="space-y-3 max-h-[400px] overflow-y-auto">
          {report.violations?.map((v, i) => (
            <div key={i} className="flex justify-between p-4 bg-slate-950/40 rounded-xl border border-slate-800">
              <div><h4 className="font-semibold text-sm">{v.title}</h4><p className="text-xs text-slate-400">{v.description}</p></div>
              <Badge className={v.severity === "CRITICAL" ? "border-red-900 text-red-400" : "border-yellow-900 text-yellow-400"}>{v.severity}</Badge>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
