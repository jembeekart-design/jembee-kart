import type { FixSuggestion } from "./types";

export interface PreviewResult {
  title: string;
  description: string;

  file: string;

  lineStart: number;
  lineEnd?: number;

  oldCode?: string;
  newCode: string;

  autoApplicable: boolean;
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

    oldCode: suggestion.patch.oldCode,
    newCode: suggestion.patch.newCode,

    autoApplicable: suggestion.patch.autoApplicable,
  };
}
