"use client";

import { useEffect, useState } from "react";

export default function ReviewReport() {
  const [report, setReport] = useState<any>(null);

  useEffect(() => {
    fetch("/api/mission-control/review")
      .then((r) => r.json())
      .then(setReport);
  }, []);

  if (!report) {
    return <div>Loading Review Report...</div>;
  }

  return (
    <div className="rounded-xl border p-4 space-y-3">
      <h2 className="text-xl font-bold">
        Review Report
      </h2>

      <div>Total: {report.total}</div>
      <div>Pending: {report.pending}</div>
      <div>Approved: {report.approved}</div>
      <div>Rejected: {report.rejected}</div>

      <div className="space-y-2">
        {report.items?.slice(0, 20).map((item: any) => (
          <div
            key={item.id}
            className="border rounded-lg p-3"
          >
            <div className="font-semibold">
              {item.title}
            </div>

            <div>{item.description}</div>

            <div className="text-sm opacity-70">
              {item.file}
            </div>

            <div className="text-xs">
              Status: {item.status}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
