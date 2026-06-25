"use client";

import { useEffect, useState } from "react";

import {
  GovernanceDashboardReport,
  GovernanceViolation,
} from "@/jembee-governance/types/governance.types";

const Card = ({
  title,
  value,
}: {
  title: string;
  value: React.ReactNode;
}) => (
  <div className="rounded-xl border border-slate-800 bg-slate-900/50 p-4">
    <p className="text-[10px] uppercase text-slate-500">
      {title}
    </p>

    <p className="mt-2 text-2xl font-bold">
      {value}
    </p>
  </div>
);

const Badge = ({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) => (
  <span
    className={`rounded px-2 py-1 text-xs font-semibold border ${className}`}
  >
    {children}
  </span>
);

export default function GovernancePage() {

  const [loading, setLoading] =
    useState(true);

  const [report, setReport] =
    useState<GovernanceDashboardReport | null>(
      null
    );

  const [search, setSearch] =
    useState("");

  const loadDashboard =
    async () => {

      try {

        setLoading(true);

        const response =
          await fetch(
            "/api/governance"
          );

        const json =
          await response.json();

        if (json.report) {
          setReport(json.report);
        }

      } catch (error) {

        console.error(error);

      } finally {

        setLoading(false);

      }

    };

  useEffect(() => {

    loadDashboard();

    const timer =
      setInterval(
        loadDashboard,
        30000
      );

    return () =>
      clearInterval(timer);

  }, []);

  if (loading) {

    return (

      <div className="flex min-h-screen items-center justify-center bg-[#020617] text-white">

        Loading Governance Dashboard...

      </div>

    );

  }

  if (!report) {

    return (

      <div className="flex min-h-screen items-center justify-center bg-[#020617] text-red-400">

        Governance Report Not Found

      </div>

    );

  }

  const summary =
    report.summary;

  const statistics =
    report.statistics;

  const scores =
    report.scores;

  const deploymentReady =
    summary.deploymentReady;

  const criticalViolations =
    report.violations.filter(
      (
        violation:
          GovernanceViolation
      ) =>
        violation.severity ===
        "CRITICAL"
    );

  const filteredViolations =
    report.violations.filter(
      (
        violation:
          GovernanceViolation
      ) => {

        if (!search) {
          return true;
        }

        const keyword =
          search.toLowerCase();

        return (

          violation.title
            .toLowerCase()
            .includes(keyword) ||

          violation.category
            .toLowerCase()
            .includes(keyword)

        );

      }
    );

  return (

    <div className="min-h-screen bg-[#020617] text-white p-6 space-y-6">

      <div className="flex items-center justify-between">

        <div>

          <h1 className="text-3xl font-bold">

            Governance Dashboard

          </h1>

          <p className="text-slate-400">

            JembeeKart Governance Engine

          </p>

        </div>

        <button
          onClick={loadDashboard}
          className="rounded-lg bg-indigo-600 px-4 py-2 text-sm"
        >
          Refresh
        </button>

      </div>
            {/* =======================================================
          OVERVIEW CARDS
      ======================================================= */}

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">

        <Card
          title="Deployment"
          value={
            <Badge
              className={
                deploymentReady
                  ? "border-emerald-700 text-emerald-400"
                  : "border-red-700 text-red-400"
              }
            >
              {deploymentReady
                ? "READY"
                : "BLOCKED"}
            </Badge>
          }
        />

        <Card
          title="Overall Score"
          value={`${scores.overall}%`}
        />

        <Card
          title="Total Violations"
          value={
            statistics.totalViolations
          }
        />

        <Card
          title="Critical"
          value={
            <span className="text-red-400">
              {statistics.critical}
            </span>
          }
        />

      </div>

      {/* =======================================================
          SCORE CARDS
      ======================================================= */}

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">

        <Card
          title="Architecture"
          value={`${scores.architecture}%`}
        />

        <Card
          title="Security"
          value={`${scores.security}%`}
        />

        <Card
          title="Profitability"
          value={`${scores.profitability}%`}
        />

        <Card
          title="Deployment"
          value={`${scores.deployment}%`}
        />

      </div>

      {/* =======================================================
          SEARCH
      ======================================================= */}

      <div className="rounded-xl border border-slate-800 bg-slate-900/50 p-4">

        <input
          type="text"
          value={search}
          onChange={(e) =>
            setSearch(e.target.value)
          }
          placeholder="Search violations..."
          className="w-full rounded-lg border border-slate-700 bg-slate-950 p-3 text-sm outline-none"
        />

      </div>
            {/* =======================================================
          HEALTH
      ======================================================= */}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

        <div className="rounded-xl border border-slate-800 bg-slate-900/50 p-5">

          <h2 className="font-semibold mb-4">
            Governance Health
          </h2>

          <div className="space-y-2 text-sm">

            <div className="flex justify-between">
              <span>System Health</span>

              <Badge
                className={
                  report.health.healthy
                    ? "border-emerald-700 text-emerald-400"
                    : "border-red-700 text-red-400"
                }
              >
                {report.health.healthy
                  ? "HEALTHY"
                  : "UNHEALTHY"}
              </Badge>
            </div>

            <div className="flex justify-between">
              <span>Configuration</span>

              <Badge
                className={
                  report.health.configurationLoaded
                    ? "border-emerald-700 text-emerald-400"
                    : "border-red-700 text-red-400"
                }
              >
                {report.health.configurationLoaded
                  ? "LOADED"
                  : "FAILED"}
              </Badge>
            </div>

            <div className="flex justify-between">
              <span>Business Rules</span>

              <Badge
                className={
                  report.health.businessRulesHealthy
                    ? "border-emerald-700 text-emerald-400"
                    : "border-red-700 text-red-400"
                }
              >
                {report.health.businessRulesHealthy
                  ? "OK"
                  : "FAILED"}
              </Badge>
            </div>

          </div>

        </div>

        <div className="rounded-xl border border-slate-800 bg-slate-900/50 p-5">

          <h2 className="font-semibold mb-4">
            Scanner Summary
          </h2>

          <div className="space-y-2 text-sm">

            <div className="flex justify-between">
              <span>Files Scanned</span>
              <span>{summary.filesScanned}</span>
            </div>

            <div className="flex justify-between">
              <span>Warnings</span>
              <span>{statistics.warnings}</span>
            </div>

            <div className="flex justify-between">
              <span>Errors</span>
              <span>{statistics.errors}</span>
            </div>

            <div className="flex justify-between">
              <span>Critical</span>
              <span className="text-red-400">
                {statistics.critical}
              </span>
            </div>

          </div>

        </div>

      </div>

      {/* =======================================================
          CRITICAL VIOLATIONS
      ======================================================= */}

      <div className="rounded-xl border border-slate-800 bg-slate-900/50 p-5">

        <h2 className="font-semibold mb-4">
          Critical Violations
        </h2>

        <div className="space-y-3">

          {criticalViolations.length === 0 && (
            <p className="text-sm text-slate-400">
              No critical violations found.
            </p>
          )}

          {criticalViolations.map((item) => (

            <div
              key={item.id}
              className="rounded-lg border border-red-900 bg-red-950/20 p-3"
            >

              <div className="flex justify-between">

                <div>

                  <h3 className="font-semibold">
                    {item.title}
                  </h3>

                  <p className="text-xs text-slate-400">
                    {item.category}
                  </p>

                </div>

                <Badge className="border-red-700 text-red-400">
                  {item.severity}
                </Badge>

              </div>

            </div>

          ))}

        </div>

      </div>
            {/* =======================================================
          ALL VIOLATIONS
      ======================================================= */}

      <div className="rounded-xl border border-slate-800 bg-slate-900/50 p-5">

        <h2 className="mb-4 text-lg font-semibold">
          All Violations
        </h2>

        <div className="overflow-x-auto">

          <table className="min-w-full text-sm">

            <thead>

              <tr className="border-b border-slate-800 text-left">

                <th className="p-3">
                  Title
                </th>

                <th className="p-3">
                  Category
                </th>

                <th className="p-3">
                  Severity
                </th>

                <th className="p-3">
                  Recommendation
                </th>

              </tr>

            </thead>

            <tbody>

              {filteredViolations.length === 0 && (

                <tr>

                  <td
                    colSpan={4}
                    className="p-6 text-center text-slate-400"
                  >

                    No violations found.

                  </td>

                </tr>

              )}

              {filteredViolations.map((item) => (

                <tr
                  key={item.id}
                  className="border-b border-slate-900"
                >

                  <td className="p-3">

                    <div className="font-medium">
                      {item.title}
                    </div>

                    {item.filePath && (

                      <div className="mt-1 text-xs text-slate-500">
                        {item.filePath}
                      </div>

                    )}

                  </td>

                  <td className="p-3">
                    {item.category}
                  </td>

                  <td className="p-3">

                    <Badge
                      className={
                        item.severity === "CRITICAL"
                          ? "border-red-700 text-red-400"
                          : item.severity === "ERROR"
                          ? "border-orange-700 text-orange-400"
                          : item.severity === "WARNING"
                          ? "border-yellow-700 text-yellow-400"
                          : "border-emerald-700 text-emerald-400"
                      }
                    >
                      {item.severity}
                    </Badge>

                  </td>

                  <td className="p-3 text-slate-300">

                    {item.recommendation ??
                      "-"}

                  </td>

                </tr>

              ))}

            </tbody>

          </table>

        </div>

      </div>

      {/* =======================================================
          FOOTER
      ======================================================= */}

      <div className="rounded-xl border border-slate-800 bg-slate-900/50 p-4 text-xs text-slate-400">

        <div className="flex flex-col gap-2 md:flex-row md:justify-between">

          <span>

            Generated At :
            {" "}
            {report.generatedAt}

          </span>

          <span>

            Files Scanned :
            {" "}
            {summary.filesScanned}

          </span>

          <span>

            Overall Score :
            {" "}
            {scores.overall}%

          </span>

        </div>

      </div>

    </div>

  );

}
