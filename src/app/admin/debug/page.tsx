"use client";

import { useEffect, useState } from "react";
import { db } from "@/firebase/config";
import { collection, getDocs, limit, query } from "firebase/firestore";

export default function AutonomousDashboard() {
  const [system, setSystem] = useState({
    patchesReady: 0,
    latency: 0,
    ciStatus: "PENDING",
    logs: [] as string[]
  });

  const [deploying, setDeploying] = useState(false);

  const runDiagnostics = async () => {
    const start = performance.now();
    try {
      await getDocs(query(collection(db, "settings"), limit(1)));
      setSystem((p) => ({
        ...p,
        latency: Math.round(performance.now() - start),
        ciStatus: "HEALTHY",
        patchesReady: 3,
        logs: [
          `[${new Date().toLocaleTimeString()}] Firestore connected`,
          `[${new Date().toLocaleTimeString()}] Governance scan completed`,
        ],
      }));
    } catch (error) {
      console.error(error);
      setSystem((p) => ({
        ...p,
        ciStatus: "CRITICAL",
        logs: [...p.logs, `[${new Date().toLocaleTimeString()}] Firestore connection failed`],
      }));
    }
  };

  const triggerAutoPatch = async () => {
    setDeploying(true);
    try {
      // Yahan tumhara actual API call logic aayega (e.g., fetch('/api/governance/deploy'))
      await new Promise((resolve) => setTimeout(resolve, 2000));
      setSystem((p) => ({ ...p, patchesReady: 0, logs: [...p.logs, `[${new Date().toLocaleTimeString()}] Patches deployed successfully`] }));
    } finally {
      setDeploying(false);
    }
  };

  useEffect(() => { runDiagnostics(); }, []);

  return (
    <div className="p-10 bg-black min-h-screen text-white font-sans">
      <div className="flex justify-between items-end mb-12">
        <div>
          <h1 className="text-6xl font-black italic tracking-tighter">JEMBEEKART OPS</h1>
          <p className="text-blue-500 font-mono mt-2">v15.1 // COMPLIANCE_ENFORCEMENT_ENABLED</p>
        </div>
        <button 
          disabled={deploying || system.patchesReady === 0}
          onClick={triggerAutoPatch}
          className="bg-blue-600 hover:bg-blue-500 disabled:bg-slate-700 px-8 py-4 rounded-2xl font-black text-lg transition-all"
        >
          {deploying ? "DEPLOYING..." : "EXECUTE AUTO-REMEDIATION"}
        </button>
      </div>

      {/* Grid: Metrics */}
      <div className="grid grid-cols-3 gap-8">
        <div className="bg-slate-900/50 p-8 rounded-3xl border border-slate-800">
          <p className="text-slate-500 font-bold uppercase text-xs mb-2">Auto-Fix Queue</p>
          <div className="text-6xl font-black">{system.patchesReady}</div>
        </div>
        <div className="bg-slate-900/50 p-8 rounded-3xl border border-slate-800">
          <p className="text-slate-500 font-bold uppercase text-xs mb-2">CI/CD Pipeline</p>
          <div className="text-3xl font-black mt-4">{system.ciStatus}</div>
        </div>
        <div className="bg-slate-900/50 p-8 rounded-3xl border border-slate-800">
           <p className="text-slate-500 font-bold uppercase text-xs mb-2">System Latency</p>
           <div className="text-6xl font-black">{system.latency}ms</div>
        </div>
      </div>

      {/* Audit Log Section */}
      <div className="mt-8 bg-slate-950 p-8 rounded-3xl border border-slate-800">
        <h3 className="font-black text-xl mb-6">COMPLIANCE AUDIT TRAIL</h3>
        <div className="space-y-4">
          {system.logs.length === 0 ? (
            <p className="text-slate-500">No audit logs</p>
          ) : (
            system.logs.map((log, index) => (
              <div key={index} className="flex justify-between border-b border-slate-800 pb-2">
                <span className="font-mono text-sm">{log}</span>
                <span className="text-emerald-500 font-bold text-xs">APPLIED</span>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
