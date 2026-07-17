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

  column?: number;

  type: FixType;

  title: string;

  description: string;

  oldCode?: string;

  newCode: string;

  suggestion?: string;

  matchedValue?: string;

  autoApplicable: boolean;

  patchId?: string;
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
