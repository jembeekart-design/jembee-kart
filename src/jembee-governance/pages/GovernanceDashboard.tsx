// src/jembee-governance/pages/GovernanceDashboard.tsx

"use client";

import { useEffect, useState } from "react";
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

export default function GovernanceDashboard() {
  const [loading, setLoading] = useState(true);

  const [stats, setStats] =
    useState<GovernanceStats | null>(null);

  const [issues, setIssues] = useState<any[]>([]);
  const [reports, setReports] = useState<any[]>([]);

  useEffect(() => {
    loadDashboard();
  }, []);

  const loadDashboard = async () => {
    try {
      setLoading(true);

      const [
        dashboardStats,
        governanceIssues,
        governanceReports,
      ] = await Promise.all([
        governanceStatusService.getDashboardStats(),
        governanceIssueService.getAllIssues(),
        governanceReportService.getLatestReports(),
      ]);

      setStats(dashboardStats);
      setIssues(governanceIssues);
      setReports(governanceReports);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="p-6">
        Loading Governance Dashboard...
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">

      <div>
        <h1 className="text-3xl font-bold">
          Governance Dashboard
        </h1>

        <p className="text-gray-500">
          JembeeKart Governance Monitoring
        </p>
      </div>

      {/* STATS */}

      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4">

        <div className="border rounded-lg p-4">
          <h3>Total Issues</h3>
          <p className="text-2xl font-bold">
            {stats?.totalIssues ?? 0}
          </p>
        </div>

        <div className="border rounded-lg p-4">
          <h3>Critical</h3>
          <p className="text-2xl font-bold">
            {stats?.criticalIssues ?? 0}
          </p>
        </div>

        <div className="border rounded-lg p-4">
          <h3>Warnings</h3>
          <p className="text-2xl font-bold">
            {stats?.warningIssues ?? 0}
          </p>
        </div>

        <div className="border rounded-lg p-4">
          <h3>Passed</h3>
          <p className="text-2xl font-bold">
            {stats?.passedModules ?? 0}
          </p>
        </div>

        <div className="border rounded-lg p-4">
          <h3>Failed</h3>
          <p className="text-2xl font-bold">
            {stats?.failedModules ?? 0}
          </p>
        </div>

        <div className="border rounded-lg p-4">
          <h3>Score</h3>
          <p className="text-2xl font-bold">
            {stats?.governanceScore ?? 0}%
          </p>
        </div>

      </div>

      {/* REPORTS */}

      <div className="border rounded-lg p-4">
        <h2 className="text-xl font-semibold mb-4">
          Latest Reports
        </h2>

        <div className="space-y-2">

          {reports.length === 0 && (
            <p>No reports found.</p>
          )}

          {reports.map((report: any) => (
            <div
              key={report.id}
              className="border rounded p-3"
            >
              <div className="font-semibold">
                {report.title}
              </div>

              <div className="text-sm text-gray-500">
                {report.createdAt}
              </div>
            </div>
          ))}

        </div>
      </div>

      {/* ISSUES */}

      <div className="border rounded-lg p-4">
        <h2 className="text-xl font-semibold mb-4">
          Governance Issues
        </h2>

        <div className="space-y-3">

          {issues.length === 0 && (
            <p>No issues detected.</p>
          )}

          {issues.map((issue: any) => (
            <div
              key={issue.id}
              className="border rounded p-3"
            >
              <div className="flex justify-between">

                <div>
                  <h3 className="font-semibold">
                    {issue.title}
                  </h3>

                  <p className="text-sm text-gray-500">
                    {issue.category}
                  </p>
                </div>

                <span
                  className={`text-xs px-2 py-1 rounded ${
                    issue.severity === "CRITICAL"
                      ? "bg-red-100"
                      : issue.severity === "WARNING"
                      ? "bg-yellow-100"
                      : "bg-green-100"
                  }`}
                >
                  {issue.severity}
                </span>

              </div>

              <p className="mt-2 text-sm">
                {issue.description}
              </p>

              {issue.filePath && (
                <p className="text-xs text-gray-500 mt-2">
                  {issue.filePath}
                </p>
              )}
            </div>
          ))}

        </div>
      </div>

    </div>
  );
}
