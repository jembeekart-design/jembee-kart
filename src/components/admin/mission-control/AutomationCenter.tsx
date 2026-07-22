"use client";

import { useState } from "react";

import {
  PlayCircle,
  Wrench,
  FileText,
  RotateCcw,
  Save,
  Clock3,
} from "lucide-react";

const actions = [
  {
    title: "Run All Scanners",
    description: "Execute every governance scanner.",
    icon: PlayCircle,
    button: "Run",
  },
  {
    title: "Run Auto Fix",
    description: "Automatically fix supported issues.",
    icon: Wrench,
    button: "Auto Fix",
  },
  {
    title: "Generate Report",
    description: "Generate governance report.",
    icon: FileText,
    button: "Generate",
  },
  {
    title: "Create Backup",
    description: "Backup project before fixes.",
    icon: Save,
    button: "Backup",
  },
  {
    title: "Rollback",
    description: "Restore previous backup.",
    icon: RotateCcw,
    button: "Rollback",
  },
  {
    title: "Schedule Scan",
    description: "Configure automatic scans.",
    icon: Clock3,
    button: "Schedule",
  },
];

export default function AutomationCenter() {

  const [scanResult, setScanResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const runScanners = async () => {
    try {

      setLoading(true);

      const res = await fetch("/api/mission-control/run", {
        method: "POST",
      });

      const data = await res.json();

      setScanResult(data);

      alert("Scanners completed successfully!");

    } catch (err) {

      console.error(err);

      alert("Failed to run scanners.");

    } finally {

      setLoading(false);

    }
  };
  const runAutoFix = async () => {
  try {
    const res = await fetch("/api/mission-control/autofix", {
      method: "POST",
    });

    const data = await res.json();

console.log(data);

if (!data.success) {
  alert(data.message);
  return;
}

alert(`✅ Auto Fix Completed

Files To Modify: ${data.theme.filesToModify}
Preview Files: ${data.theme.preview.length}
Hardcoded Rules Found: ${data.rules.issueCount}
Duration: ${data.duration} ms`);
  } catch (err) {
    console.error(err);
    alert("Auto Fix failed.");
  }
};

  return (
    <section className="rounded-xl border bg-white p-6 shadow-sm">

      <div className="mb-6">
        <h2 className="text-2xl font-bold">
          Automation Center
        </h2>

        <p className="text-sm text-gray-500">
          Run scanners, auto fix, backup and governance automation.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {actions.map((action) => {

          const Icon = action.icon;

          return (
            <div
              key={action.title}
              className="rounded-xl border p-5"
            >

              <Icon className="mb-3 h-8 w-8 text-blue-600" />

              <h3 className="font-semibold">
                {action.title}
              </h3>

              <p className="mt-2 text-sm text-gray-500">
                {action.description}
              </p>

              <button
                onClick={() => {
                  if (action.title === "Run All Scanners") {
  runScanners();
} else if (action.title === "Run Auto Fix") {
  runAutoFix();
}
                }}
                disabled={
                  loading &&
                  action.title === "Run All Scanners"
                }
                className="mt-5 w-full rounded-lg bg-blue-600 px-4 py-2 text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {loading &&
                action.title === "Run All Scanners"
                  ? "Running..."
                  : action.button}
              </button>

            </div>
          );

        })}
      </div>

      {scanResult && (

        <div className="mt-6 rounded-xl border bg-gray-50 p-4">

          <h3 className="mb-3 text-lg font-bold">
            Latest Scan Result
          </h3>

          <div className="grid gap-3 md:grid-cols-2">

            <div className="rounded-lg border bg-white p-3">
              <p className="text-sm text-gray-500">
                Scan Duration
              </p>

              <p className="text-lg font-semibold">
                {scanResult.duration} ms
              </p>
            </div>

            <div className="rounded-lg border bg-white p-3">
              <p className="text-sm text-gray-500">
                Firestore Files
              </p>

              <p className="text-lg font-semibold">
                {scanResult.firestore?.scannedFiles ?? 0}
              </p>
            </div>

            <div className="rounded-lg border bg-white p-3">
              <p className="text-sm text-gray-500">
                Duplicate Files
              </p>

              <p className="text-lg font-semibold">
                {scanResult.duplicate?.scannedFiles ?? 0}
              </p>
            </div>

            <div className="rounded-lg border bg-white p-3">
              <p className="text-sm text-gray-500">
                Hardcoded Rules
              </p>

              <p className="text-lg font-semibold">
                {scanResult.rules?.issues ?? 0}
              </p>
            </div>

          </div>

        </div>

      )}

    </section>
  );
}
