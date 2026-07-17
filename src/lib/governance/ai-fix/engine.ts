import type { ScanResult } from "../runSystemScan";
import type { FixSuggestion } from "./types";

export async function getFixSuggestion(
  issue: ScanResult
): Promise<FixSuggestion | null> {
  if (!issue.autoFix) {
    return null;
  }

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

      file: issue.file ?? "unknown",

      lineStart: issue.line ?? 1,

      lineEnd: issue.line ?? issue.line ?? 1,

      column: issue.column ?? 1,

      type: "replace",

      title: issue.name,

      description: issue.message,

      oldCode: issue.currentCode ?? "",

      newCode:
        issue.fixedCode ??
        "// AI could not generate replacement.",

      suggestion: issue.suggestion,

      matchedValue: issue.currentCode,

      autoApplicable: issue.autoFix ?? false,

      patchId: issue.patchId,
    },
  };
}
