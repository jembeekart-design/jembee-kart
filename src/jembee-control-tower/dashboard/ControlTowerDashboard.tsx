"use client";

import { useEffect, useState } from "react";
import { getControlTowerReport } from "../services/controlTowerService";

export default function ControlTowerDashboard() {
  const [report, setReport] = useState<any>(null);
  const [selectedIssue, setSelectedIssue] = useState<any>(null);

  useEffect(() => {
    async function load() {
      const data = await getControlTowerReport();
      setReport(data);
    }

    load();
  }, []);

  const cards = [
    {
      title: "Architecture",
      value: report ? report.total : "--",
      status: report ? "Connected" : "Waiting",
    },
    {
      title: "Security",
      value: report ? report.critical : "--",
      status: report ? "Connected" : "Waiting",
    },
    {
      title: "Theme",
      value: report ? report.warning : "--",
      status: report ? "Connected" : "Waiting",
    },
    {
      title: "Business Rules",
      value: report ? report.info : "--",
      status: report ? "Connected" : "Waiting",
    },
    {
      title: "Firestore",
      value: report ? report.issues?.length ?? "--",
      status: report ? "Connected" : "Waiting",
    },
    {
      title: "Navigation",
      value: report ? "OK" : "--",
      status: report ? "Connected" : "Waiting",
    },
  ];

  return (
    <main className="min-h-screen bg-white text-black p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold">
          JembeeKart Control Tower
        </h1>

        <p className="text-gray-500 mt-1">
          Production Readiness Dashboard
        </p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-4">
        {cards.map((card) => (
          <div
            key={card.title}
            onClick={() => {
              if (report?.issues) {
                const issue = report.issues.find(
                  (i: any) =>
                    i.category?.toLowerCase().replace(/_/g, " ") ===
                    card.title.toLowerCase()
                );

                if (issue) {
                  setSelectedIssue(issue);
                }
              }
            }}
            className="rounded-xl border p-4 shadow-sm cursor-pointer hover:bg-gray-100"
          >
            <h2 className="font-semibold">{card.title}</h2>

            <div className="text-3xl font-bold mt-3">
              {card.value}
            </div>

            <p className="text-sm text-gray-500 mt-2">
              {card.status}
            </p>
          </div>
        ))}
      </div>

      <div className="rounded-xl border p-5">
        <h2 className="text-xl font-semibold mb-3">
          Scanner Output
        </h2>

        {report ? (
          <pre className="text-xs overflow-auto">
            {JSON.stringify(report.issues, null, 2)}
          </pre>
        ) : (
          <p>No scan executed.</p>
        )}
      </div>

      <div className="rounded-xl border p-5">
        <h2 className="text-xl font-semibold mb-3">
          Fix Center
        </h2>

        {report ? (
          <p>{report.total} issues detected.</p>
        ) : (
          <p>No fixes available.</p>
        )}
      </div>

      {selectedIssue && (
        <div className="rounded-xl border p-5 bg-gray-50">
          <h2 className="text-xl font-bold mb-4">
            {selectedIssue.title}
          </h2>

          <p>
            <b>File:</b> {selectedIssue.filePath}
          </p>

          <p>
            <b>Line:</b>{" "}
            {selectedIssue.startLine || "Unknown"}
            {selectedIssue.endLine &&
              ` - ${selectedIssue.endLine}`}
          </p>

          <p>
            <b>Action:</b>{" "}
            {selectedIssue.action || "Replace"}
          </p>

          <p className="mt-3 font-semibold">
            Recommendation
          </p>

          <pre className="bg-white border rounded p-3 overflow-auto text-xs">
            {selectedIssue.recommendation}
          </pre>
        </div>
      )}
    </main>
  );
}
