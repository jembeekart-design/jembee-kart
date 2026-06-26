/**
 * ==========================================================
 * AI Error Analysis System
 * TypeScript Log Parser
 * ==========================================================
 */

import fs from "node:fs";
import path from "node:path";

export interface TypeScriptLogError {

  id: string;

  file: string;

  line: number;

  column: number;

  code: string;

  severity: "CRITICAL";

  category:
    | "TYPE"
    | "INTERFACE"
    | "IMPORT"
    | "EXPORT"
    | "CONFIG"
    | "UNKNOWN";

  message: string;

  raw: string;

}

const REPORT_DIR = path.join(
  process.cwd(),
  "reports"
);

const LOG_FILE = path.join(
  REPORT_DIR,
  "typescript.log"
);

export function parseTypeScriptLog(): TypeScriptLogError[] {

  if (!fs.existsSync(LOG_FILE)) {

    return [];

  }

  const content = fs.readFileSync(
    LOG_FILE,
    "utf8"
  );

  const lines = content.split(/\r?\n/);

  const errors: TypeScriptLogError[] = [];

  let index = 1;

  /**
   * Matches:
   *
   * src/file.ts(90,19): error TS2353: message
   * src/file.tsx(25,8): error TS2339: message
   */

  const regex =
    /^(.+?)(\d+),(\d+):\s*error\s*(TS\d+):\s*(.+)$/i;

  for (const line of lines) {

    const match = line.match(regex);

    if (!match) continue;

    const [

      ,

      file,

      lineNo,

      column,

      code,

      message

    ] = match;

    errors.push({

      id: `TS-${String(index).padStart(4, "0")}`,

      file,

      line: Number(lineNo),

      column: Number(column),

      code,

      severity: "CRITICAL",

      category: getCategory(code),

      message: message.trim(),

      raw: line

    });

    index++;

  }

  return removeDuplicates(errors);

}

function getCategory(
  code: string
): TypeScriptLogError["category"] {

  switch (code) {

    case "TS2304":

    case "TS2305":

    case "TS2307":

      return "IMPORT";

    case "TS2322":

      return "TYPE";

    case "TS2339":

    case "TS2353":

    case "TS2741":

    case "TS2739":

      return "INTERFACE";

    case "TS5055":

    case "TS5058":

      return "CONFIG";

    default:

      return "UNKNOWN";

  }

}

function removeDuplicates(
  errors: TypeScriptLogError[]
): TypeScriptLogError[] {

  const map = new Map<
    string,
    TypeScriptLogError
  >();

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

export function getTypeScriptSummary(
  errors: TypeScriptLogError[]
) {

  const byCode: Record<string, number> = {};

  for (const error of errors) {

    byCode[error.code] =
      (byCode[error.code] || 0) + 1;

  }

  return {

    total: errors.length,

    byCode

  };

}
