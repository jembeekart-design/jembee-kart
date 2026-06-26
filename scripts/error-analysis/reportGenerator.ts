/**
 * ==========================================================
 * AI Error Analysis System
 * Report Generator
 * ==========================================================
 */

import fs from "node:fs";
import path from "node:path";
import { ParsedError } from "./buildLogParser";

export interface ErrorAnalysisReport {

  generatedAt: string;

  project: string;

  summary: {

    totalErrors: number;

    critical: number;

    high: number;

    medium: number;

    low: number;

    buildStatus: "PASSED" | "FAILED";

    estimatedFixTime: string;

  };

  errors: ParsedError[];

}

const REPORT_DIR = path.join(
  process.cwd(),
  "reports"
);

export function generateJsonReport(
  errors: ParsedError[]
): ErrorAnalysisReport {

  ensureDirectory();

  const report: ErrorAnalysisReport = {

    generatedAt: new Date().toISOString(),

    project: "JembeeKart",

    summary: {

      totalErrors: errors.length,

      critical: count(errors, "CRITICAL"),

      high: count(errors, "HIGH"),

      medium: count(errors, "MEDIUM"),

      low: count(errors, "LOW"),

      buildStatus:
        count(errors, "CRITICAL") > 0
          ? "FAILED"
          : "PASSED",

      estimatedFixTime:
        estimateFixTime(errors)

    },

    errors

  };

  fs.writeFileSync(

    path.join(
      REPORT_DIR,
      "error-analysis.json"
    ),

    JSON.stringify(
      report,
      null,
      2
    )

  );

  return report;

}

function count(
  errors: ParsedError[],
  severity: ParsedError["severity"]
) {

  return errors.filter(
    e => e.severity === severity
  ).length;

}

function estimateFixTime(
  errors: ParsedError[]
): string {

  let minutes = 0;

  for (const error of errors) {

    switch (error.severity) {

      case "CRITICAL":
        minutes += 15;
        break;

      case "HIGH":
        minutes += 10;
        break;

      case "MEDIUM":
        minutes += 5;
        break;

      case "LOW":
        minutes += 2;
        break;

    }

  }

  if (minutes < 60) {

    return `${minutes} min`;

  }

  const hours = Math.floor(minutes / 60);

  const remain = minutes % 60;

  return `${hours} hr ${remain} min`;

}

function ensureDirectory() {

  if (!fs.existsSync(REPORT_DIR)) {

    fs.mkdirSync(REPORT_DIR, {

      recursive: true

    });

  }

}
