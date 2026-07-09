"use client";

import React, {
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  AlertTriangle,
  CheckCircle2,
  RefreshCw,
  Shield,
  ServerCrash,
  Bug,
  Activity,
  FileWarning,
  Database,
  Settings,
  Cpu,
} from "lucide-react";

// ======================================================
// Types
// ======================================================

type Severity =
  | "INFO"
  | "WARNING"
  | "ERROR"
  | "CRITICAL";

interface DebugIssue {
  id: string;
  title: string;
  description: string;
  severity: Severity;
  filePath: string;
  lineNumber?: number;
  recommendation?: string;
}

interface ScannerStatus {
  name: string;
  healthy: boolean;
  totalIssues: number;
}

interface BuildHealth {
  buildReady: boolean;
  deploymentReady: boolean;
  overallScore: number;

  critical: number;
  errors: number;
  warnings: number;
}

interface DashboardState {
  loading: boolean;

  build: BuildHealth;

  scanners: ScannerStatus[];

  issues: DebugIssue[];
}

// ======================================================
// Default State
// ======================================================

const defaultState: DashboardState = {

  loading: true,

  build: {

    buildReady: false,

    deploymentReady: false,

    overallScore: 0,

    critical: 0,

    errors: 0,

    warnings: 0,

  },

  scanners: [],

  issues: [],

};

// ======================================================
// Page
// ======================================================

export default function DebugDashboard() {

  const [state, setState] =
    useState(defaultState);

  const [search, setSearch] =
    useState("");

  const [refreshing, setRefreshing] =
    useState(false);

  // ====================================================
  // Derived
  // ====================================================

  const filteredIssues =
    useMemo(() => {

      if (!search.trim()) {

        return state.issues;

      }

      return state.issues.filter(
        (issue) =>

          issue.title
            .toLowerCase()
            .includes(
              search.toLowerCase()
            ) ||

          issue.filePath
            .toLowerCase()
            .includes(
              search.toLowerCase()
            )

      );

    }, [
      search,
      state.issues,
    ]);

  // ====================================================
  // Load Dashboard
  // ====================================================

  async function loadDashboard() {

    try {

      setRefreshing(true);

      const response =
        await fetch(
          "/api/governance/debug"
        );

      const data =
        await response.json();

      setState(data);

    } catch (error) {

      console.error(error);

    } finally {

      setRefreshing(false);

    }

  }

  useEffect(() => {

    loadDashboard();

  }, []);

  // ====================================================
  // UI
  // ====================================================

  return (

    <div className="min-h-screen bg-[var(--background-color)]">

      <div className="mx-auto max-w-7xl p-6">

        <div className="mb-8 flex items-center justify-between">

          <div>

            <h1 className="text-3xl font-bold">

              JembeeKart Governance Debug

            </h1>

            <p className="text-[var(--muted-text-color)]">

              Production Debug Dashboard

            </p>

          </div>

          <button

            onClick={loadDashboard}

            disabled={refreshing}

            className="rounded-lg bg-[var(--card-color)] px-4 py-2 text-[var(--button-text-color)]"

          >

            <RefreshCw
              className={`h-5 w-5 ${
                refreshing
                  ? "animate-spin"
                  : ""
              }`}
            />

          </button>

        </div>

        {/* Build Summary */}

        <div className="grid grid-cols-4 gap-4">

          <div className="rounded-xl bg-[var(--card-color)] p-5 shadow">

            <Activity />

            <h3 className="mt-3 font-bold">

              Overall Score

            </h3>

            <p className="text-3xl font-bold">

              {
                state.build
                  .overallScore
              }

              %

            </p>

          </div>

          <div className="rounded-xl bg-[var(--card-color)] p-5 shadow">

            <ServerCrash />

            <h3 className="mt-3 font-bold">

              Critical

            </h3>

            <p className="text-3xl text-[var(--danger-color)] font-bold">

              {
                state.build
                  .critical
              }

            </p>

          </div>

          <div className="rounded-xl bg-[var(--card-color)] p-5 shadow">

            <AlertTriangle />

            <h3 className="mt-3 font-bold">

              Errors

            </h3>

            <p className="text-3xl text-orange-600 font-bold">

              {
                state.build
                  .errors
              }

            </p>

          </div>

          <div className="rounded-xl bg-[var(--card-color)] p-5 shadow">

            <CheckCircle2 />

            <h3 className="mt-3 font-bold">

              Deployment

            </h3>

            <p className="font-bold">

              {

                state.build
                  .deploymentReady

                  ? "READY"

                  : "BLOCKED"

              }

            </p>

          </div>

        </div>

        {/* ====================================================== */}
{/* Scanner Health */}
{/* ====================================================== */}

<div className="mt-8">

  <div className="mb-4 flex items-center gap-2">

    <Shield className="h-6 w-6" />

    <h2 className="text-2xl font-bold">

      Scanner Health

    </h2>

  </div>

  <div className="grid grid-cols-2 gap-4 md:grid-cols-3 xl:grid-cols-4">

    {state.scanners.map((scanner) => (

      <div
        key={scanner.name}
        className="rounded-xl bg-[var(--card-color)] p-5 shadow"
      >

        <div className="flex items-center justify-between">

          <div>

            <h3 className="font-bold">

              {scanner.name}

            </h3>

            <p className="text-sm text-[var(--muted-text-color)]">

              Issues

            </p>

          </div>

          {scanner.healthy ? (

            <CheckCircle2
              className="text-[var(--success-color)]"
            />

          ) : (

            <Bug
              className="text-[var(--danger-color)]"
            />

          )}

        </div>

        <p className="mt-5 text-3xl font-bold">

          {scanner.totalIssues}

        </p>

      </div>

    ))}

  </div>

</div>

{/* ====================================================== */}
{/* Search */}
{/* ====================================================== */}

<div className="mt-8 rounded-xl bg-[var(--card-color)] p-5 shadow">

  <div className="flex items-center gap-3">

    <FileWarning />

    <input

      value={search}

      onChange={(e) =>
        setSearch(
          e.target.value
        )
      }

      placeholder="Search file..."

      className="w-full rounded-lg border p-3"

    />

  </div>

</div>

{/* ====================================================== */}
{/* Fix Next Error */}
{/* ====================================================== */}

<div className="mt-8 rounded-xl border-l-4 border-red-600 bg-[var(--card-color)] p-6 shadow">

  <div className="flex items-center gap-3">

    <AlertTriangle className="text-[var(--danger-color)]" />

    <h2 className="text-xl font-bold">

      Fix Next Error

    </h2>

  </div>

  {filteredIssues.length === 0 ? (

    <p className="mt-4 text-[var(--success-color)]">

      No blocking issue found.

    </p>

  ) : (

    <div className="mt-4 space-y-3">

      <p>

        <b>File:</b>

        {" "}

        {filteredIssues[0].filePath}

      </p>

      <p>

        <b>Title:</b>

        {" "}

        {filteredIssues[0].title}

      </p>

      <p>

        <b>Severity:</b>

        {" "}

        {filteredIssues[0].severity}

      </p>

      <p>

        <b>Recommendation:</b>

        {" "}

        {filteredIssues[0].recommendation ??

          "No recommendation"}

      </p>

    </div>

  )}

</div>

{/* ====================================================== */}
{/* ====================================================== */}
{/* Error Table */}
{/* ====================================================== */}

<div className="mt-8 rounded-xl bg-[var(--card-color)] shadow">

  <div className="border-b p-5">

    <h2 className="text-2xl font-bold">

      Build Errors

    </h2>

    <p className="text-[var(--muted-text-color)]">

      TypeScript • Next.js • Governance • Scanner Errors

    </p>

  </div>

  <div className="overflow-x-auto">

    <table className="min-w-full">

      <thead className="bg-[var(--background-color)]">

        <tr>

          <th className="px-4 py-3 text-left">

            Severity

          </th>

          <th className="px-4 py-3 text-left">

            File

          </th>

          <th className="px-4 py-3 text-left">

            Line

          </th>

          <th className="px-4 py-3 text-left">

            Error

          </th>

          <th className="px-4 py-3 text-left">

            Recommendation

          </th>

          <th className="px-4 py-3 text-center">

            Action

          </th>

        </tr>

      </thead>

      <tbody>

        {filteredIssues.length === 0 ? (

          <tr>

            <td
              colSpan={6}
              className="p-10 text-center text-[var(--success-color)] font-semibold"
            >

              🎉 No Errors Found

            </td>

          </tr>

        ) : (

          filteredIssues.map((issue) => (

            <tr
              key={issue.id}
              className="border-b hover:bg-[var(--background-color)]"
            >

              <td className="px-4 py-4">

                <span
                  className={`rounded-full px-3 py-1 text-xs font-bold

                  ${
                    issue.severity === "CRITICAL"

                      ? "bg-red-100 text-red-700"

                      : issue.severity === "ERROR"

                      ? "bg-orange-100 text-orange-700"

                      : issue.severity === "WARNING"

                      ? "bg-yellow-100 text-yellow-700"

                      : "bg-green-100 text-green-700"

                  }

                  `}
                >

                  {issue.severity}

                </span>

              </td>

              <td className="px-4 py-4 font-mono text-sm">

                {issue.filePath}

              </td>

              <td className="px-4 py-4">

                {issue.lineNumber ?? "-"}

              </td>

              <td className="px-4 py-4">

                {issue.title}

              </td>

              <td className="px-4 py-4">

                {issue.recommendation ??

                  "No Recommendation"}

              </td>

              <td className="px-4 py-4">

                <div className="flex gap-2">

                  <button

                    onClick={() =>
                      navigator.clipboard.writeText(
                        JSON.stringify(
                          issue,
                          null,
                          2
                        )
                      )
                    }

                    className="rounded-lg bg-[var(--card-color)] px-3 py-2 text-sm text-[var(--button-text-color)]"

                  >

                    Copy

                  </button>

                </div>

              </td>

            </tr>

          ))

        )}

      </tbody>

    </table>

  </div>

</div>

{/* ====================================================== */}
{/* Quick Statistics */}
{/* ====================================================== */}

<div className="mt-8 grid grid-cols-2 gap-4 lg:grid-cols-4">

  <div className="rounded-xl bg-[var(--card-color)] p-5 shadow">

    <Database />

    <h3 className="mt-3 font-bold">

      Files

    </h3>

    <p className="text-3xl font-bold">

      {filteredIssues.length}

    </p>

  </div>

  <div className="rounded-xl bg-[var(--card-color)] p-5 shadow">

    <Bug />

    <h3 className="mt-3 font-bold">

      Critical

    </h3>

    <p className="text-3xl font-bold text-[var(--danger-color)]">

      {

        filteredIssues.filter(

          (x) =>

            x.severity ===

            "CRITICAL"

        ).length

      }

    </p>

  </div>

  <div className="rounded-xl bg-[var(--card-color)] p-5 shadow">

    <AlertTriangle />

    <h3 className="mt-3 font-bold">

      Errors

    </h3>

    <p className="text-3xl font-bold text-orange-600">

      {

        filteredIssues.filter(

          (x) =>

            x.severity ===

            "ERROR"

        ).length

      }

    </p>

  </div>

  <div className="rounded-xl bg-[var(--card-color)] p-5 shadow">

    <Settings />

    <h3 className="mt-3 font-bold">

      Warnings

    </h3>

    <p className="text-3xl font-bold text-[var(--warning-color)]">

      {

        filteredIssues.filter(

          (x) =>

            x.severity ===

            "WARNING"

        ).length

      }

    </p>

  </div>

</div>

{/* ====================================================== */}
{/* ====================================================== */}
{/* Build & Deployment */}
{/* ====================================================== */}

<div className="mt-8 grid grid-cols-1 gap-6 xl:grid-cols-2">

  {/* Build Health */}

  <div className="rounded-xl bg-[var(--card-color)] p-6 shadow">

    <div className="mb-6 flex items-center gap-3">

      <Cpu className="h-6 w-6" />

      <h2 className="text-2xl font-bold">

        Build Health

      </h2>

    </div>

    <div className="space-y-4">

      <div className="flex justify-between">

        <span>

          Build Status

        </span>

        <span
          className={`font-bold ${
            state.build.buildReady
              ? "text-[var(--success-color)]"
              : "text-[var(--danger-color)]"
          }`}
        >

          {state.build.buildReady

            ? "PASS"

            : "FAILED"}

        </span>

      </div>

      <div className="flex justify-between">

        <span>

          Deployment

        </span>

        <span
          className={`font-bold ${
            state.build.deploymentReady
              ? "text-[var(--success-color)]"
              : "text-[var(--danger-color)]"
          }`}
        >

          {state.build.deploymentReady

            ? "READY"

            : "BLOCKED"}

        </span>

      </div>

      <div className="flex justify-between">

        <span>

          Governance Score

        </span>

        <span className="font-bold">

          {state.build.overallScore}%

        </span>

      </div>

    </div>

  </div>

  {/* Build Timeline */}

  <div className="rounded-xl bg-[var(--card-color)] p-6 shadow">

    <div className="mb-6 flex items-center gap-3">

      <Activity className="h-6 w-6" />

      <h2 className="text-2xl font-bold">

        Build Timeline

      </h2>

    </div>

    <div className="space-y-4">

      <div className="flex items-center gap-3">

        <CheckCircle2 className="text-[var(--success-color)]" />

        <span>

          Governance Scan Started

        </span>

      </div>

      <div className="flex items-center gap-3">

        <CheckCircle2 className="text-[var(--success-color)]" />

        <span>

          Scanner Validation

        </span>

      </div>

      <div className="flex items-center gap-3">

        <AlertTriangle className="text-orange-600" />

        <span>

          TypeScript Compilation

        </span>

      </div>

      <div className="flex items-center gap-3">

        <ServerCrash className="text-[var(--danger-color)]" />

        <span>

          Next.js Build

        </span>

      </div>

      <div className="flex items-center gap-3">

        <RefreshCw
          className={`${
            refreshing
              ? "animate-spin"
              : ""
          }`}
        />

        <span>

          Waiting For Deployment

        </span>

      </div>

    </div>

  </div>

</div>

{/* ====================================================== */}
{/* Live Console */}
{/* ====================================================== */}

<div className="mt-8 rounded-xl bg-[var(--card-color)] p-6 text-green-400 shadow">

  <div className="mb-4 flex items-center gap-3">

    <ServerCrash />

    <h2 className="font-bold">

      Live Debug Console

    </h2>

  </div>

  <div className="max-h-80 overflow-auto rounded bg-zinc-900 p-4 font-mono text-sm">

    {filteredIssues.length === 0 ? (

      <p>

        ✔ No build error detected

      </p>

    ) : (

      filteredIssues.map((issue) => (

        <div
          key={issue.id}
          className="mb-4"
        >

          <p>

            [{issue.severity}]

            {" "}

            {issue.title}

          </p>

          <p>

            File:

            {" "}

            {issue.filePath}

          </p>

          <p>

            Line:

            {" "}

            {issue.lineNumber ?? "-"}

          </p>

          <br />

        </div>

      ))

    )}

  </div>

</div>

{/* ====================================================== */}
{/* Action Buttons */}
{/* ====================================================== */}

<div className="mt-8 flex flex-wrap gap-4">

  <button
    onClick={loadDashboard}
    className="rounded-lg bg-[var(--card-color)] px-5 py-3 text-[var(--button-text-color)]"
  >

    Refresh Dashboard

  </button>

  <button
    className="rounded-lg bg-green-600 px-5 py-3 text-[var(--button-text-color)]"
  >

    Run Governance Scan

  </button>

  <button
    className="rounded-lg bg-orange-600 px-5 py-3 text-[var(--button-text-color)]"
  >

    Rebuild Project

  </button>

  <button
    className="rounded-lg bg-[var(--primary-color)] px-5 py-3 text-[var(--button-text-color)]"
  >

    Export Report

  </button>

</div>

      </div>

    </div>

  );

}
