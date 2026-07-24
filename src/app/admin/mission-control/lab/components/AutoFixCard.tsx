"use client";

import { useState } from "react";

export default function AutoFixCard() {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);

  async function runAutoFix() {
    setLoading(true);

    try {
      const res = await fetch("/api/mission-control/autofix", {
        method: "POST",
      });

      const data = await res.json();
      setResult(data);
    } catch (e) {
      console.error(e);
    }

    setLoading(false);
  }

  return (
    <div className="rounded-xl border p-4 space-y-3">
      <h2 className="text-xl font-bold">
        Auto Fix Engine
      </h2>

      <button
        onClick={runAutoFix}
        className="rounded bg-green-600 px-4 py-2 text-white"
      >
        {loading ? "Running..." : "Run Auto Fix"}
      </button>

      {result && (
        <pre className="text-xs overflow-auto">
          {JSON.stringify(result, null, 2)}
        </pre>
      )}
    </div>
  );
}
