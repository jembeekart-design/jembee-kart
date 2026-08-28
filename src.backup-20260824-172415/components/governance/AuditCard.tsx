"use client";

import {
  AlertTriangle,
  CheckCircle,
  XCircle,
} from "lucide-react";

interface AuditCardProps {
  title: string;
  status:
    | "PASS"
    | "WARNING"
    | "FAIL"
    | "CRITICAL";
  issues: string[];
}

export default function AuditCard({
  title,
  status,
  issues,
}: AuditCardProps) {
  return (
    <div className="rounded-3xl border border-[var(--border-color)]/10 bg-[var(--primary-color)] p-6">
      <div className="flex items-center justify-between">

        <h3 className="text-lg font-bold">
          {title}
        </h3>

        {status === "PASS" && (
          <CheckCircle className="text-[var(--success-color)]" />
        )}

        {status === "WARNING" && (
          <AlertTriangle className="text-[var(--warning-color)]" />
        )}

        {status === "FAIL" && (
          <XCircle className="text-[var(--danger-color)]" />
        )}

        {status === "CRITICAL" && (
          <XCircle className="text-[var(--primary-color)]" />
        )}

      </div>

      <div className="mt-4 space-y-2">

        {issues.map((issue, index) => (
          <div
            key={index}
            className={`rounded-xl p-3 text-sm ${
              status === "CRITICAL"
                ? "bg-[var(--primary-color)]/10 text-[var(--primary-color)]"
                : status === "FAIL"
                ? "bg-[var(--danger-color)]/10 text-[var(--danger-color)]"
                : status === "WARNING"
                ? "bg-[var(--warning-color)]/10 text-[var(--warning-color)]"
                : "bg-[var(--success-color)]/10 text-[var(--success-color)]"
            }`}
          >
            {issue}
          </div>
        ))}

      </div>
    </div>
  );
}
