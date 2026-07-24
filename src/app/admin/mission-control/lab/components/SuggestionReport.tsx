"use client";

import { useEffect, useState } from "react";

export default function SuggestionReport() {
  const [report, setReport] = useState<any>(null);

  useEffect(() => {
    fetch("/api/mission-control/suggestions")
      .then((r) => r.json())
      .then(setReport)
      .catch(console.error);
  }, []);

  if (!report) {
    return (
      <div className="rounded-xl border p-4">
        Loading Suggestions...
      </div>
    );
  }

  return (
    <div className="rounded-xl border p-4 space-y-3">
      <h2 className="text-xl font-bold">
        Suggestion Report
      </h2>

      <div>Total: {report.total}</div>
      <div>Critical: {report.critical}</div>
      <div>Warnings: {report.warnings}</div>
      <div>Info: {report.info}</div>

      <div className="space-y-2">
        {report.suggestions?.slice(0, 20).map((item: any) => (
          <div
            key={item.id}
            className="border rounded-lg p-3"
          >
            <div className="font-semibold">{item.title}</div>
            <div>{item.description}</div>
            <div className="text-sm opacity-70">{item.file}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
