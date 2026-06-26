/**
 * ==========================================================
 * AI Error Analysis System
 * ESLint Analyzer
 * ==========================================================
 */

import { ParsedError } from "./buildLogParser";

export interface ESLintError extends ParsedError {
  rule?: string;
  category:
    | "REACT"
    | "TYPESCRIPT"
    | "IMPORT"
    | "STYLE"
    | "PERFORMANCE"
    | "UNKNOWN";

  rootCause?: string;
  suggestedFix?: string;
}

export function analyzeESLint(
  errors: ParsedError[]
): ESLintError[] {

  const eslintErrors = errors.filter(error => {

    return (
      error.source === "ESLINT" ||
      error.message.toLowerCase().includes("eslint")
    );

  });

  return eslintErrors.map(error => {

    let category: ESLintError["category"] = "UNKNOWN";

    let rootCause = "Unknown ESLint issue.";

    let suggestedFix = "Review ESLint rule.";

    let rule: string | undefined;

    //----------------------------------------------------------
    // Extract Rule
    //----------------------------------------------------------

    const match = error.message.match(/\(([^)]+)\)$/);

    if (match) {
      rule = match[1];
    }

    //----------------------------------------------------------
    // React Rules
    //----------------------------------------------------------

    if (
      rule?.startsWith("react/") ||
      error.message.includes("react/")
    ) {

      category = "REACT";

      rootCause = "React ESLint rule violation.";

      suggestedFix =
        "Follow React best practices or update the component.";

    }

    //----------------------------------------------------------
    // TypeScript Rules
    //----------------------------------------------------------

    else if (

      rule?.startsWith("@typescript-eslint/") ||

      error.message.includes("@typescript-eslint")

    ) {

      category = "TYPESCRIPT";

      rootCause = "TypeScript ESLint rule violation.";

      suggestedFix =
        "Fix typing issue according to TypeScript ESLint.";

    }

    //----------------------------------------------------------
    // Import Rules
    //----------------------------------------------------------

    else if (

      rule?.startsWith("import/") ||

      error.message.includes("import/")

    ) {

      category = "IMPORT";

      rootCause = "Import or module rule violation.";

      suggestedFix =
        "Check import order, path and module resolution.";

    }

    //----------------------------------------------------------
    // Style Rules
    //----------------------------------------------------------

    else if (

      error.message.includes("prettier") ||

      error.message.includes("format")

    ) {

      category = "STYLE";

      rootCause = "Formatting issue.";

      suggestedFix =
        "Run prettier or fix formatting.";

    }

    //----------------------------------------------------------
    // Performance
    //----------------------------------------------------------

    else if (

      error.message.includes("memo") ||

      error.message.includes("useMemo") ||

      error.message.includes("useCallback")

    ) {

      category = "PERFORMANCE";

      rootCause =
        "Possible unnecessary re-render.";

      suggestedFix =
        "Optimize component rendering.";

    }

    //----------------------------------------------------------
    // Special Known Rule
    //----------------------------------------------------------

    if (

      error.message.includes("react/display-name")

    ) {

      category = "REACT";

      rootCause =
        "Component displayName missing.";

      suggestedFix =
        "Assign displayName to anonymous component.";

    }

    return {

      ...error,

      rule,

      category,

      rootCause,

      suggestedFix

    };

  });

}
