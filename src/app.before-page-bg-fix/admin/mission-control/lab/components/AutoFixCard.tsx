"use client";

import { useState } from "react";

export default function AutoFixCard() {
  const [loading, setLoading] = useState(false);

  async function runHardAutoFix() {
    setLoading(true);

    try {
      const review = await fetch("/api/mission-control/review");
      const report = await review.json();

      const res = await fetch("/api/mission-control/autofix/hard", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          items: report.items ?? [],
        }),
      });

      const data = await res.json();

      alert(
        `Fixed: ${data.fixed}\nSkipped: ${data.skipped}`
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="rounded-xl border p-4 space-y-3">
      <h2 className="text-xl font-bold">
        Hard Auto Fix
      </h2>

      <button
        onClick={runHardAutoFix}
        disabled={loading}
        className="rounded bg-red-600 px-4 py-2 text-white disabled:opacity-50"
      >
        {loading ? "Running..." : "Run Hard Auto Fix"}
      </button>
    </div>
  );
}
