/**
 * ==========================================================
 * AI Error Analysis System
 * TypeScript Analyzer
 * ==========================================================
 */

import { ParsedError } from "./buildLogParser";

export interface TypeScriptError extends ParsedError {
  category: "TYPE" | "INTERFACE" | "IMPORT" | "EXPORT" | "UNKNOWN";
  rootCause?: string;
  suggestedFix?: string;
}

export function analyzeTypeScript(
  errors: ParsedError[]
): TypeScriptError[] {

  const tsErrors = errors.filter(
    error =>
      error.source === "TYPESCRIPT" ||
      error.code?.startsWith("TS")
  );

  return tsErrors.map(error => {

    let category: TypeScriptError["category"] = "UNKNOWN";

    let rootCause = "Unknown TypeScript Error";

    let suggestedFix = "Inspect the file and correct the TypeScript error.";

    switch (error.code) {

      case "TS2304":
        category = "IMPORT";
        rootCause = "Cannot find name.";
        suggestedFix = "Check imports, spelling or missing declaration.";
        break;

      case "TS2307":
        category = "IMPORT";
        rootCause = "Cannot find module.";
        suggestedFix = "Verify file path and tsconfig path aliases.";
        break;

      case "TS2322":
        category = "TYPE";
        rootCause = "Type assignment mismatch.";
        suggestedFix = "Ensure assigned value matches expected type.";
        break;

      case "TS2339":
        category = "INTERFACE";
        rootCause = "Property does not exist.";
        suggestedFix = "Update interface/type or fix property name.";
        break;

      case "TS2353":
        category = "INTERFACE";
        rootCause = "Object contains unknown property.";
        suggestedFix = "Add property to interface or remove it.";
        break;

      case "TS2551":
        category = "TYPE";
        rootCause = "Property name may be incorrect.";
        suggestedFix = "Check spelling or rename property.";
        break;

      case "TS2554":
        category = "TYPE";
        rootCause = "Incorrect function arguments.";
        suggestedFix = "Match function parameters.";
        break;

      case "TS2741":
        category = "INTERFACE";
        rootCause = "Required property missing.";
        suggestedFix = "Provide all required properties.";
        break;

      case "TS7006":
        category = "TYPE";
        rootCause = "Implicit any type.";
        suggestedFix = "Declare parameter type.";
        break;

      default:

        if (error.message.includes("does not exist")) {

          category = "INTERFACE";
          rootCause = "Missing property or invalid interface.";
          suggestedFix = "Verify interface definition.";

        } else if (error.message.includes("Cannot find module")) {

          category = "IMPORT";
          rootCause = "Missing import or wrong path.";
          suggestedFix = "Check module path.";

        }

    }

    return {
      ...error,
      category,
      rootCause,
      suggestedFix
    };

  });

}
