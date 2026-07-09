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
    <div className="rounded-3xl border border-white/10 bg-[#111111] p-6">
      <div className="flex items-center justify-between">

        <h3 className="text-lg font-bold">
          {title}
        </h3>

        {status === "PASS" && (
          <CheckCircle className="text-green-400" />
        )}

        {status === "WARNING" && (
          <AlertTriangle className="text-yellow-400" />
        )}

        {status === "FAIL" && (
          <XCircle className="text-red-400" />
        )}

        {status === "CRITICAL" && (
          <XCircle className="text-pink-500" />
        )}

      </div>

      <div className="mt-4 space-y-2">

        {issues.map((issue, index) => (
          <div
            key={index}
            className={`rounded-xl p-3 text-sm ${
              status === "CRITICAL"
                ? "bg-pink-500/10 text-pink-300"
                : status === "FAIL"
                ? "bg-[var(--danger-color)]/10 text-red-300"
                : status === "WARNING"
                ? "bg-[var(--warning-color)]/10 text-yellow-300"
                : "bg-[var(--success-color)]/10 text-green-300"
            }`}
          >
            {issue}
          </div>
        ))}

      </div>
    </div>
  );
}
