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
    } catch (e) {
      console.error("Failed to fetch governance data", e);
    } finally {
      setLoading(false);
    }
  };

  // Auto Refresh Every 30 Seconds
  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 30000);
    return () => clearInterval(interval);
  }, []);

  const exportReport = () => {
    if (!report) return;
    const blob = new Blob([JSON.stringify(report, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `governance-report-${new Date().getTime()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  if (loading && !report) return <div className="min-h-screen flex items-center justify-center bg-[#020617] text-indigo-500">Initializing Governance Engine...</div>;
  if (!report) return <div className="min-h-screen flex items-center justify-center bg-[#020617] text-red-400">Report unavailable.</div>;

  return (
    <div className="min-h-screen bg-[#020617] text-white p-8 font-sans">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-2xl font-bold">JembeeKart Governance</h1>
          <p className="text-slate-500 text-sm">System Compliance & Security Monitoring</p>
        </div>
        <div className="flex gap-3">
          <button onClick={exportReport} className="px-4 py-2 bg-slate-800 rounded-xl text-sm font-medium hover:bg-slate-700">Export</button>
          <button onClick={fetchData} className="px-4 py-2 bg-indigo-600 rounded-xl text-sm font-medium hover:bg-indigo-500">Refresh</button>
        </div>
      </div>

      {/* Hero Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="bg-slate-900/40 border border-slate-800 rounded-2xl p-5">
          <p className="text-xs text-slate-500">Deployment Status</p>
          <h3 className={`text-2xl font-bold ${report.deploymentStatus === "PASS" ? "text-emerald-400" : "text-red-400"}`}>{report.deploymentStatus}</h3>
        </div>
        <div className="bg-slate-900/40 border border-slate-800 rounded-2xl p-5">
          <p className="text-xs text-slate-500">Overall Health</p>
          <h3 className="text-2xl font-bold">{report.overallScore ?? 0}%</h3>
        </div>
        <div className="bg-slate-900/40 border border-slate-800 rounded-2xl p-5">
          <p className="text-xs text-slate-500">Total Violations</p>
          <h3 className="text-2xl font-bold">{report.totalViolations ?? 0}</h3>
        </div>
      </div>

      {/* Critical/Error/Warning Summary Row */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="bg-red-950/20 border border-red-900 rounded-xl p-4">
          <p className="text-red-400 text-xs">Critical</p>
          <h3 className="text-2xl font-bold">{report.criticalCount ?? 0}</h3>
        </div>
        <div className="bg-orange-950/20 border border-orange-900 rounded-xl p-4">
          <p className="text-orange-400 text-xs">Errors</p>
          <h3 className="text-2xl font-bold">{report.errorCount ?? 0}</h3>
        </div>
        <div className="bg-yellow-950/20 border border-yellow-900 rounded-xl p-4">
          <p className="text-yellow-400 text-xs">Warnings</p>
          <h3 className="text-2xl font-bold">{report.warningCount ?? 0}</h3>
        </div>
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        {[ { n: "Arch", v: report.architectureScore }, { n: "Sec", v: report.securityScore }, { n: "Profit", v: report.profitabilityScore }, { n: "Theme", v: report.themeScore }, { n: "Admin", v: report.adminControlScore }, { n: "Dup", v: report.duplicateCodeScore }, { n: "Hard", v: report.hardcodedRuleScore }, { n: "Page", v: report.pageConnectionScore } ].map((m, i) => (
          <div key={i} className="bg-slate-900/40 p-4 rounded-2xl border border-slate-800">
            <h4 className="text-[10px] text-slate-500 uppercase">{m.n}</h4>
            <p className="text-lg font-semibold">{m.v ?? 0}%</p>
          </div>
        ))}
      </div>

      {/* Log & Trend */}
      <div className="grid lg:grid-cols-3 gap-8">
        <div className="lg:col-span-1 bg-slate-900/40 border border-slate-800 rounded-3xl p-6">
          <h3 className="text-lg font-bold mb-6">Governance Trend</h3>
          <div className="flex items-end justify-between h-56 gap-3">
             {report.history?.length ? report.history.map((item, i) => (
              <div key={i} className="flex-1 flex flex-col items-center">
                <div className="w-full rounded-t-xl bg-gradient-to-t from-violet-700 to-cyan-400" style={{ height: `${Math.max(item.overallScore * 2, 20)}px` }} />
                <span className="text-[10px] mt-2 text-slate-400 rotate-45">{new Date(item.scanDate).toLocaleDateString()}</span>
              </div>
            )) : <div className="text-slate-500 italic">No history available</div>}
          </div>
        </div>

        <div className="lg:col-span-2 bg-slate-900/40 border border-slate-800 rounded-3xl p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-bold">Incident Log</h3>
            <input type="text" placeholder="Search..." value={search} onChange={(e) => setSearch(e.target.value)} className="bg-slate-950 border border-slate-700 rounded-xl px-4 py-2 text-sm w-64" />
          </div>
          
          <div className="space-y-3 max-h-[700px] overflow-y-auto pr-2">
            {report.violations.length === 0 && <div className="text-center py-10 text-slate-500">No governance violations found 🎉</div>}
            {report.violations?.filter(v => v.title?.toLowerCase().includes(search.toLowerCase())).map((v, i) => (
              <div key={i} className="border border-slate-800 rounded-2xl p-4 bg-slate-950/40 hover:bg-slate-950 transition-colors">
                <div className="flex justify-between items-start mb-2">
                  <h4 className="font-semibold text-sm">{v.title}</h4>
                  <Badge className={v.severity === "CRITICAL" ? "border-red-900 text-red-400" : v.severity === "ERROR" ? "border-orange-900 text-orange-400" : "border-yellow-900 text-yellow-400"}>{v.severity}</Badge>
                </div>
                <p className="text-xs text-slate-400">{v.description}</p>
                {v.filePath && <div className="mt-3 text-[10px] text-slate-500 font-mono bg-slate-900 p-2 rounded-lg truncate">{v.filePath}</div>}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
