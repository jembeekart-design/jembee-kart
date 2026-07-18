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
    console.log("1. Started");
    setLoading(true);
    const start = performance.now();

    try {
      console.log("2. Bypassing checkAuth with Test Data");

      // Debug: checkAuth() को अस्थायी रूप से हटाकर हार्डकोडेड डेटा का उपयोग
      const auth = {
        uid: "test-user-id-123",
        email: "test@test.com",
      };

      console.log("3. Test Data Loaded:", auth);

      // अस्थायी रूप से सिर्फ एक रिजल्ट सेट कर रहे हैं
      const testResult: Result = {
        name: "Auth (Debug Mode)",
        status: "PASS",
        message: JSON.stringify(auth),
      };

      setResults([testResult]);
      
      // Health Score Calculation
      setHealthScore(100);

      console.log("4. Results Updated");
    } catch (e) {
      console.error("ERROR:", e);
      setResults([
        {
          name: "Auth",
          status: "FAIL",
          message: e instanceof Error ? e.message : String(e),
        },
      ]);
    } finally {
      console.log("5. Finished");
      setResponseTime(Math.round(performance.now() - start));
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <div className="mx-auto max-w-7xl">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">🚀 System Debugger</h1>
            <p className="text-gray-500">Bypassing Auth to find the hang</p>
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
