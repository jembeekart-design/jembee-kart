"use client";

import { useEffect, useState, useCallback, useRef, useMemo } from "react";
import { runSystemScan, type ScanResult } from "@/lib/governance/runSystemScan";
import { 
  RefreshCw, Loader2, ExternalLink, Copy, Wrench, 
  AlertTriangle, CheckCircle2, XCircle, Eye 
} from "lucide-react";
import { getFixSuggestion } from "@/lib/governance/ai-fix/engine";
import { generatePreview } from "@/lib/governance/ai-fix/preview";
import type { PreviewResult } from "@/lib/governance/ai-fix/preview";
import AIFixPreview from "./AIFixPreview";
const STATUS_ORDER: Record<ScanResult["status"], number> = { FAIL: 0, WARNING: 1, PASS: 2 };
const DEFAULT_HEALTH_WEIGHTS: Record<ScanResult["status"], number> = { PASS: 100, WARNING: 60, FAIL: 0 };
const GITHUB_REPO = process.env.NEXT_PUBLIC_GITHUB_REPO ?? "";

export default function ScannerResults() {
  const [results, setResults] = useState<ScanResult[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastScan, setLastScan] = useState<Date | null>(null);
  const [scanTime, setScanTime] = useState(0);
  const [countdown, setCountdown] = useState(60);
  const [liveMode, setLiveMode] = useState(true);
  const [copiedFile, setCopiedFile] = useState<string | null>(null);
  const [selectedPreview, setSelectedPreview] =
  useState<PreviewResult | null>(null);
  
  const scanRunning = useRef(false);
  const mounted = useRef(true);
  const copyTimeout = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    mounted.current = true;
    return () => { 
      mounted.current = false; 
      if (copyTimeout.current) clearTimeout(copyTimeout.current);
    };
  }, []);

  const handleAutoFix = async (item: ScanResult) => {
  const suggestion = await getFixSuggestion(item);

  if (!suggestion) {
    alert("No AI Fix available.");
    return;
  }

  const preview = await generatePreview(suggestion);

  setSelectedPreview(preview);
};

  // DEBUGGING: Temporary version of openGitHubFile
  const openGitHubFile = (item: ScanResult) => {
    console.log("GITHUB_REPO:", GITHUB_REPO);
    console.log("ITEM:", item);

    if (!item.file) {
      alert("item.file is missing");
      return;
    }

    const line = item.line ? `#L${item.line}` : "";
    const url = `${GITHUB_REPO}${item.file}${line}`;

    console.log("Opening:", url);

    window.open(url, "_blank", "noopener,noreferrer");
  };

  const copyFilePath = async (text: string, id: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedFile(id);
      if (copyTimeout.current) clearTimeout(copyTimeout.current);
      copyTimeout.current = setTimeout(() => {
        if (mounted.current) setCopiedFile(null);
      }, 1500);
    } catch (err) { console.error("Clipboard error", err); }
  };

  const performScan = useCallback(async () => {
    if (scanRunning.current) return;
    scanRunning.current = true;
    setLoading(true);
    setError(null);
    const started = performance.now();
    try {
      const data = await runSystemScan();
      const sortedResults = [...data].sort((a, b) => {
        const diff = STATUS_ORDER[a.status] - STATUS_ORDER[b.status];
        return diff !== 0 ? diff : a.name.localeCompare(b.name);
      });
      if (mounted.current) {
        setResults(sortedResults);
        setLastScan(new Date());
        setScanTime(Math.round(performance.now() - started));
        setCountdown(60);
      }
    } catch (err) { 
      console.error("Governance scan failed:", err);
      if (mounted.current) setError("Service unreachable."); 
    }
    finally { scanRunning.current = false; if (mounted.current) setLoading(false); }
  }, []);

  useEffect(() => { performScan(); }, [performScan]);

  useEffect(() => {
    const timer = setInterval(() => {
      if (!liveMode || document.hidden || scanRunning.current) return;
      setCountdown((c) => { if (c <= 1) { performScan(); return 60; } return c - 1; });
    }, 1000);
    return () => clearInterval(timer);
  }, [liveMode, performScan]);

  const summary = useMemo(() => {
    let pass = 0, warning = 0, fail = 0;
    for (const r of results) {
      if (r.status === "PASS") pass++;
      else if (r.status === "WARNING") warning++;
      else fail++;
    }
    return { total: results.length, pass, warning, fail };
  }, [results]);

  const { healthScore, healthColor, healthLabel } = useMemo(() => {
    const score = results.length === 0 ? 0 : Math.round(results.reduce((acc, r) => acc + (DEFAULT_HEALTH_WEIGHTS[r.status] || 0), 0) / results.length);
    const color = score >= 95 ? "text-green-600" : score >= 80 ? "text-blue-600" : score >= 60 ? "text-yellow-600" : "text-red-600";
    const label = score >= 95 ? "Excellent" : score >= 80 ? "Stable" : score >= 60 ? "Needs Attention" : "Critical";
    return { healthScore: score, healthColor: color, healthLabel: label };
  }, [results]);

  return (
    <section className="rounded-2xl border bg-white shadow-xl overflow-hidden">
      <div className="p-6 border-b bg-gray-50/30 flex justify-between">
        <div>
          <h2 className="text-xs font-black uppercase text-gray-400">Overall Health</h2>
          <div className="flex items-baseline gap-2">
            <span className={`text-3xl font-black ${healthColor}`}>{healthScore}%</span>
            <p className={`text-xs font-bold ${healthColor}`}>{healthLabel}</p>
          </div>
          <div className="grid grid-cols-4 gap-3 mt-4">
            <div className="rounded-lg bg-gray-100 p-3 text-center"><p className="text-[10px] uppercase font-bold text-gray-500">Total</p><p className="text-xl font-black">{summary.total}</p></div>
            <div className="rounded-lg bg-green-50 p-3 text-center"><p className="text-[10px] uppercase font-bold text-green-700">PASS</p><p className="text-xl font-black text-green-700">{summary.pass}</p></div>
            <div className="rounded-lg bg-yellow-50 p-3 text-center"><p className="text-[10px] uppercase font-bold text-yellow-700">WARNING</p><p className="text-xl font-black text-yellow-700">{summary.warning}</p></div>
            <div className="rounded-lg bg-red-50 p-3 text-center"><p className="text-[10px] uppercase font-bold text-red-700">FAIL</p><p className="text-xl font-black text-red-700">{summary.fail}</p></div>
          </div>
          <p className="mt-4 text-[10px] text-gray-400">Last Scan: {lastScan?.toLocaleTimeString() ?? "Pending"} | Scan Time: {scanTime}ms</p>
        </div>
        <button onClick={() => setLiveMode(!liveMode)} className={`px-2 py-1 h-6 rounded border text-[9px] font-bold uppercase ${liveMode ? "bg-green-100 text-green-700" : "bg-gray-100"}`}>Live : {liveMode ? "ON" : "OFF"}</button>
      </div>

      <div className="divide-y">
        {results.map((item) => (
          <div key={item.id} className="p-4 hover:bg-gray-50 transition-colors">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-sm font-bold">{item.name}</p>
                <p className="text-[11px] text-gray-500">{item.message}</p>
              </div>
              <span className={`px-2 py-1 rounded text-[9px] font-bold uppercase flex items-center gap-1 ${item.status === "PASS" ? "bg-green-100 text-green-700" : item.status === "WARNING" ? "bg-yellow-100 text-yellow-700" : "bg-red-100 text-red-700"}`}>
                {item.status === "PASS" ? <CheckCircle2 size={10}/> : item.status === "WARNING" ? <AlertTriangle size={10}/> : <XCircle size={10}/>} {item.status}
              </span>
            </div>

            <div className="mt-4 flex gap-2">
              {item.autoFix && (
                <button onClick={() => handleAutoFix(item)} className="bg-emerald-600 text-white px-3 py-1 rounded text-[10px] font-bold uppercase flex items-center gap-1">
                  <Wrench size={10} /> Auto-Fix
                </button>
              )}
              {item.fixedCode && (
  <button
    onClick={() =>
      setSelectedPreview({
        file: item.file ?? "",
        lineStart: item.line ?? 1,
        description: item.message,
        code: item.fixedCode,
      })
    }
    className="border px-3 py-1 rounded text-[10px] font-bold uppercase flex items-center gap-1"
  >
    <Eye size={10} />
    Preview
  </button>
)}
              <button 
                disabled={!GITHUB_REPO} 
                onClick={() => openGitHubFile(item)} 
                className="border px-3 py-1 rounded text-[10px] font-bold uppercase flex items-center gap-1 disabled:opacity-50"
              >
                <ExternalLink size={10} /> GitHub
              </button>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
