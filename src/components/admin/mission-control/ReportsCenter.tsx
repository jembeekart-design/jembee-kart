"use client";

import { useState } from "react";
import {
  FileText,
  ShieldCheck,
  Database,
  Bug,
  Rocket,
  Download,
} from "lucide-react";

const reports = [
  {
    title: "Governance Report",
    description: "Overall governance compliance report.",
    icon: ShieldCheck,
  },
  {
    title: "Scanner Report",
    description: "Scanner execution summary.",
    icon: Bug,
  },
  {
    title: "Firestore Report",
    description: "Firestore collections and health.",
    icon: Database,
  },
  {
    title: "Deployment Report",
    description: "Build and deployment history.",
    icon: Rocket,
  },
  {
    title: "Code Quality Report",
    description: "Code quality analysis.",
    icon: FileText,
  },
  {
    title: "Export Full Report",
    description: "Download complete system report.",
    icon: Download,
  },
];

export default function ReportsCenter() {
  const [loading, setLoading] = useState(false);
  const [reportResult, setReportResult] = useState<any>(null);

  async function generateReport(type: string) {
    try {
      setLoading(true);

      const response = await fetch("/api/mission-control/run", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ report: type }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Report generation failed");
      }

      setReportResult(data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  }

  return (
    <section className="rounded-xl border bg-white p-6 shadow-sm">
      <div className="mb-6">
        <h2 className="text-2xl font-bold">
          Reports Center
        </h2>

        <p className="text-sm text-gray-500">
          Generate and export project reports.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {reports.map((report) => {
          const Icon = report.icon;

          return (
            <div
              key={report.title}
              className="rounded-xl border p-5 transition hover:shadow-md"
            >
              <Icon className="mb-3 h-8 w-8 text-indigo-600" />

              <h3 className="font-semibold">
                {report.title}
              </h3>

              <p className="mt-2 text-sm text-gray-500">
                {report.description}
              </p>

              <button
                onClick={() => generateReport(report.title)}
                disabled={loading}
                className="mt-5 w-full rounded-lg bg-indigo-600 px-4 py-2 text-white transition hover:bg-indigo-700 disabled:opacity-50"
              >
                {loading ? "Generating..." : "Generate Report"}
              </button>
            </div>
          );
        })}
      </div>

      {reportResult && (
        <div className="mt-6 rounded-lg border bg-gray-50 p-4">
          <h3 className="font-semibold">Latest Report</h3>

          <pre className="mt-3 overflow-auto rounded bg-black p-3 text-xs text-green-400">
            {JSON.stringify(reportResult, null, 2)}
          </pre>
        </div>
      )}
    </section>
  );
}
