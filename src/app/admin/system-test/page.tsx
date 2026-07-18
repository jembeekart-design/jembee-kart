"use client";

import { useState } from "react";
import * as Diagnostics from "@/lib/diagnosticServices";

type Result = { name: string; status: "PASS" | "FAIL"; message: string };

export default function SystemTestPage() {
  const [results, setResults] = useState<Result[]>([]);
  const [loading, setLoading] = useState(false);

  const runDiagnostics = async () => {
    setLoading(true);
    const tempResults: Result[] = [];
    const tasks = [
      { name: "Auth", fn: () => Diagnostics.checkAuth() },
      { name: "Admin", fn: async () => { const a = await Diagnostics.checkAuth(); return await Diagnostics.checkAdmin(a.uid); }},
      { name: "Firestore Read", fn: () => Diagnostics.firestoreRead() },
      { name: "Firestore Write", fn: () => Diagnostics.firestoreWriteDelete() },
      { name: "Storage", fn: () => Diagnostics.storageTest() },
      { name: "Internet", fn: () => Diagnostics.internetCheck() },
      { name: "API Health", fn: () => Diagnostics.apiHealth() }
    ];

    for (const task of tasks) {
      try {
        const val = await task.fn();
        tempResults.push({ name: task.name, status: "PASS", message: typeof val === "object" ? JSON.stringify(val) : String(val) });
      } catch (e: any) {
        tempResults.push({ name: task.name, status: "FAIL", message: e.message });
      }
    }
    setResults(tempResults);
    setLoading(false);
  };

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <h1 className="text-2xl font-bold mb-4">System Health Monitor</h1>
      <button onClick={runDiagnostics} className="bg-blue-600 text-white px-4 py-2 rounded" disabled={loading}>
        {loading ? "Running..." : "Run Diagnostics"}
      </button>
      <div className="mt-6 space-y-2">
        {results.map((r, i) => (
          <div key={i} className={`p-3 border rounded ${r.status === "PASS" ? "border-green-500 bg-green-50" : "border-red-500 bg-red-50"}`}>
            <strong>{r.name}:</strong> {r.message}
          </div>
        ))}
      </div>
    </div>
  );
}
