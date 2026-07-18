"use client";
import { useState } from "react";
import * as Diagnostics from "@/lib/diagnosticServices";

export default function SystemTestPage() {
  const [results, setResults] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  const runDiagnostics = async () => {
    setLoading(true);
    const startTime = performance.now();
    
    // Define all tasks
    const tasks = [
      { name: "Auth Check", fn: () => Diagnostics.checkAuth() },
      { name: "Admin Permission", fn: async () => {
          const authData = await Diagnostics.checkAuth();
          return Diagnostics.checkAdmin(authData.uid);
      }},
      // Add more tasks here...
    ];

    // Run parallel
    const settledResults = await Promise.allSettled(tasks.map(t => t.fn()));
    
    const finalResults = settledResults.map((res, i) => ({
      name: tasks[i].name,
      status: res.status === "fulfilled" ? "PASS" : "FAIL",
      message: res.status === "fulfilled" ? String(res.value) : (res as any).reason.message
    }));

    setResults(finalResults);
    setLoading(false);
  };

  return (
    <div className="p-6">
      <div className="flex justify-between mb-6">
        <h1 className="text-2xl font-bold">System Health Monitor</h1>
        <button 
          onClick={runDiagnostics} 
          disabled={loading}
          className="bg-blue-600 text-white px-4 py-2 rounded"
        >
          {loading ? "Running Tests..." : "Run Diagnostics"}
        </button>
      </div>
      
      {/* Table Rendering */}
      <table className="w-full border rounded-lg">
        {results.map((r, i) => (
          <tr key={i} className="border-b">
            <td className="p-3 font-semibold">{r.name}</td>
            <td className={`p-3 ${r.status === "PASS" ? "text-green-600" : "text-red-600"}`}>
              {r.status}
            </td>
            <td className="p-3 text-sm text-gray-500">{r.message}</td>
          </tr>
        ))}
      </table>
    </div>
  );
}
