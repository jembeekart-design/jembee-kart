import type { ScanResult } from "../runSystemScan";
import type { FixSuggestion } from "./types";

export async function getFixSuggestion(
  issue: ScanResult
): Promise<FixSuggestion | null> {
  if (!issue.autoFix) {
    return null;
  }

  const line = issue.line ?? 1;
  const column = issue.column ?? 1;

  return {
    scannerId: issue.id,

    title: `Auto Fix: ${issue.name}`,

    description:
      issue.suggestion ??
      issue.message ??
      "AI generated code suggestion.",

    confidence: 0.95,

    estimatedTime: "30 seconds",

    patch: {
      id: issue.patchId ?? crypto.randomUUID(),

      patchId: issue.patchId ?? crypto.randomUUID(),

      file: issue.file ?? "unknown",

      lineStart: line,

      lineEnd: line,

      column,

      type: "replace",

      title: issue.name,

      description:
        issue.message ??
        "Hardcoded business rule detected.",

      oldCode:
        issue.currentCode ??
        issue.matchedValue ??
        "",

      newCode:
        issue.fixedCode ??
        "// Move this value to Firestore Admin Config",

      matchedValue:
        issue.matchedValue ??
        issue.currentCode ??
        "",

      suggestion:
        issue.suggestion ??
        "Replace hardcoded business logic with Firestore configuration.",

      autoApplicable:
        issue.autoFix ?? false,
    },
  };
}
