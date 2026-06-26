/**
 * ==========================================================
 * AI Error Analysis System
 * Build Log Parser
 * ==========================================================
 */

import fs from "node:fs";
import path from "node:path";

export interface ParsedError {
  id: string;
  severity: "CRITICAL" | "HIGH" | "MEDIUM" | "LOW";
  source: "BUILD" | "TYPESCRIPT" | "ESLINT" | "RUNTIME" | "FIREBASE";

  file?: string;
  line?: number;
  column?: number;

  code?: string;
  message: string;

  raw: string;
}

const REPORT_DIR = path.join(process.cwd(), "reports");

const LOG_FILES = [
  "build.log",
  "typescript.log",
  "eslint.log"
];

export function parseBuildLog(): ParsedError[] {

  const errors: ParsedError[] = [];

  let counter = 1;

  for (const log of LOG_FILES) {

    const filePath = path.join(REPORT_DIR, log);

    if (!fs.existsSync(filePath)) {
      continue;
    }

    const content = fs.readFileSync(filePath, "utf8");

    const lines = content.split(/\r?\n/);

    for (const line of lines) {

      if (!containsError(line)) {
        continue;
      }

      const parsed = parseLine(line);

      errors.push({
        id: `ERROR-${String(counter).padStart(3, "0")}`,
        severity: parsed.severity,
        source: parsed.source,
        file: parsed.file,
        line: parsed.line,
        column: parsed.column,
        code: parsed.code,
        message: parsed.message,
        raw: line
      });

      counter++;

    }

  }

  return removeDuplicateErrors(errors);

}

function containsError(line: string): boolean {

  const value = line.toLowerCase();

  return (
    value.includes("error") ||
    value.includes("failed") ||
    value.includes("exception") ||
    value.includes("ts") ||
    value.includes("eslint")
  );

}

function parseLine(line: string) {

  let severity: ParsedError["severity"] = "LOW";

  let source: ParsedError["source"] = "BUILD";

  let file: string | undefined;

  let lineNumber: number | undefined;

  let column: number | undefined;

  let code: string | undefined;

  //-----------------------------
  // TS Error Code
  //-----------------------------

  const ts = line.match(/TS\d+/);

  if (ts) {
    code = ts[0];
    source = "TYPESCRIPT";
    severity = "CRITICAL";
  }

  //-----------------------------
  // ESLint
  //-----------------------------

  if (line.includes("eslint")) {
    source = "ESLINT";
    severity = "HIGH";
  }

  //-----------------------------
  // Runtime
  //-----------------------------

  if (
    line.includes("Unhandled") ||
    line.includes("ReferenceError") ||
    line.includes("TypeError")
  ) {
    source = "RUNTIME";
    severity = "CRITICAL";
  }

  //-----------------------------
  // Firebase
  //-----------------------------

  if (
    line.includes("Firebase") ||
    line.includes("Firestore") ||
    line.includes("auth/")
  ) {
    source = "FIREBASE";
    severity = "HIGH";
  }

  //-----------------------------
  // File
  //-----------------------------

  const fileMatch = line.match(/[A-Za-z0-9_\-/]+\.(ts|tsx|js|jsx)/);

  if (fileMatch) {
    file = fileMatch[0];
  }

  //-----------------------------
  // Line + Column
  //-----------------------------

  const lc = line.match(/:(\d+):(\d+)/);

  if (lc) {
    lineNumber = Number(lc[1]);
    column = Number(lc[2]);
  }

  return {
    severity,
    source,
    file,
    line: lineNumber,
    column,
    code,
    message: line.trim()
  };

}

function removeDuplicateErrors(
  errors: ParsedError[]
): ParsedError[] {

  const map = new Map<string, ParsedError>();

  for (const error of errors) {

    const key = [
      error.file,
      error.line,
      error.column,
      error.code,
      error.message
    ].join("|");

    if (!map.has(key)) {
      map.set(key, error);
    }

  }

  return [...map.values()];

}
