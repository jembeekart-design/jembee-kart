// src/lib/governance/ai-fix/apply.ts

import type { PreviewResult } from "./preview";

export interface ApplyFixResult {
  success: boolean;
  message: string;

  file: string;

  lineStart: number;
  lineEnd?: number;

  patch: string;

  appliedAt: Date;
}

export async function applyFix(
  preview: PreviewResult
): Promise<ApplyFixResult> {
  if (!preview.autoApplicable) {
    return {
      success: false,
      message: "This fix requires manual review.",

      file: preview.file,

      lineStart: preview.lineStart,
      lineEnd: preview.lineEnd,

      patch: "",

      appliedAt: new Date(),
    };
  }

  const diff = [
    `--- ${preview.file}`,
    `+++ ${preview.file}`,
    `@@ Line ${preview.lineStart} @@`,
    preview.oldCode ?? "",
    "----------------",
    preview.newCode,
  ].join("\n");

  return {
    success: true,

    message: "Patch generated successfully.",

    file: preview.file,

    lineStart: preview.lineStart,
    lineEnd: preview.lineEnd,

    patch: diff,

    appliedAt: new Date(),
  };
}
