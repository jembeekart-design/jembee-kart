"use client";

import { useState } from "react";
import {
  Wrench,
  Eye,
  RotateCcw,
  Play,
  Loader2,
} from "lucide-react";

export default function AutoFixCenter() {
  const [loading, setLoading] = useState(false);
  const [statusText, setStatusText] = useState("System Ready");
  const [resultData, setResultData] = useState<any>(null);

  const [astStatus] = useState({
    supported: false,
    message: "AST Auto Fix is not implemented yet.",
  });

  async function handleAction(action: string) {
    try {
      setLoading(true);
      setStatusText(`Processing ${action}...`);
      setResultData(null);

      console.log("Mission Control Action:", action);

      let endpoint = "";

      switch (action) {
        case "scan":
        case "preview":
          endpoint = "/api/mission-control/autofix";
          break;

        case "autofix":
          endpoint = "/api/mission-control/apply-fix";
          break;

        case "rollback":
          endpoint = "/api/mission-control/rollback";
          break;

        default:
          return;
      }

      const response = await fetch(endpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
      });

      const data = await response.json();

      console.log("Mission Control:", data);

      if (!response.ok) {
        throw new Error(data.message || "Request failed");
      }

      setResultData(data);
      setStatusText(`${action.toUpperCase()} completed successfully.`);
      
      if (data.message) {
        alert(data.message);
      }
    } catch (error) {
      console.error(error);
      const errorMessage =
        error instanceof Error ? error.message : "Unknown error";
      setStatusText(`Error: ${errorMessage}`);
      alert(errorMessage);
    } finally {
      setLoading(false);
    }
  }

  return (
    <section className="rounded-xl border bg-white p-6 shadow-sm">
      <div className="flex items-center gap-3">
        <div className="rounded-lg bg-blue-100 p-3">
          <Wrench
            size={22}
            className="text-blue-600"
          />
        </div>

        <div>
          <h2 className="text-xl font-bold">
            Auto Fix Center
          </h2>

          <p className="text-sm text-gray-500">
            Preview, Auto Fix and Rollback your project.
          </p>
        </div>
      </div>

      <div className="mt-6 grid gap-4 md:grid-cols-4">
        <button
          onClick={() => handleAction("scan")}
          disabled={loading}
          className="rounded-lg bg-blue-600 px-4 py-3 text-white hover:bg-blue-700 disabled:opacity-50"
        >
          <div className="flex items-center justify-center gap-2">
            {loading ? (
              <Loader2
                className="animate-spin"
                size={18}
              />
            ) : (
              <Play size={18} />
            )}

            Run Scan
          </div>
        </button>

        <button
          onClick={() => handleAction("preview")}
          disabled={loading}
          className="rounded-lg bg-orange-500 px-4 py-3 text-white hover:bg-orange-600 disabled:opacity-50"
        >
          <div className="flex items-center justify-center gap-2">
            <Eye size={18} />
            Preview
          </div>
        </button>

        <button
          onClick={() => handleAction("autofix")}
          disabled={loading}
          className="rounded-lg bg-green-600 px-4 py-3 text-white hover:bg-green-700 disabled:opacity-50"
        >
          <div className="flex items-center justify-center gap-2">
            <Wrench size={18} />
            Auto Fix
          </div>
        </button>

        <button
          onClick={() => handleAction("rollback")}
          disabled={loading}
          className="rounded-lg bg-red-600 px-4 py-3 text-white hover:bg-red-700 disabled:opacity-50"
        >
          <div className="flex items-center justify-center gap-2">
            <RotateCcw size={18} />
            Rollback
          </div>
        </button>
      </div>

      <div className="mt-6 rounded-lg border bg-gray-50 p-4">
        <p className="font-semibold">
          Status
        </p>

        <p className="mt-2 text-sm text-gray-600">
          {loading
            ? "Mission Control is processing..."
            : statusText}
        </p>

        {resultData && (
          <div className="mt-4 rounded-lg border bg-white p-4">
            <h4 className="font-semibold text-sm text-gray-700 mb-2">
              Execution Result Output:
            </h4>
            <pre className="max-h-60 overflow-auto rounded bg-gray-900 p-3 text-xs text-green-400">
              {JSON.stringify(resultData, null, 2)}
            </pre>
          </div>
        )}

        <div className="mt-4 rounded-lg border bg-white p-4">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold">
              AST Auto Fix
            </h3>

            <span
              className={`rounded-full px-3 py-1 text-xs font-medium ${
                astStatus.supported
                  ? "bg-green-100 text-green-700"
                  : "bg-yellow-100 text-yellow-700"
              }`}
            >
              {astStatus.supported
                ? "Ready"
                : "Coming Soon"}
            </span>
          </div>

          <p className="mt-2 text-sm text-gray-600">
            {astStatus.message}
          </p>

          <div className="mt-3 text-xs text-gray-500">
            Current Status:
            {" "}
            {astStatus.supported
              ? "AST engine is available."
              : "Placeholder implementation. Source code modifications are not enabled yet."}
          </div>
        </div>
      </div>
    </section>
  );
}
