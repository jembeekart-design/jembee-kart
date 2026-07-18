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
    const tempResults: Result[] = [];

    // Tasks (एक-एक करके uncomment करें और टेस्ट करें)
    const tasks = [
      { name: "Auth Check", fn: () => Diagnostics.checkAuth() },
      { name: "Admin Permission", fn: async () => { 
          const authData = await Diagnostics.checkAuth(); 
          return await Diagnostics.checkAdmin(authData.uid); 
      }},
      { name: "Firestore Read", fn: () => Diagnostics.firestoreRead() },
      { name: "Firestore Write/Delete", fn: () => Diagnostics.firestoreWriteDelete() },
      { name: "Storage Test", fn: () => Diagnostics.storageTest() },
      { name: "API Health", fn: () => Diagnostics.apiHealth() },
    ];

    // Sequential loop (Debugging के लिए बेहतरीन)
    for (const task of tasks) {
      try {
        console.log("Running:", task.name);
        const value = await task.fn();
        
        tempResults.push({
          name: task.name,
          status: "PASS",
          message: typeof value === "object" ? JSON.stringify(value) : String(value),
        });
      } catch (e: any) {
        console.error("Failed:", task.name, e);
        tempResults.push({
          name: task.name,
          status: "FAIL",
          message: e.message || "Unknown Error",
        });
      }
    }

    setResults(tempResults);
    setResponseTime(Math.round(performance.now() - start));
    
    const pass = tempResults.filter((x) => x.status === "PASS").length;
    setHealthScore(tempResults.length > 0 ? Math.round((pass / tempResults.length) * 100) : 0);
    
    setLoading(false);
  };

  const passCount = results.filter((r) => r.status === "PASS").length;
  const failCount = results.filter((r) => r.status === "FAIL").length;

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <div className="mx-auto max-w-7xl">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">🚀 System Debugger</h1>
            <p className="text-gray-500">Sequential Execution Mode</p>
          </div>
          <button
            onClick={runDiagnostics}
            disabled={loading}
            className="rounded-lg bg-blue-600 px-6 py-3 font-semibold text-white hover:bg-blue-700 disabled:opacity-50"
          >
            {loading ? "Testing..." : "Run Diagnostics"}
          </button>
        </div>

        {/* Stats Section */}
        <div className="mb-8 grid grid-cols-2 gap-4 md:grid-cols-4">
          <StatCard label="Health Score" value={`${healthScore}%`} color="text-green-600" />
          <StatCard label="PASS" value={passCount.toString()} color="text-green-600" />
          <StatCard label="FAIL" value={failCount.toString()} color="text-red-600" />
          <StatCard label="Time" value={`${responseTime} ms`} color="text-blue-600" />
        </div>

        {/* Results Table */}
        <div className="overflow-hidden rounded-lg bg-white shadow">
          <table className="w-full">
            <thead className="bg-gray-50">
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
