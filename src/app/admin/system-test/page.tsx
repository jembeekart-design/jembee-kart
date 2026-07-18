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
  const [healthScore, setHealthScore] = useState(100);

  const runDiagnostics = async () => {
    setLoading(true);
    const start = performance.now();

    try {
      const tasks = [
        { name: "Authentication", fn: () => Diagnostics.checkAuth() },
        { name: "Admin Permission", fn: async () => {
            const auth = await Diagnostics.checkAuth();
            return Diagnostics.checkAdmin(auth.uid);
        }},
        { name: "Firestore Read", fn: () => Diagnostics.firestoreRead() },
        { name: "Firestore Write/Delete", fn: () => Diagnostics.firestoreWriteDelete() },
        { name: "Storage Upload/Delete", fn: () => Diagnostics.storageTest() },
        { name: "Internet", fn: () => Diagnostics.internetCheck() },
        { name: "Database Latency", fn: () => Diagnostics.databaseLatency() },
        { name: "Realtime Listener", fn: () => Diagnostics.realtimeListenerTest() },
        { name: "Firestore Security", fn: () => Diagnostics.firestoreSecurityTest() },
        { name: "API Health", fn: () => Diagnostics.apiHealth() },
        { name: "Browser", fn: () => Diagnostics.browserInfo() },
        { name: "Environment", fn: () => Diagnostics.environment() },
        { name: "Current Time", fn: () => Diagnostics.currentTime() },
      ];

      const settled = await Promise.allSettled(tasks.map((t) => t.fn()));

      const data: Result[] = settled.map((res, index) => ({
        name: tasks[index].name,
        status: res.status === "fulfilled" ? "PASS" : "FAIL",
        message:
          res.status === "fulfilled"
            ? typeof res.value === "object"
              ? JSON.stringify(res.value)
              : String(res.value)
            : res.reason instanceof Error
            ? res.reason.message
            : String(res.reason),
      }));

      setResults(data);

      const pass = data.filter((x) => x.status === "PASS").length;
      setHealthScore(data.length > 0 ? Math.round((pass / data.length) * 100) : 0);

    } finally {
      setResponseTime(Math.round(performance.now() - start));
      setLoading(false);
    }
  };

  const passCount = results.filter((r) => r.status === "PASS").length;
  const failCount = results.filter((r) => r.status === "FAIL").length;

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <div className="mx-auto max-w-7xl">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">🚀 System Health Monitor</h1>
            <p className="text-gray-500">JembeeKart Enterprise Diagnostics</p>
          </div>
          <button
            onClick={runDiagnostics}
            disabled={loading}
            className="rounded-lg bg-blue-600 px-6 py-3 font-semibold text-white hover:bg-blue-700 disabled:opacity-50"
          >
            {loading ? "Running Diagnostics..." : "Run Diagnostics"}
          </button>
        </div>

        <div className="mb-8 grid grid-cols-2 gap-4 md:grid-cols-4">
          <StatCard label="Health Score" value={`${healthScore}%`} color="text-green-600" />
          <StatCard label="PASS" value={passCount.toString()} color="text-green-600" />
          <StatCard label="FAIL" value={failCount.toString()} color="text-red-600" />
          <StatCard label="Response Time" value={`${responseTime} ms`} color="text-blue-600" />
        </div>

        <div className="overflow-hidden rounded-lg bg-white shadow">
          <table className="w-full">
            <thead className="bg-gray-100">
              <tr>
                <th className="p-4 text-left">Test Name</th>
                <th className="p-4 text-left">Status</th>
                <th className="p-4 text-left">Message</th>
              </tr>
            </thead>
            <tbody>
              {results.map((item, index) => (
                <tr key={index} className="border-t">
                  <td className="p-4 font-medium">{item.name}</td>
                  <td className={`p-4 font-bold ${item.status === "PASS" ? "text-green-600" : "text-red-600"}`}>
                    {item.status}
                  </td>
                  <td className="p-4 text-gray-600 break-all">{item.message}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

function StatCard({ label, value, color }: { label: string; value: string; color: string }) {
  return (
    <div className="rounded-lg bg-white p-5 shadow">
      <div className="text-sm text-gray-500">{label}</div>
      <div className={`text-3xl font-bold ${color}`}>{value}</div>
    </div>
  );
}
