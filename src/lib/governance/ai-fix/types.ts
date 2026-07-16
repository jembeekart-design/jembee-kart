// src/lib/governance/ai-fix/types.ts

import type { ScanResult } from "@/lib/governance/runSystemScan";

export type FixType =
  | "replace"
  | "insert"
  | "delete"
  | "create";

export interface CodePatch {
  id: string;

  file: string;

  lineStart: number;

  lineEnd?: number;

  type: FixType;

  title: string;

  description: string;

  oldCode?: string;

  newCode: string;

  autoApplicable: boolean;
}

export interface FixSuggestion {
  scannerId: string;

  title: string;

  description: string;

  confidence: number;

  estimatedTime: string;

  patch: CodePatch;
}

export interface ApplyFixResult {
  success: boolean;

  message: string;

  updatedFile?: string;

  commitMessage?: string;

  error?: string;
}

export interface AIFixProvider {
  getSuggestion(
    issue: ScanResult
  ): Promise<FixSuggestion | null>;

  applyFix(
    suggestion: FixSuggestion
  ): Promise<ApplyFixResult>;
}
