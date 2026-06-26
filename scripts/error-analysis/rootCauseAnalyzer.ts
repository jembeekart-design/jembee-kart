/**
 * ==========================================================
 * AI Error Analysis System
 * Root Cause Analyzer
 * ==========================================================
 */

import { ParsedError } from "./buildLogParser";

export interface RootCauseAnalysis extends ParsedError {
  rootCause: string;
  confidence: "HIGH" | "MEDIUM" | "LOW";
  parentErrorId?: string;
  affectedModules: string[];
  buildBlocking: boolean;
  recommendation: string;
}

export function analyzeRootCause(
  errors: ParsedError[]
): RootCauseAnalysis[] {

  const analyses: RootCauseAnalysis[] = [];

  for (const error of errors) {

    let rootCause = "Unknown root cause.";
    let confidence: RootCauseAnalysis["confidence"] = "LOW";
    let parentErrorId: string | undefined;
    let affectedModules: string[] = [];
    let buildBlocking = true;
    let recommendation = "Inspect the source file.";

    //------------------------------------------------------
    // TypeScript
    //------------------------------------------------------

    if (error.code?.startsWith("TS")) {

      confidence = "HIGH";

      switch (error.code) {

        case "TS2307":
          rootCause = "Module or path does not exist.";
          recommendation = "Verify import path and tsconfig aliases.";
          break;

        case "TS2339":
          rootCause = "Property missing in interface or type.";
          recommendation = "Update interface or property name.";
          break;

        case "TS2353":
          rootCause = "Object literal contains unsupported property.";
          recommendation = "Update interface definition.";
          break;

        case "TS2322":
          rootCause = "Assigned value has incompatible type.";
          recommendation = "Match expected TypeScript type.";
          break;

        default:
          rootCause = "TypeScript compilation failed.";
          recommendation = "Review compiler message.";
      }

    }

    //------------------------------------------------------
    // Firebase
    //------------------------------------------------------

    else if (
      error.message.includes("auth/") ||
      error.message.includes("Firebase")
    ) {

      confidence = "HIGH";
      rootCause = "Firebase configuration or authentication issue.";
      recommendation =
        "Check Firebase environment variables and project configuration.";

    }

    //------------------------------------------------------
    // ESLint
    //------------------------------------------------------

    else if (error.source === "ESLINT") {

      confidence = "MEDIUM";
      buildBlocking = false;
      rootCause = "Code quality rule violation.";
      recommendation = "Fix ESLint rule or update configuration.";

    }

    //------------------------------------------------------
    // Runtime
    //------------------------------------------------------

    else if (
      error.message.includes("ReferenceError") ||
      error.message.includes("TypeError")
    ) {

      confidence = "HIGH";
      rootCause = "Runtime exception caused by invalid object or variable.";
      recommendation =
        "Check stack trace and validate null/undefined values.";

    }

    //------------------------------------------------------
    // Parent Error Detection
    //------------------------------------------------------

    const parent = errors.find(e =>
      e !== error &&
      e.file &&
      error.file &&
      e.file === error.file &&
      e.code !== error.code
    );

    if (parent) {
      parentErrorId = parent.id;
    }

    //------------------------------------------------------
    // Affected Modules
    //------------------------------------------------------

    if (error.file) {

      const parts = error.file.split("/");

      if (parts.length > 1) {

        affectedModules.push(parts[0]);

        affectedModules.push(parts[parts.length - 1]);

      } else {

        affectedModules.push(error.file);

      }

    }

    analyses.push({

      ...error,

      rootCause,

      confidence,

      parentErrorId,

      affectedModules,

      buildBlocking,

      recommendation

    });

  }

  return analyses;

}
