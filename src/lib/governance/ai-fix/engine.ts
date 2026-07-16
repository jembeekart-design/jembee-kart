// src/lib/governance/ai-fix/engine.ts

import type { ScanResult } from "@/lib/governance/runSystemScan";
import { FIX_REGISTRY } from "./registry";
import type { FixSuggestion } from "./types";

/**
 * Returns the registered fix suggestion for a scanner issue.
 */
export async function getFixSuggestion(
  issue: ScanResult
): Promise<FixSuggestion | null> {
  const fix = FIX_REGISTRY[issue.id];

  if (!fix) {
    return null;
  }

  return {
    scannerId: issue.id,
    ...fix,
  };
}

/**
 * Returns true if an automatic fix is available.
 */
export function hasAutoFix(issue: ScanResult): boolean {
  return issue.id in FIX_REGISTRY;
}

/**
 * Returns all supported scanner ids.
 */
export function getSupportedFixes(): string[] {
  return Object.keys(FIX_REGISTRY);
}
