"use client";

import { useCallback, useEffect, useState } from "react";

import {
  GovernanceDashboardReport,
  GovernanceViolation,
} from "../types/governance.types";

import {
  governanceStatusService,
} from "../services/governanceStatusService";

import {
  governanceIssueService,
} from "../services/governanceIssueService";

import {
  governanceReportService,
} from "../services/governanceReportService";

interface GovernanceStats {

  totalIssues: number;

  criticalIssues: number;

  warningIssues: number;

  passedModules: number;

  failedModules: number;

  governanceScore: number;

}

interface LatestReport {

  id: string;

  title: string;

  createdAt: string;

  status?: string;

}

export default function GovernanceDashboard() {

  const [loading, setLoading] =
    useState(true);

  const [stats, setStats] =
    useState<GovernanceStats | null>(null);

  const [issues, setIssues] =
    useState<GovernanceViolation[]>([]);

  const [reports, setReports] =
    useState<LatestReport[]>([]);

  const [dashboardReport, setDashboardReport] =
    useState<GovernanceDashboardReport | null>(null);

  // =====================================================
  // PART 2 STARTS HERE
  // =====================================================

  const loadDashboard = useCallback(
    async () => {

      try {

        setLoading(true);

        const [
          dashboardStats,
          governanceIssues,
          latestReports,
          report,
        ] = await Promise.all([

          governanceStatusService.getDashboardStats(),

          governanceIssueService.getAllIssues(),

          governanceReportService.getLatestReports(),

          governanceReportService.generate(
            process.cwd()
          ),

        ]);

        setStats(
          dashboardStats
        );

        setIssues(
          governanceIssues
        );

        setReports(
          latestReports
        );

        setDashboardReport(
          report
        );

      } catch (error) {

        console.error(
          "[GovernanceDashboard]",
          error
        );

      } finally {

        setLoading(false);

      }

    },
    []
  );

  useEffect(() => {

    loadDashboard();

  }, [loadDashboard]);

  // =====================================================
  // PART 3 STARTS HERE
  // =====================================================
  // =====================================================
  // Loading
  // =====================================================

  if (loading) {

    return (

      <div className="flex items-center justify-center min-h-screen">

        <div className="text-lg font-semibold">

          Loading Governance Dashboard...

        </div>

      </div>

    );

  }

  // =====================================================
  // Dashboard
  // =====================================================

  return (

    <div className="p-6 space-y-6">

      {/* ================================================= */}
      {/* HEADER */}
      {/* ================================================= */}

      <div className="flex items-center justify-between">

        <div>

          <h1 className="text-3xl font-bold">

            JembeeKart Governance Dashboard

          </h1>

          <p className="text-gray-500">

            Enterprise Governance Monitoring

          </p>

        </div>

        <div className="text-right">

          <div className="text-sm text-gray-500">

            Generated

          </div>

          <div className="font-medium">

            {dashboardReport?.generatedAt ?? "-"}

          </div>

        </div>

      </div>

      {/* ================================================= */}
      {/* SUMMARY CARDS */}
      {/* ================================================= */}

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">

        <div className="rounded-lg border p-4">

          <p className="text-sm text-gray-500">

            Governance Score

          </p>

          <h2 className="text-3xl font-bold">

            {stats?.governanceScore ?? 0}%

          </h2>

        </div>

        <div className="rounded-lg border p-4">

          <p className="text-sm text-gray-500">

            Total Issues

          </p>

          <h2 className="text-3xl font-bold">

            {stats?.totalIssues ?? 0}

          </h2>

        </div>

        <div className="rounded-lg border p-4">

          <p className="text-sm text-gray-500">

            Critical Issues

          </p>

          <h2 className="text-3xl font-bold text-red-600">

            {stats?.criticalIssues ?? 0}

          </h2>

        </div>

        <div className="rounded-lg border p-4">

          <p className="text-sm text-gray-500">

            Warnings

          </p>

          <h2 className="text-3xl font-bold text-yellow-600">

            {stats?.warningIssues ?? 0}

          </h2>

        </div>

      </div>

      {/* ================================================= */}
      {/* PART 4 STARTS HERE */}
      {/* ================================================= */}
            {/* ================================================= */}
      {/* LATEST REPORTS */}
      {/* ================================================= */}

      <div className="rounded-lg border p-6">

        <h2 className="text-xl font-semibold mb-4">

          Latest Governance Reports

        </h2>

        <div className="space-y-3">

          {reports.length === 0 && (

            <p className="text-gray-500">

              No governance reports available.

            </p>

          )}

          {reports.map((report) => (

            <div
              key={report.id}
              className="rounded-lg border p-4"
            >

              <div className="flex items-center justify-between">

                <div>

                  <h3 className="font-semibold">

                    {report.title}

                  </h3>

                  <p className="text-sm text-gray-500">

                    {report.createdAt}

                  </p>

                </div>

                <span className="rounded bg-green-100 px-3 py-1 text-xs font-medium">

                  {report.status ?? "SUCCESS"}

                </span>

              </div>

            </div>

          ))}

        </div>

      </div>

      {/* ================================================= */}
      {/* GOVERNANCE ISSUES */}
      {/* ================================================= */}

      <div className="rounded-lg border p-6">

        <h2 className="text-xl font-semibold mb-4">

          Governance Issues

        </h2>

        <div className="space-y-3">

          {issues.length === 0 && (

            <p className="text-gray-500">

              No governance issues detected.

            </p>

          )}

          {issues.map((issue) => (

            <div
              key={issue.id}
              className="rounded-lg border p-4"
            >

              <div className="flex items-start justify-between gap-4">

                <div>

                  <h3 className="font-semibold">

                    {issue.title}

                  </h3>

                  <p className="text-sm text-gray-500">

                    {issue.category}

                  </p>

                </div>

                <span
                  className={`rounded px-3 py-1 text-xs font-medium ${
                    issue.severity === "CRITICAL"
                      ? "bg-red-100 text-red-700"
                      : issue.severity === "ERROR"
                      ? "bg-orange-100 text-orange-700"
                      : issue.severity === "WARNING"
                      ? "bg-yellow-100 text-yellow-700"
                      : "bg-green-100 text-green-700"
                  }`}
                >

                  {issue.severity}

                </span>

              </div>

              <p className="mt-3 text-sm">

                {issue.description}

              </p>

              {issue.filePath && (

                <p className="mt-2 text-xs text-gray-500">

                  {issue.filePath}

                </p>

              )}

            </div>

          ))}

        </div>

      </div>

      {/* ================================================= */}
      {/* PART 5 STARTS HERE */}
      {/* ================================================= */}
            {/* ================================================= */}
      {/* GOVERNANCE SCORES */}
      {/* ================================================= */}

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">

        <div className="rounded-lg border p-4">

          <h3 className="text-sm text-gray-500">
            Architecture
          </h3>

          <p className="text-3xl font-bold">
            {dashboardReport?.scores.architecture ?? 0}%
          </p>

        </div>

        <div className="rounded-lg border p-4">

          <h3 className="text-sm text-gray-500">
            Security
          </h3>

          <p className="text-3xl font-bold">
            {dashboardReport?.scores.security ?? 0}%
          </p>

        </div>

        <div className="rounded-lg border p-4">

          <h3 className="text-sm text-gray-500">
            Profitability
          </h3>

          <p className="text-3xl font-bold">
            {dashboardReport?.scores.profitability ?? 0}%
          </p>

        </div>

        <div className="rounded-lg border p-4">

          <h3 className="text-sm text-gray-500">
            Deployment
          </h3>

          <p className="text-3xl font-bold">
            {dashboardReport?.scores.deployment ?? 0}%
          </p>

        </div>

      </div>

      {/* ================================================= */}
      {/* SYSTEM HEALTH */}
      {/* ================================================= */}

      <div className="rounded-lg border p-6">

        <h2 className="text-xl font-semibold mb-4">

          Governance Health

        </h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">

          <div>

            <p className="text-sm text-gray-500">

              Overall Health

            </p>

            <p className="font-semibold">

              {dashboardReport?.health.healthy
                ? "Healthy"
                : "Unhealthy"}

            </p>

          </div>

          <div>

            <p className="text-sm text-gray-500">

              Configuration

            </p>

            <p className="font-semibold">

              {dashboardReport?.health
                .configurationLoaded
                ? "Loaded"
                : "Failed"}

            </p>

          </div>

          <div>

            <p className="text-sm text-gray-500">

              Business Rules

            </p>

            <p className="font-semibold">

              {dashboardReport?.health
                .businessRulesHealthy
                ? "Healthy"
                : "Failed"}

            </p>

          </div>

        </div>

      </div>

      {/* ================================================= */}
      {/* DEPLOYMENT STATUS */}
      {/* ================================================= */}

      <div className="rounded-lg border p-6">

        <h2 className="text-xl font-semibold mb-4">

          Deployment Status

        </h2>

        <div className="flex items-center justify-between">

          <span>

            Ready For Production

          </span>

          <span
            className={`rounded px-4 py-2 text-sm font-semibold ${
              dashboardReport?.summary
                .deploymentReady
                ? "bg-green-100 text-green-700"
                : "bg-red-100 text-red-700"
            }`}
          >

            {dashboardReport?.summary
              .deploymentReady
              ? "READY"
              : "BLOCKED"}

          </span>

        </div>

      </div>

    </div>

  );

}
