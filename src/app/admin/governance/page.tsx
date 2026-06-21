"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import { GovernanceDashboardReport } from "@/jembee-governance/types/governance.types";

const Badge = ({ children, className }: { children: React.ReactNode; className?: string }) => (
  <div className={`px-4 py-2 rounded-xl border text-sm font-semibold ${className}`}>{children}</div>
);

const StatusCard = ({ title, value, color }: { title: string; value: any; color?: string }) => (
  <div className="bg-gradient-to-br from-slate-900 to-slate-950 border border-slate-800 rounded-3xl p-6 shadow-xl">
    <h3 className="text-slate-400 text-xs uppercase tracking-wider">{title}</h3>
    <p className={`text-3xl font-light mt-2 ${color || "text-white"}`}>{value}</p>
  </div>
);

export default function GovernancePage() {
  const [report, setReport] = useState<GovernanceDashboardReport | null>(null);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [severityFilter, setSeverityFilter] = useState("ALL");
  const [visibleCount, setVisibleCount] = useState(100);
  const [scanTime, setScanTime] = useState(new Date().toLocaleTimeString());

  const loadReport = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/governance");
      const data = await res.json();
      if (data.success) {
        setReport(data.report);
        setScanTime(new Date().toLocaleTimeString());
      }
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadReport();
    const interval = setInterval(loadReport, 30000);
    return () => clearInterval(interval);
  }, [loadReport]);

  useEffect(() => { setVisibleCount(100); }, [search, severityFilter]);

  const counters = useMemo(() => ({
    critical: report?.violations?.filter(v => v.severity === "CRITICAL").length || 0,
    error: report?.violations?.filter(v => v.severity === "ERROR").length || 0,
    warning: report?.violations?.filter(v => v.severity === "WARNING").length || 0,
  }), [report]);

  if (loading && !report) return <div className="min-h-screen bg-slate-950 flex items-center justify-center text-indigo-500">Initializing Governance Engine...</div>;
  if (!report) return <div className="min-h-screen bg-slate-950 flex items-center justify-center text-red-400">Report unavailable</div>;

  const score = report.overallScore ?? 0;
  const scoreColor = score >= 80 ? "stroke-emerald-500" : score >= 60 ? "stroke-amber-500" : "stroke-red-500";

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top,#1e1b4b,#020617)] text-white p-8">
      {/* Deployment Banner */}
      {report.deploymentStatus === "BLOCKED" && (
        <div className="mb-6 rounded-2xl border border-red-500/30 bg-red-500/10 p-6 shadow-2xl flex flex-col md:flex-row md:justify-between md:items-center gap-4">
          <div>
            <h3 className="font-bold text-red-400 text-lg">Deployment Blocked</h3>
            <p className="text-sm text-red-300">Fix all critical governance violations before deployment.</p>
          </div>
          <div className="flex gap-4 text-xs font-mono bg-red-950/30 px-4 py-2 rounded-lg border border-red-500/20">
            <span>CRITICAL: {counters.critical}</span>
            <span>ERRORS: {counters.error}</span>
          </div>
        </div>
      )}

      {/* Hero Section */}
      <div className="grid md:grid-cols-3 gap-8 mb-10">
        <div className="bg-slate-900/40 border border-slate-800 rounded-3xl p-8 flex flex-col items-center justify-center">
           <div className="relative w-40 h-40">
            <svg className="w-40 h-40 rotate-[-90deg]">
              <circle cx="80" cy="80" r="65" strokeWidth="10" className="stroke-slate-800 fill-none" />
              <circle cx="80" cy="80" r="65" strokeWidth="10" strokeDasharray={408} strokeDashoffset={408 - (score / 100) * 408} className={`${scoreColor} fill-none transition-all duration-1000`} />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-3xl font-bold">{score}%</span>
            </div>
          </div>
        </div>
        <div className="md:col-span-2 grid grid-cols-2 md:grid-cols-4 gap-4">
          {[ 
            { n: "Architecture", v: report.architectureScore }, { n: "Security", v: report.securityScore }, 
            { n: "Profitability", v: report.profitabilityScore }, { n: "Theme", v: report.themeScore },
            { n: "Admin Control", v: report.adminControlScore }, { n: "Duplicate Code", v: report.duplicateCodeScore },
            { n: "Hardcoded Rules", v: report.hardcodedRuleScore }, { n: "Page Conn.", v: report.pageConnectionScore }
          ].map((m, i) => (
            <div key={i} className="bg-slate-900/50 p-4 rounded-2xl border border-slate-800">
              <h4 className="text-[9px] text-slate-500 uppercase tracking-wider">{m.n}</h4>
              <p className="text-lg font-semibold">{m.v}%</p>
            </div>
          ))}
        </div>
      </div>

      {/* Trend Widget */}
      <div className="bg-slate-900/40 border border-slate-800 rounded-3xl p-8 mb-8">
        <h3 className="text-lg font-bold mb-6">Governance Trend</h3>
        <div className="flex items-end justify-between h-32 gap-4">
          {report.history?.length ? report.history.map((item, i) => (
            <div key={i} className="flex-1 flex flex-col items-center gap-2 group">
              <span className="text-[10px] text-slate-400 opacity-0 group-hover:opacity-100 transition-opacity">{item.overallScore}%</span>
              <div className="w-full bg-indigo-500 rounded-t-lg hover:bg-indigo-400 transition-all" style={{ height: `${item.overallScore}%` }} />
              <p className="text-[10px] text-slate-500">{new Date(item.scanDate).toLocaleDateString()}</p>
            </div>
          )) : <p className="text-slate-500 italic">No history available.</p>}
        </div>
      </div>
      
      {/* (Incident Log Component remains the same) */}
    </div>
  );
}
