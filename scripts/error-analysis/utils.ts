/**
 * ==========================================================
 * AI Error Analysis System
 * Common Utilities
 * ==========================================================
 */

import fs from "node:fs";
import path from "node:path";
import crypto from "node:crypto";

/* ----------------------------------------------------------
 * File Utilities
 * -------------------------------------------------------- */

export function fileExists(filePath: string): boolean {
  return fs.existsSync(filePath);
}

export function readFile(filePath: string): string {
  return fs.readFileSync(filePath, "utf8");
}

export function writeFile(
  filePath: string,
  content: string
): void {

  ensureDirectory(path.dirname(filePath));

  fs.writeFileSync(filePath, content, "utf8");

}

/* ----------------------------------------------------------
 * Directory
 * -------------------------------------------------------- */

export function ensureDirectory(
  directory: string
): void {

  if (!fs.existsSync(directory)) {

    fs.mkdirSync(directory, {
      recursive: true
    });

  }

}

/* ----------------------------------------------------------
 * Error ID
 * -------------------------------------------------------- */

let errorCounter = 1;

export function generateErrorId(): string {

  return `ERROR-${String(errorCounter++)
    .padStart(3, "0")}`;

}

/* ----------------------------------------------------------
 * Hash
 * -------------------------------------------------------- */

export function generateHash(
  value: string
): string {

  return crypto
    .createHash("sha256")
    .update(value)
    .digest("hex");

}

/* ----------------------------------------------------------
 * Duplicate Removal
 * -------------------------------------------------------- */

export function removeDuplicates<T>(
  list: T[],
  key: (item: T) => string
): T[] {

  const map = new Map<string, T>();

  for (const item of list) {

    map.set(key(item), item);

  }

  return [...map.values()];

}

/* ----------------------------------------------------------
 * Severity Score
 * -------------------------------------------------------- */

export function severityScore(
  severity: string
): number {

  switch (severity) {

    case "CRITICAL":
      return 100;

    case "HIGH":
      return 75;

    case "MEDIUM":
      return 50;

    case "LOW":
      return 25;

    default:
      return 0;

  }

}

/* ----------------------------------------------------------
 * Estimated Fix Time
 * -------------------------------------------------------- */

export function estimateFixMinutes(
  severity: string
): number {

  switch (severity) {

    case "CRITICAL":
      return 20;

    case "HIGH":
      return 10;

    case "MEDIUM":
      return 5;

    case "LOW":
      return 2;

    default:
      return 1;

  }

}

/* ----------------------------------------------------------
 * Format Time
 * -------------------------------------------------------- */

export function formatMinutes(
  minutes: number
): string {

  if (minutes < 60) {

    return `${minutes} min`;

  }

  const hours = Math.floor(
    minutes / 60
  );

  const remain = minutes % 60;

  return `${hours} hr ${remain} min`;

}

/* ----------------------------------------------------------
 * Normalize Path
 * -------------------------------------------------------- */

export function normalizePath(
  filePath: string
): string {

  return filePath.replace(/\\/g, "/");

}

/* ----------------------------------------------------------
 * Safe JSON Parse
 * -------------------------------------------------------- */

export function safeJsonParse<T>(
  value: string
): T | null {

  try {

    return JSON.parse(value) as T;

  } catch {

    return null;

  }

}

/* ----------------------------------------------------------
 * Logger
 * -------------------------------------------------------- */

export function logInfo(
  message: string
): void {

  console.log(`ℹ ${message}`);

}

export function logSuccess(
  message: string
): void {

  console.log(`✅ ${message}`);

}

export function logWarning(
  message: string
): void {

  console.warn(`⚠ ${message}`);

}

export function logError(
  message: string
): void {

  console.error(`❌ ${message}`);

}

/* ----------------------------------------------------------
 * Timestamp
 * -------------------------------------------------------- */

export function timestamp(): string {

  return new Date().toISOString();

}
