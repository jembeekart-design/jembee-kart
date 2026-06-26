/**
 * ==========================================================
 * AI Error Analysis System
 * Dependency Analyzer
 * ==========================================================
 */

import fs from "node:fs";
import path from "node:path";
import { ParsedError } from "./buildLogParser";

export interface DependencyIssue extends ParsedError {

  imports: string[];

  missingImports: string[];

  unusedImports: string[];

  circularDependencies: string[];

  affectedFiles: string[];

  rootCause?: string;

  suggestedFix?: string;

}

const SRC_DIR = path.join(process.cwd(), "src");

export function analyzeDependencies(
  errors: ParsedError[]
): DependencyIssue[] {

  return errors.map(error => {

    const imports: string[] = [];

    const missingImports: string[] = [];

    const unusedImports: string[] = [];

    const circularDependencies: string[] = [];

    const affectedFiles: string[] = [];

    let rootCause = "Dependency looks valid.";

    let suggestedFix = "No action required.";

    //--------------------------------------------------------
    // File Exists
    //--------------------------------------------------------

    if (!error.file) {

      return {
        ...error,
        imports,
        missingImports,
        unusedImports,
        circularDependencies,
        affectedFiles,
        rootCause: "No source file found.",
        suggestedFix: "Unable to analyze dependency."
      };

    }

    const fullPath = path.join(SRC_DIR, error.file);

    if (!fs.existsSync(fullPath)) {

      return {

        ...error,

        imports,

        missingImports,

        unusedImports,

        circularDependencies,

        affectedFiles,

        rootCause: "Source file does not exist.",

        suggestedFix: "Check file path."

      };

    }

    //--------------------------------------------------------
    // Read File
    //--------------------------------------------------------

    const code = fs.readFileSync(fullPath, "utf8");

    //--------------------------------------------------------
    // Find Imports
    //--------------------------------------------------------

    const matches = code.matchAll(

      /import\s+.*?from\s+['"](.*?)['"]/g

    );

    for (const match of matches) {

      imports.push(match[1]);

    }

    //--------------------------------------------------------
    // Missing Module
    //--------------------------------------------------------

    if (

      error.message.includes("Cannot find module")

    ) {

      rootCause =

        "Imported module cannot be resolved.";

      suggestedFix =

        "Verify file path or tsconfig alias.";

      if (imports.length > 0) {

        missingImports.push(...imports);

      }

    }

    //--------------------------------------------------------
    // Circular Dependency
    //--------------------------------------------------------

    if (

      error.message.includes("Circular") ||

      error.message.includes("cycle")

    ) {

      rootCause =

        "Circular dependency detected.";

      suggestedFix =

        "Break dependency chain.";

      circularDependencies.push(...imports);

    }

    //--------------------------------------------------------
    // Unused Imports
    //--------------------------------------------------------

    for (const moduleName of imports) {

      const simpleName = moduleName.split("/").pop() || "";

      if (

        simpleName &&

        !code.includes(simpleName)

      ) {

        unusedImports.push(moduleName);

      }

    }

    //--------------------------------------------------------
    // Import Chain
    //--------------------------------------------------------

    affectedFiles.push(...imports);

    return {

      ...error,

      imports,

      missingImports,

      unusedImports,

      circularDependencies,

      affectedFiles,

      rootCause,

      suggestedFix

    };

  });

}
