/**
 * ==========================================================
 * AI Error Analysis System
 * Runtime Analyzer
 * ==========================================================
 */

import { ParsedError } from "./buildLogParser";

export interface RuntimeError extends ParsedError {
  category:
    | "REFERENCE_ERROR"
    | "TYPE_ERROR"
    | "SYNTAX_ERROR"
    | "RANGE_ERROR"
    | "NEXTJS"
    | "NODE"
    | "UNKNOWN";

  rootCause?: string;

  suggestedFix?: string;

  buildBlocking: boolean;
}

export function analyzeRuntime(
  errors: ParsedError[]
): RuntimeError[] {

  const runtimeErrors = errors.filter(error => {

    return (
      error.source === "RUNTIME" ||

      error.message.includes("ReferenceError") ||

      error.message.includes("TypeError") ||

      error.message.includes("SyntaxError") ||

      error.message.includes("RangeError") ||

      error.message.includes("Next.js") ||

      error.message.includes("Unhandled")
    );

  });

  return runtimeErrors.map(error => {

    let category: RuntimeError["category"] = "UNKNOWN";

    let rootCause = "Unknown runtime error.";

    let suggestedFix =
      "Inspect runtime stack trace.";

    let buildBlocking = true;

    //-------------------------------------------------------
    // ReferenceError
    //-------------------------------------------------------

    if (error.message.includes("ReferenceError")) {

      category = "REFERENCE_ERROR";

      rootCause =
        "Variable or function is not defined.";

      suggestedFix =
        "Check imports, declarations and variable names.";

    }

    //-------------------------------------------------------
    // TypeError
    //-------------------------------------------------------

    else if (error.message.includes("TypeError")) {

      category = "TYPE_ERROR";

      rootCause =
        "Accessing property or method on invalid value.";

      suggestedFix =
        "Check undefined/null values before access.";

    }

    //-------------------------------------------------------
    // SyntaxError
    //-------------------------------------------------------

    else if (error.message.includes("SyntaxError")) {

      category = "SYNTAX_ERROR";

      rootCause =
        "Invalid JavaScript or TypeScript syntax.";

      suggestedFix =
        "Correct syntax near the reported location.";

    }

    //-------------------------------------------------------
    // RangeError
    //-------------------------------------------------------

    else if (error.message.includes("RangeError")) {

      category = "RANGE_ERROR";

      rootCause =
        "Value exceeds allowed range or recursive loop.";

      suggestedFix =
        "Validate limits and recursive calls.";

    }

    //-------------------------------------------------------
    // Next.js
    //-------------------------------------------------------

    else if (

      error.message.includes("Next.js") ||

      error.message.includes("next/dist")

    ) {

      category = "NEXTJS";

      rootCause =
        "Next.js runtime/build issue.";

      suggestedFix =
        "Verify page exports, server/client components and Next configuration.";

    }

    //-------------------------------------------------------
    // Node
    //-------------------------------------------------------

    else if (

      error.message.includes("node:") ||

      error.message.includes("Node.js")

    ) {

      category = "NODE";

      rootCause =
        "Node.js runtime failure.";

      suggestedFix =
        "Check Node compatibility and package versions.";

    }

    //-------------------------------------------------------
    // Warning
    //-------------------------------------------------------

    if (

      error.message.toLowerCase().includes("warning")

    ) {

      buildBlocking = false;

    }

    return {

      ...error,

      category,

      rootCause,

      suggestedFix,

      buildBlocking

    };

  });

}
