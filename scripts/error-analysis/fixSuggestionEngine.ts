/**
 * ==========================================================
 * AI Error Analysis System
 * Fix Suggestion Engine
 * ==========================================================
 */

import { ParsedError } from "./buildLogParser";

export interface FixSuggestion extends ParsedError {
  title: string;
  description: string;
  steps: string[];
  autoFixPossible: boolean;
  estimatedTime: string;
  priority: "P1" | "P2" | "P3" | "P4";
}

export function generateFixSuggestions(
  errors: ParsedError[]
): FixSuggestion[] {

  return errors.map((error) => {

    let title = "Unknown Error";

    let description =
      "No predefined fix is available.";

    let steps: string[] = [];

    let autoFixPossible = false;

    let estimatedTime = "5 min";

    let priority: FixSuggestion["priority"] = "P4";

    //-------------------------------------------------------
    // TypeScript
    //-------------------------------------------------------

    if (error.code?.startsWith("TS")) {

      priority = "P1";

      switch (error.code) {

        case "TS2307":

          title = "Module Not Found";

          description =
            "Imported module cannot be resolved.";

          steps = [
            "Check import path.",
            "Verify file exists.",
            "Check tsconfig path aliases.",
            "Restart TypeScript Server."
          ];

          break;

        case "TS2339":

          title = "Property Missing";

          description =
            "Property does not exist on object.";

          steps = [
            "Verify interface.",
            "Update type definition.",
            "Correct property name."
          ];

          break;

        case "TS2353":

          title = "Invalid Object Property";

          description =
            "Object contains unknown property.";

          steps = [
            "Open interface definition.",
            "Add missing property.",
            "Or remove unsupported property."
          ];

          break;

        case "TS2322":

          title = "Type Assignment Error";

          description =
            "Assigned value has incorrect type.";

          steps = [
            "Check expected type.",
            "Convert value if needed.",
            "Update interface."
          ];

          break;

        default:

          title = "TypeScript Compilation Error";

          description =
            "Review compiler output.";

          steps = [
            "Open reported file.",
            "Read compiler message.",
            "Fix compile error."
          ];

      }

    }

    //-------------------------------------------------------
    // Firebase
    //-------------------------------------------------------

    else if (

      error.message.includes("auth/")

    ) {

      priority = "P1";

      title = "Firebase Authentication";

      description =
        "Authentication configuration failed.";

      steps = [

        "Check .env file.",

        "Verify Firebase API Key.",

        "Check Project ID.",

        "Restart development server."

      ];

    }

    //-------------------------------------------------------
    // Firestore
    //-------------------------------------------------------

    else if (

      error.message.includes("Firestore")

    ) {

      priority = "P2";

      title = "Firestore Error";

      description =
        "Database operation failed.";

      steps = [

        "Verify collection name.",

        "Check security rules.",

        "Confirm document exists."

      ];

    }

    //-------------------------------------------------------
    // ESLint
    //-------------------------------------------------------

    else if (

      error.source === "ESLINT"

    ) {

      priority = "P3";

      autoFixPossible = true;

      title = "ESLint Rule Violation";

      description =
        "Code style or best practice issue.";

      steps = [

        "Run npm run lint -- --fix",

        "Review remaining warnings.",

        "Commit formatted code."

      ];

    }

    //-------------------------------------------------------
    // Runtime
    //-------------------------------------------------------

    else if (

      error.message.includes("ReferenceError") ||

      error.message.includes("TypeError")

    ) {

      priority = "P1";

      title = "Runtime Exception";

      description =
        "Application crashed during execution.";

      steps = [

        "Inspect stack trace.",

        "Validate null/undefined values.",

        "Fix failing code path."

      ];

    }

    //-------------------------------------------------------
    // Build
    //-------------------------------------------------------

    else if (

      error.message.includes("Build failed")

    ) {

      priority = "P1";

      title = "Build Failed";

      description =
        "Compilation stopped.";

      steps = [

        "Fix first compiler error.",

        "Rebuild project.",

        "Verify remaining errors."

      ];

    }

    //-------------------------------------------------------

    return {

      ...error,

      title,

      description,

      steps,

      autoFixPossible,

      estimatedTime,

      priority

    };

  });

}
