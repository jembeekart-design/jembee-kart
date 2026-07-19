"use client";

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

              <button className="mt-5 w-full rounded-lg bg-indigo-600 px-4 py-2 text-white transition hover:bg-indigo-700">
                Generate Report
              </button>
            </div>
          );
        })}
      </div>
    </section>
  );
}
