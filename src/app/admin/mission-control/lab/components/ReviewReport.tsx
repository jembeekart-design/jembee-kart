"use client";

import { useEffect, useState } from "react";
import { auth } from "@/firebase/config";
import type { ReviewItem, ReviewReport } from "@/mission-control/review/types";

export default function ReviewReport() {
  type ReviewReportState = Partial<ReviewReport> & {
  success?: boolean;
  message?: string;
  modifiedFiles?: unknown;
};

  const [report, setReport] = useState<ReviewReportState | null>(null);

  useEffect(() => {
    loadReport();
  }, []);

  async function loadReport() {
    const user = auth.currentUser;
    if (!user) { setReport({ success: false, message: "Please sign in as an administrator." }); return; }
    const token = await user.getIdToken();
    const res = await fetch("/api/mission-control/review", { headers: { Authorization: `Bearer ${token}` }, cache: "no-store" });
    const data = await res.json();
    setReport(data);
  }

  async function reviewAction(
    action: "approve" | "reject",
    item: ReviewItem
  ) {
    const user = auth.currentUser;
    if (!user) { alert("Please sign in as an administrator."); return; }
    const token = await user.getIdToken();
    await fetch("/api/mission-control/review/action", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        action,
        item,
      }),
    });

    loadReport();
  }

  async function applySelected() {
    if (!report) return;
    const user = auth.currentUser;
    if (!user) { alert("Please sign in as an administrator."); return; }
    const token = await user.getIdToken();
    const res = await fetch("/api/mission-control/review/apply", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        items: report.items,
      }),
    });

    const data = await res.json();

alert(
  `${data.message}\n\nModified Files: ${data.modifiedFiles}`
);

loadReport();
  }

  if (!report) {
    return <div>Loading Review Report...</div>;
  }

  return (
    <div className="rounded-xl border p-4 space-y-3">
      <h2 className="text-xl font-bold">Review Report</h2>

      <button
        className="rounded bg-blue-600 px-4 py-2 text-white"
        onClick={applySelected}
      >
        Apply Selected
      </button>

      <div>Total: {report.total}</div>
      <div>Pending: {report.pending}</div>
      <div>Approved: {report.approved}</div>
      <div>Rejected: {report.rejected}</div>

      <div className="space-y-2">
        {report.items?.slice(0, 20).map((item: ReviewItem) => (
          <div
            key={item.id}
            className="border rounded-lg p-3 space-y-2"
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

            <div className="flex gap-2">
              <button
                className="rounded bg-green-600 px-3 py-1 text-white"
                onClick={() => reviewAction("approve", item)}
              >
                Approve
              </button>

              <button
                className="rounded bg-red-600 px-3 py-1 text-white"
                onClick={() => reviewAction("reject", item)}
              >
                Reject
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
