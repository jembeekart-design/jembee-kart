"use client";

import { useEffect, useState } from "react";
import { getControlTowerReport } from "../services/controlTowerService";

export default function ControlTowerDashboard() {
  const [report, setReport] = useState<any>(null);
  const [selectedIssue, setSelectedIssue] = useState<any>(null);

  useEffect(() => {
    async function load() {
      try {
        const data = await getControlTowerReport();
        setReport(data);
      } catch (err) {
        console.error(err);
      }
    }

    load();
  }, []);

  const cards = [
    {
      title: "Architecture",
      value: report?.total ?? "--",
      status: report ? "Connected" : "Waiting",
      category: "ARCHITECTURE",
    },
    {
      title: "Security",
      value: report?.critical ?? "--",
      status: report ? "Connected" : "Waiting",
      category: "SECURITY",
    },
    {
      title: "Theme",
      value: report?.warning ?? "--",
      status: report ? "Connected" : "Waiting",
      category: "THEME",
    },
    
      {
  title: "Business Rules",
  value:
    report?.issues?.filter(
      (i: any) => i.category === "ADMIN_CONTROL"
    ).length ?? "--",
  status: report ? "Connected" : "Waiting",
  category: "ADMIN_CONTROL",
},
    {
      title: "Firestore",
      value: report?.issues?.length ?? "--",
      status: report ? "Connected" : "Waiting",
      category: "FIRESTORE",
    },
    {
      title: "Navigation",
      value: "OK",
      status: report ? "Connected" : "Waiting",
      category: "PAGE_CONNECTION",
    },
  ];

  return (
    <main className="min-h-screen bg-[var(--card-color)] text-[var(--text-color)] p-6 space-y-6">

      <div>
        <h1 className="text-3xl font-bold">
          JembeeKart Control Tower
        </h1>

        <p className="text-[var(--muted-text-color)]">
          Production Readiness Dashboard
        </p>
      </div>

      {/* Summary Cards */}

      <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-4">

        {cards.map((card) => (

          <div
            key={card.title}
            className="rounded-xl border p-4 shadow-sm cursor-pointer hover:bg-[var(--background-color)]"
            onClick={() => {
              if (!report?.issues) return;

              const issue = report.issues.find(
                (i: any) => i.category === card.category
              );

              if (issue) {
                setSelectedIssue(issue);
              }
            }}
          >
            <h2 className="font-semibold">
              {card.title}
            </h2>

            <div className="text-3xl font-bold mt-3">
              {card.value}
            </div>

            <p className="text-sm text-[var(--muted-text-color)] mt-2">
              {card.status}
            </p>

          </div>

        ))}

      </div>

      {/* Scanner Output */}

      <div className="rounded-xl border p-5">

        <h2 className="text-xl font-semibold mb-4">
          Scanner Output
        </h2>

        {!report && <p>No scan executed.</p>}

        {report?.issues?.map((issue: any) => (

          <div
            key={issue.id}
            onClick={() => setSelectedIssue(issue)}
            className="border rounded-lg p-4 mb-4 cursor-pointer hover:bg-gray-50"
          >

            <div className="flex justify-between">

              <div>

                <h3 className="font-bold">
                  {issue.title}
                </h3>

                <p className="text-sm text-[var(--muted-text-color)]">
                  {issue.filePath}
                </p>

              </div>

              <span className="text-xs border rounded px-2 py-1 h-fit">
                {issue.severity}
              </span>

            </div>

            <div className="mt-3 text-sm">

              <p>
                <b>Category:</b> {issue.category}
              </p>

              <p>
                <b>Line:</b>{" "}
                {issue.startLine ?? "-"}
                {issue.endLine
                  ? ` - ${issue.endLine}`
                  : ""}
              </p>

              <p>
                <b>Action:</b>{" "}
                {issue.action ?? "ADD"}
              </p>

            </div>

          </div>

        ))}

      </div>

      {/* Fix Center */}

      <div className="rounded-xl border p-5">

        <h2 className="text-xl font-semibold mb-3">
          Fix Center
        </h2>

        {report ? (
          <p>
            {report.total ?? report.issues?.length ?? 0} Issues Detected
          </p>
        ) : (
          <p>No fixes available.</p>
        )}

      </div>

      {/* Selected Issue */}

      {selectedIssue && (

        <div className="rounded-xl border p-5 bg-gray-50">

          <h2 className="text-2xl font-bold mb-4">
            {selectedIssue.title}
          </h2>

          <div className="space-y-2">

            <p>
              <b>Category:</b>{" "}
              {selectedIssue.category}
            </p>

            <p>
              <b>Severity:</b>{" "}
              {selectedIssue.severity}
            </p>

            <p>
              <b>File:</b>{" "}
              {selectedIssue.filePath}
            </p>

            <p>
              <b>Start Line:</b>{" "}
              {selectedIssue.startLine ?? "-"}
            </p>

            <p>
              <b>End Line:</b>{" "}
              {selectedIssue.endLine ?? "-"}
            </p>

            <p>
              <b>Action:</b>{" "}
              {selectedIssue.action ?? "ADD"}
            </p>

          </div>

          <div className="mt-6">

            <h3 className="font-bold mb-2">
              Description
            </h3>

            <div className="bg-[var(--card-color)] border rounded p-3">
              {selectedIssue.description}
            </div>

          </div>

          <div className="mt-6">

            <h3 className="font-bold mb-2">
              Recommendation
            </h3>

            <pre className="bg-[var(--card-color)] border rounded p-3 text-xs whitespace-pre-wrap overflow-auto">
{selectedIssue.recommendation}
            </pre>

          </div>

        </div>

      )}

    </main>
  );
}
