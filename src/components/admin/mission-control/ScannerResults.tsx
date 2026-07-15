"use client";

import { useEffect, useState, useCallback, useRef, useMemo } from "react";
import { runSystemScan, type ScanResult } from "@/lib/governance/runSystemScan";
import { RefreshCw, AlertTriangle, ShieldCheck, ShieldAlert, Shield, Loader2 } from "lucide-react";

const STATUS_ORDER: Record<ScanResult["status"], number> = {
  FAIL: 0,
  WARNING: 1,
  PASS: 2,
};

const DEFAULT_HEALTH_WEIGHTS: Record<ScanResult["status"], number> = {
  PASS: 100,
  WARNING: 60,
  FAIL: 0,
};

export default function ScannerResults() {
  const [results, setResults] = useState<ScanResult[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastScan, setLastScan] = useState<Date | null>(null);
  const [countdown, setCountdown] = useState(60);
  
  const scanRunning = useRef(false);
  const mounted = useRef(true);

  useEffect(() => {
    mounted.current = true;
    return () => { mounted.current = false; };
  }, []);

  const performScan = useCallback(async () => {
    if (scanRunning.current) return;

    scanRunning.current = true;
    setLoading(true);
    setError(null);

    try {
      const data = await runSystemScan();
      const sortedResults = [...data].sort((a, b) => STATUS_ORDER[a.status] - STATUS_ORDER[b.status]);
      
      if (mounted.current) {
        setResults(sortedResults);
        setLastScan(new Date());
        setCountdown(60);
      }
    } catch (err) {
      if (mounted.current) setError("Governance scan service is currently unreachable.");
    } finally {
      scanRunning.current = false;
      if (mounted.current) setLoading(false);
    }
  }, []);

  // Immediate scan on mount
  useEffect(() => {
    performScan();
  }, [performScan]);

  // Auto-scan cycle
  useEffect(() => {
    if (countdown === 0) {
      performScan();
      setCountdown(60);
    }
  }, [countdown, performScan]);

  useEffect(() => {
    const timer = setInterval(() => {
      setCountdown((c) => Math.max(c - 1, 0));
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const { healthScore, healthLabel, HealthIcon, iconColor } = useMemo(() => {
    const score = results.length === 0 ? 0 : Math.round(
      results.reduce((acc, r) => acc + (DEFAULT_HEALTH_WEIGHTS[r.status] || 0), 0) / results.length
    );

    const label = score >= 95 ? "Excellent" : score >= 80 ? "Stable" : score >= 60 ? "Needs Attention" : "Critical";
    const Icon = score >= 95 ? ShieldCheck : score >= 80 ? Shield : score >= 60 ? AlertTriangle : ShieldAlert;
    const color = score >= 95 ? "text-green-600" : score >= 80 ? "text-blue-600" : score >= 60 ? "text-yellow-600" : "text-red-600";

    return { healthScore: score, healthLabel: label, HealthIcon: Icon, iconColor: color };
  }, [results]);

  return (
    <section className="rounded-2xl border bg-white shadow-xl shadow-gray-100 overflow-hidden">
      <div className="p-6 border-b flex justify-between items-start bg-gray-50/30">
        <div>
          <h2 className="text-xs font-black uppercase tracking-widest text-gray-400">System Integrity</h2>
          <div className="flex items-baseline gap-2 mt-1">
            <span className="text-3xl font-black text-gray-900">{healthScore}%</span>
            <span className={`text-sm font-bold ${iconColor}`}>{healthLabel}</span>
          </div>
          <p className="text-[10px] text-gray-400 mt-2">Last Scan: {lastScan?.toLocaleTimeString() || "Pending"}</p>
        </div>
        <HealthIcon size={32} className={iconColor} />
      </div>

      {error ? (
        <div className="p-8 text-center">
          <ShieldAlert className="mx-auto text-red-500 mb-2" size={32} />
          <p className="text-sm text-red-600 font-bold mb-4">{error}</p>
          <button onClick={performScan} disabled={loading} className="text-[10px] px-4 py-2 bg-red-600 text-white rounded-lg font-bold uppercase">Retry Scan</button>
        </div>
      ) : loading && results.length === 0 ? (
        <div className="p-12 flex flex-col items-center text-gray-400 text-xs font-bold uppercase tracking-widest">
            <Loader2 className="animate-spin mb-2" /> Scanning Governance Engine...
        </div>
      ) : results.length === 0 ? (
        <div className="p-8 text-center text-sm text-gray-500">No governance scan results available.</div>
      ) : (
        <div className="divide-y">
          {results.map((item) => (
            <div key={item.id} className="p-4 flex items-center justify-between hover:bg-gray-50 transition-colors">
              <div>
                <p className="text-sm font-bold text-gray-800">{item.name}</p>
                <p className="text-[10px] text-gray-500">{item.message}</p>
                {item.severity && <p className="text-[9px] font-bold text-gray-400 uppercase mt-1">Severity: {item.severity}</p>}
              </div>
              <span className={`px-2 py-1 rounded border text-[9px] font-bold uppercase ${item.status === "PASS" ? "bg-green-50 text-green-700 border-green-200" : item.status === "WARNING" ? "bg-yellow-50 text-yellow-700 border-yellow-200" : "bg-red-50 text-red-700 border-red-200"}`}>
                {item.status}
              </span>
            </div>
          ))}
        </div>
      )}

      <div className="p-4 bg-gray-50 border-t flex justify-between items-center text-[10px] font-bold uppercase text-gray-400">
        <span>Auto-sync in {countdown}s</span>
        <button onClick={performScan} disabled={loading} className="flex items-center gap-1 hover:text-gray-900 transition-colors disabled:opacity-50">
          <RefreshCw size={10} /> {loading ? "Scanning..." : "Force Re-Validation"}
        </button>
      </div>
    </section>
  );
}
