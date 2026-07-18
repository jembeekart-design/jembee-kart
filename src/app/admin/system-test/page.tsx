"use client";
import { useState } from "react";
import * as Diagnostics from "@/lib/diagnosticServices";

export default function SystemTestPage() {
  const [results, setResults] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  // 'async' कीवर्ड यहाँ होना अनिवार्य है
  const runDiagnostics = async () => {
    setLoading(true);
    
    // सभी कार्यों (tasks) को यहाँ परिभाषित करें
    const tasks = [
      { name: "Auth Check", fn: async () => await Diagnostics.checkAuth() },
      { name: "Admin Permission", fn: async () => {
          const authData = await Diagnostics.checkAuth();
          return await Diagnostics.checkAdmin(authData.uid);
      }},
    ];

    // 'async' का उपयोग करके कार्यों को समांतर (parallel) तरीके से चलाएं
    const settledResults = await Promise.allSettled(tasks.map(async (t) => await t.fn()));
    
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
      
      <table className="w-full border rounded-lg">
        <thead>
          <tr className="bg-gray-100">
            <th className="p-3 text-left">Test Name</th>
            <th className="p-3 text-left">Status</th>
            <th className="p-3 text-left">Message</th>
          </tr>
        </thead>
        <tbody>
          {results.map((r, i) => (
            <tr key={i} className="border-b">
              <td className="p-3 font-semibold">{r.name}</td>
              <td className={`p-3 font-bold ${r.status === "PASS" ? "text-green-600" : "text-red-600"}`}>
                {r.status}
              </td>
              <td className="p-3 text-sm text-gray-500">{r.message}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
