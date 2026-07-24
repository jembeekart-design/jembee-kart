export type SuggestionSeverity =
  | "info"
  | "warning"
  | "critical";

export type SuggestionAction =
  | "manual"
  | "ast-fix"
  | "firestore"
  | "ignore";

export interface Suggestion {
  id: string;
  title: string;
  description: string;
  file: string;
  line?: number;
  severity: SuggestionSeverity;
  action: SuggestionAction;
  rule: string;
  recommendation: string;
}

export interface SuggestionReport {
  success: boolean;
  total: number;
  critical: number;
  warnings: number;
  info: number;
  suggestions: Suggestion[];
}
