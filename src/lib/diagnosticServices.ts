"use client";

import { useState } from "react";
import * as Diagnostics from "@/lib/diagnosticServices";

type Result = {
  name: string;
  status: "PASS" | "FAIL";
  message: string;
};

export default function SystemTestPage() {
  const [results, setResults] = useState<Result[]>([]);
  const [loading, setLoading] = useState(false);
  const [responseTime, setResponseTime] = useState(0);
  const [healthScore, setHealthScore] = useState(0);

  const runDiagnostics = async () => {
    setLoading(true);
    const start = performance.now();
    const tempResults: Result[] = [];

    const tasks = [
      { name: "Authentication", fn: () => Diagnostics.checkAuth() },
      { name: "Admin Permission", fn: async () => {
          const authData = await Diagnostics.checkAuth();
          return await Diagnostics.checkAdmin(authData.uid);
      }},
      { name: "Firestore Read", fn: () => Diagnostics.firestoreRead() },
      { name: "Firestore Write", fn: () => Diagnostics.firestoreWriteDelete() }, // Write & Delete
      { name: "Storage Test", fn: () => Diagnostics.storageTest() },
      { name: "API Health", fn: () => Diagnostics.apiHealth() },
      { name: "Database Latency", fn: () => Diagnostics.databaseLatency() },
      { name: "Realtime Listener", fn: () => Diagnostics.realtimeListenerTest() },
      { name: "Browser Info", fn: () => Diagnostics.browserInfo() },
      { name: "Environment", fn: () => Diagnostics.environment() },
    ];

    for (const task of tasks) {
      try {
        const value = await task.fn();
        tempResults.push({ name: task.name, status: "PASS", message: String(value) });
      } catch (e: any) {
        tempResults.push({ name: task.name, status: "FAIL", message: e.message });
      }
    }

    setResults(tempResults);
    setResponseTime(Math.round(performance.now() - start));
    const pass = tempResults.filter((r) => r.status === "PASS").length;
    setHealthScore(Math.round((pass / tempResults.length) * 100));
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="mx-auto max-w-5xl">
        <header className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">System Health Monitor</h1>
          <p className="text-gray-500">JembeeKart Enterprise Diagnostics - {new Date().toLocaleString()}</p>
        </header>

        {/* Dashboard Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <StatCard title="Overall Health" value={`${healthScore}%`} color="text-blue-600" />
          <StatCard title="Tests Passed" value={results.filter(r => r.status === "PASS").length.toString()} color="text-green-600" />
          <StatCard title="Tests Failed" value={results.filter(r => r.status === "FAIL").length.toString()} color="text-red-600" />
          <StatCard title="Response Time" value={`${responseTime}ms`} color="text-purple-600" />
        </div>

        <button
          onClick={runDiagnostics}
          disabled={loading}
          className="w-full mb-8 bg-black text-white py-4 rounded-xl font-bold hover:bg-gray-800 disabled:opacity-50 transition"
        >
          {loading ? "Running Diagnostics..." : "Run System Health Check"}
        </button>

        {/* Results Table */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <table className="w-full text-left">
            <thead className="bg-gray-50">
              <tr>
                <th className="p-4 font-semibold text-gray-600">Test Name</th>
                <th className="p-4 font-semibold text-gray-600">Status</th>
                <th className="p-4 font-semibold text-gray-600">Details</th>
              </tr>
            </thead>
            <tbody>
              {results.map((r, i) => (
                <tr key={i} className="border-t border-gray-100">
                  <td className="p-4 font-medium text-gray-900">{r.name}</td>
                  <td className={`p-4 font-bold ${r.status === "PASS" ? "text-green-600" : "text-red-600"}`}>{r.status}</td>
                  <td className="p-4 text-gray-500 text-sm break-all">{r.message}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

function StatCard({ title, value, color }: { title: string; value: string; color: string }) {
  return (
    <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm">
      <p className="text-xs text-gray-400 uppercase tracking-wider">{title}</p>
      <p className={`text-2xl font-black ${color}`}>{value}</p>
    </div>
  );
}
