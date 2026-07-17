import type { FixSuggestion } from "./types";

export interface PreviewResult {
  title: string;
  description: string;

  file: string;

  lineStart: number;
  lineEnd?: number;

  column?: number;

  oldCode?: string;
  newCode: string;

  suggestion?: string;

  matchedValue?: string;

  autoApplicable: boolean;

  patchId?: string;
}

export async function generatePreview(
  suggestion: FixSuggestion
): Promise<PreviewResult> {
  return {
    title: suggestion.title,
    description: suggestion.description,

    file: suggestion.patch.file,

    lineStart: suggestion.patch.lineStart,
    lineEnd: suggestion.patch.lineEnd,

    column: suggestion.patch.column,

    oldCode: suggestion.patch.oldCode,

    newCode: suggestion.patch.newCode,

    suggestion: suggestion.patch.suggestion,

    matchedValue: suggestion.patch.matchedValue,

    autoApplicable: suggestion.patch.autoApplicable,

    patchId: suggestion.patch.patchId,
  };
}
