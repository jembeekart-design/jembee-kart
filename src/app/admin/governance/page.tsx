"use client";

import { useState, useEffect, useMemo } from "react";
import {
  GovernanceDashboardReport,
  GovernanceViolation,
} from "@/jembee-governance/types/governance.types";

export default function GovernancePage() {
  const [report, setReport] = useState<GovernanceDashboardReport | null>(null);
  const [loading, setLoading] = useState(true);
  const [visibleCount, setVisibleCount] = useState(100);
  const [severityFilter, setSeverityFilter] = useState("ALL");
  const [search, setSearch] = useState("");

  useEffect(() => {
    fetch("/api/governance")
      .then((res) => res.json())
      .then((data) => {
        if (data.success) {
          setReport(data.report);
        }
      })
      .catch((err) => console.error("Failed to fetch:", err))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    setVisibleCount(100);
  }, [search, severityFilter]);

  const filteredViolations = useMemo(() => {
    return report?.violations?.filter((item: GovernanceViolation) => {
      const matchesSeverity = severityFilter === "ALL" ? true : item.severity === severityFilter;
      
      const searchTerm = search.toLowerCase();
      const matchesSearch =
        item.title?.toLowerCase().includes(searchTerm) ||
        item.filePath?.toLowerCase().includes(searchTerm) ||
        item.description?.toLowerCase().includes(searchTerm) ||
        item.category?.toLowerCase().includes(searchTerm);

      return matchesSeverity && matchesSearch;
    }) || [];
  }, [report, search, severityFilter]);

  const criticalCount = report?.violations?.filter((v) => v.severity === "CRITICAL").length || 0;
  const errorCount = report?.violations?.filter((v) => v.severity === "ERROR").length || 0;
  const warningCount = report?.violations?.filter((v) => v.severity === "WARNING").length || 0;

  if (loading) return <div className="min-h-screen bg-slate-950 text-slate-400 flex items-center justify-center">Loading...</div>;
  if (!report) return <div className="min-h-screen bg-slate-950 text-rose-400 flex items-center justify-center">Failed to load report.</div>;

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 p-8 font-sans">
      <header className="mb-10 border-b border-slate-800 pb-6">
        <h1 className="text-4xl font-extralight tracking-tight text-white">
          JembeeKart <span className="font-semibold text-indigo-500">Governance</span>
        </h1>
      </header>

      {/* Main Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        {[
          { label: "Deployment Status", value: report.deploymentStatus, color: report.deploymentStatus === "PASS" ? "text-emerald-400" : "text-rose-400" },
          { label: "Overall System Health", value: `${report.overallScore}%`, color: "text-white" },
          { label: "Total Violations", value: report.totalViolations, color: "text-amber-400" },
        ].map((stat, i) => (
          <div key={i} className="bg-slate-900/50 border border-slate-800 p-6 rounded-2xl">
            <h3 className="text-slate-400 text-sm uppercase tracking-wider">{stat.label}</h3>
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
          <div key={i} className="bg-slate-900/30 border border-slate-800 p-4 rounded-xl text-center">
            <h4 className="text-xs text-slate-500 mb-1">{m.name}</h4>
            <p className="text-2xl font-semibold">{m.val}%</p>
          </div>
        ))}
      </div>

      {/* Counters */}
      <div className="flex gap-4 mb-6 text-sm">
        <span className="text-rose-400 font-bold bg-rose-500/10 px-3 py-1 rounded">Critical: {criticalCount}</span>
        <span className="text-red-400 font-bold bg-red-500/10 px-3 py-1 rounded">Error: {errorCount}</span>
        <span className="text-amber-400 font-bold bg-amber-500/10 px-3 py-1 rounded">Warning: {warningCount}</span>
      </div>

      {/* Incident Log */}
      <div className="bg-slate-900/40 border border-slate-800 rounded-2xl p-8 mb-10">
        <h2 className="text-xl font-light mb-6 text-white border-b border-slate-800 pb-4">Incident Log ({filteredViolations.length})</h2>
        
        <div className="flex flex-col md:flex-row gap-4 mb-6">
          <input type="text" placeholder="Search..." value={search} onChange={(e) => setSearch(e.target.value)} className="flex-1 bg-slate-900 border border-slate-700 rounded-lg px-4 py-2 text-sm"/>
          <select value={severityFilter} onChange={(e) => setSeverityFilter(e.target.value)} className="bg-slate-900 border border-slate-700 rounded-lg px-4 py-2 text-sm">
            <option value="ALL">All Severities</option>
            <option value="CRITICAL">Critical</option>
            <option value="ERROR">Error</option>
            <option value="WARNING">Warning</option>
          </select>
        </div>

        <div className="space-y-4">
          {filteredViolations.slice(0, visibleCount).map((item, i) => (
            <div key={i} className="bg-slate-950 p-5 rounded-lg border border-slate-800">
               <h3 className="text-red-400 font-semibold">{item.title}</h3>
               <div className="mt-2 text-xs text-slate-300">
                 <p>Category: {item.category}</p>
                 <p className="italic border-t border-slate-800 mt-2 pt-2">{item.description}</p>
                 <p className="text-emerald-400 mt-2">Fix: {item.recommendation}</p>
                 <p className="text-slate-500 mt-2 font-mono break-all">File: {item.filePath}</p>
               </div>
            </div>
          ))}
          {filteredViolations.length === 0 && <div className="text-center py-10 text-slate-500">No violations found.</div>}
        </div>

        {visibleCount < filteredViolations.length && (
          <div className="mt-6 flex justify-center">
            <button onClick={() => setVisibleCount(p => Math.min(p + 100, 1000))} className="px-6 py-3 bg-indigo-600 rounded-lg">
              Load More ({filteredViolations.length - visibleCount} remaining)
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
