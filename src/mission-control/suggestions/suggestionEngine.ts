import { previewHardcodedRuleFix } from "../autofix/hardcodedRuleAutoFix";
import {
  Suggestion,
  SuggestionReport,
} from "./types";

export function generateSuggestions(): SuggestionReport {
  const preview = previewHardcodedRuleFix();

  const suggestions: Suggestion[] = preview.preview.map((item, index) => ({
    id: `SUG-${index + 1}`,
    title: "Hardcoded Business Rule",
    description: item.reason,
    file: item.file,
    severity: item.safe ? "warning" : "critical",
    action: item.safe ? "ast-fix" : "manual",
    rule: item.configPaths.join(", "),
    recommendation: item.safe
      ? "Replace this rule with Firestore configuration."
      : "Manual review required before applying changes.",
  }));

  return {
    success: true,
    total: suggestions.length,
    critical: suggestions.filter(s => s.severity === "critical").length,
    warnings: suggestions.filter(s => s.severity === "warning").length,
    info: suggestions.filter(s => s.severity === "info").length,
    suggestions,
  };
}
