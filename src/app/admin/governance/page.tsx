"use client";

import { useEffect, useState } from "react";
import { GovernanceDashboardReport } from "@/jembee-governance/types/governance.types";

// --- Components ---

const Card = ({ title, value }: { title: string; value: React.ReactNode }) => (
  <div className="rounded-xl border border-slate-800 bg-slate-900/50 p-4">
    <p className="text-[10px] uppercase text-slate-500">{title}</p>
    <p className="mt-2 text-2xl font-bold">{value}</p>
  </div>
);

const Badge = ({ children, className = "" }: { children: React.ReactNode; className?: string }) => (
  <span className={`rounded px-2 py-1 text-xs font-semibold border ${className}`}>
    {children}
  </span>
);

// --- Main Page ---

export default function GovernancePage() {
  const [loading, setLoading] = useState(true);
  const [report, setReport] = useState<GovernanceDashboardReport | null>(null);
  const [search, setSearch] = useState("");

  const loadDashboard = async () => {
    try {
      setLoading(true);
      const response = await fetch("/api/governance");
      const json = await response.json();
      if (json.report) setReport(json.report);
    } catch (error) {
      console.error("Failed to load dashboard:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDashboard();
    const timer = setInterval(loadDashboard, 30000);
    return () => clearInterval(timer);
  }, []);

  if (loading) return <div className="flex min-h-screen items-center justify-center bg-[#020617] text-[var(--button-text-color)]">Loading...</div>;
  if (!report) return <div className="flex min-h-screen items-center justify-center bg-[#020617] text-red-400">Report Not Found</div>;

  const { summary, statistics, scores, violations, health } = report;
  const criticalViolations = violations.filter((v) => v.severity === "CRITICAL");
  
  const keyword = search.toLowerCase();
  const filteredViolations = violations.filter((v) =>
    (v.title ?? "").toLowerCase().includes(keyword) ||
    (v.category ?? "").toLowerCase().includes(keyword)
  );

  return (
    <div className="min-h-screen bg-[#020617] text-[var(--button-text-color)] p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Governance Dashboard</h1>
          <p className="text-slate-400">JembeeKart Governance Engine</p>
        </div>
        <button onClick={loadDashboard} className="rounded-lg bg-indigo-600 px-4 py-2 text-sm hover:bg-indigo-700 transition">Refresh</button>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
        <Card title="Deployment" value={<Badge className={summary.deploymentReady ? "border-emerald-700 text-emerald-400" : "border-red-700 text-red-400"}>{summary.deploymentReady ? "READY" : "BLOCKED"}</Badge>} />
        <Card title="Overall Score" value={`${scores.overall}%`} />
        <Card title="Total Violations" value={statistics.totalViolations} />
        <Card title="Critical" value={<span className="text-red-400">{statistics.critical}</span>} />
      </div>

      {/* Health Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="rounded-xl border border-slate-800 bg-slate-900/50 p-5">
          <h2 className="font-semibold mb-4">Governance Health</h2>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between"><span>System Health</span><Badge className={health.healthy ? "border-emerald-700 text-emerald-400" : "border-red-700 text-red-400"}>{health.healthy ? "HEALTHY" : "UNHEALTHY"}</Badge></div>
            <div className="flex justify-between"><span>Config</span><Badge className={health.configurationLoaded ? "border-emerald-700 text-emerald-400" : "border-red-700 text-red-400"}>{health.configurationLoaded ? "LOADED" : "FAILED"}</Badge></div>
          </div>
        </div>
        <div className="rounded-xl border border-slate-800 bg-slate-900/50 p-5">
          <h2 className="font-semibold mb-4">Critical Violations</h2>
          <div className="space-y-2">
            {criticalViolations.length > 0 ? criticalViolations.map(v => <div key={v.id} className="text-red-400 text-sm truncate">{v.title}</div>) : <p className="text-sm text-slate-500">No critical issues</p>}
          </div>
        </div>
      </div>

      {/* Search & Table */}
      <input type="text" value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search violations..." className="w-full rounded-lg border border-slate-700 bg-slate-950 p-3 text-sm outline-none" />
      
      <div className="rounded-xl border border-slate-800 bg-slate-900/50 p-5">
        <table className="w-full text-sm">
          <thead className="border-b border-slate-700 text-left"><tr><th className="py-2">Title</th><th className="py-2">Category</th><th className="py-2">Severity</th><th className="py-2">Recommendation</th></tr></thead>
          <tbody>
            {filteredViolations.map((item) => (
              <tr key={item.id} className="border-b border-slate-800">
                <td className="py-3">{item.title}</td>
                <td className="py-3">{item.category}</td>
                <td className="py-3">
                  <Badge className={
                    item.severity === "CRITICAL" ? "border-red-700 text-red-400" :
                    item.severity === "ERROR" ? "border-orange-700 text-orange-400" :
                    item.severity === "WARNING" ? "border-yellow-700 text-yellow-400" :
                    "border-cyan-700 text-cyan-400"
                  }>
                    {item.severity}
                  </Badge>
                </td>
                <td className="py-3">{item.recommendation ?? "-"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
