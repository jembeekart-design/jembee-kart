"use client";

import { useState, useEffect } from "react";
import { GovernanceDashboardReport } from "@/jembee-governance/types/governance.types";

const Badge = ({ children, className }: { children: React.ReactNode; className?: string }) => (
  <div className={`px-2 py-0.5 rounded border text-[9px] font-bold uppercase tracking-wider ${className}`}>
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

  if (loading) return <div className="min-h-screen flex items-center justify-center text-indigo-500">Loading Control Panel...</div>;
  if (!report) return <div className="min-h-screen flex items-center justify-center text-red-400">System Offline.</div>;

  return (
    <div className="min-h-screen bg-[#020617] text-white p-6 space-y-6">
      {/* 1. Header & Quick Actions */}
      <div className="flex justify-between items-center">
        <h1 className="text-xl font-bold">Governance Dashboard</h1>
        <div className="flex gap-2">
          <button onClick={() => window.location.reload()} className="bg-indigo-600 px-3 py-1 rounded-lg text-xs">Refresh</button>
        </div>
      </div>

      {/* 2. Hero & Health Metrics */}
      <div className="grid grid-cols-6 gap-4">
        {/* Main Stats (3 Cols) */}
        <div className="col-span-3 grid grid-cols-3 gap-4">
          <div className="bg-slate-900/50 p-4 rounded-xl border border-slate-800">
            <p className="text-[10px] text-slate-500">DEPLOYMENT</p>
            <p className={`text-lg font-bold ${report.deploymentStatus === "PASS" ? "text-emerald-400" : "text-red-400"}`}>{report.deploymentStatus}</p>
          </div>
          <div className="bg-slate-900/50 p-4 rounded-xl border border-slate-800">
            <p className="text-[10px] text-slate-500">HEALTH SCORE</p>
            <p className="text-lg font-bold">{report.overallScore}%</p>
          </div>
          <div className="bg-slate-900/50 p-4 rounded-xl border border-slate-800">
            <p className="text-[10px] text-slate-500">TOTAL ISSUES</p>
            <p className="text-lg font-bold text-red-400">{report.totalViolations}</p>
          </div>
        </div>
        
        {/* Secondary Stats (3 Cols) */}
        <div className="col-span-3 grid grid-cols-3 gap-4">
          <div className="bg-slate-900/50 p-4 rounded-xl border border-slate-800">
            <p className="text-[10px] text-slate-500">MLM HEALTH</p>
            <p className="text-lg font-bold text-emerald-400">{report.mlmGovernance?.healthScore}%</p>
          </div>
          <div className="bg-slate-900/50 p-4 rounded-xl border border-slate-800">
            <p className="text-[10px] text-slate-500">WALLET INTEGRITY</p>
            <p className="text-lg font-bold text-cyan-400">{report.walletGovernance?.integrityScore}%</p>
          </div>
          <div className="bg-slate-900/50 p-4 rounded-xl border border-slate-800">
            <p className="text-[10px] text-slate-500">PROFIT LEAK</p>
            <p className="text-lg font-bold text-red-400">{report.mlmGovernance?.profitLeakageCount}</p>
          </div>
        </div>
      </div>

      {/* 3. Audit Table */}
      <div className="bg-slate-900/40 p-6 rounded-2xl border border-slate-800">
        <h3 className="text-sm font-bold mb-4">MLM Commission Audit</h3>
        <table className="w-full text-xs">
          <thead className="text-slate-500 border-b border-slate-800">
            <tr>
              <th className="pb-2">Order ID</th>
              <th className="pb-2">Profit</th>
              <th className="pb-2">Commission</th>
              <th className="pb-2">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800">
            {report.mlmAuditItems?.slice(0, 5).map((item, i) => (
              <tr key={i}>
                <td className="py-2 font-mono text-indigo-400">{item.orderId}</td>
                <td className="py-2">${item.profit}</td>
                <td className="py-2">${item.commission}</td>
                <td className="py-2"><Badge className={item.status === "VERIFIED" ? "border-emerald-900 text-emerald-400" : "border-red-900 text-red-400"}>{item.status}</Badge></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* 4. Incident Log & Trend Split */}
      <div className="grid grid-cols-2 gap-6">
        <div className="bg-slate-900/40 p-6 rounded-2xl border border-slate-800">
          <h3 className="text-sm font-bold mb-4">Governance Trend</h3>
          <div className="flex items-end h-32 gap-2">
            {report.history?.map((item, i) => (
              <div key={i} className="flex-1 bg-gradient-to-t from-indigo-900 to-indigo-500 rounded-t" style={{ height: `${item.overallScore}%` }} />
            ))}
          </div>
        </div>
        <div className="bg-slate-900/40 p-6 rounded-2xl border border-slate-800">
          <h3 className="text-sm font-bold mb-4">Critical Violations</h3>
          <div className="space-y-2 overflow-y-auto max-h-32">
            {report.violations?.filter(v => v.severity === "CRITICAL").map((v, i) => (
              <p key={i} className="text-xs text-red-300">• {v.title}</p>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
