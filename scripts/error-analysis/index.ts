/**
 * ==========================================================
 * AI Error Analysis System
 * Main Controller
 * ==========================================================
 */

import fs from "node:fs";
import path from "node:path";

import { parseBuildLog } from "./buildLogParser";
import { analyzeTypeScript } from "./typescriptAnalyzer";
import { analyzeESLint } from "./eslintAnalyzer";
import { analyzeRuntime } from "./runtimeAnalyzer";
import { analyzeFirebase } from "./firebaseAnalyzer";
import { analyzeDependencies } from "./dependencyAnalyzer";
import { analyzeRootCause } from "./rootCauseAnalyzer";
import { generateFixSuggestions } from "./fixSuggestionEngine";
import { generateJsonReport } from "./reportGenerator";
import { generateMarkdownReport } from "./markdownGenerator";

const REPORT_DIR = path.join(process.cwd(), "reports");

function ensureReportDirectory() {
    if (!fs.existsSync(REPORT_DIR)) {
        fs.mkdirSync(REPORT_DIR, { recursive: true });
    }
}

async function runErrorAnalysis() {

    console.log("");
    console.log("==========================================");
    console.log(" JembeeKart AI Error Analysis Started");
    console.log("==========================================");
    console.log("");

    ensureReportDirectory();

    //-------------------------------------------------------
    // STEP 1
    //-------------------------------------------------------

    console.log("Reading Build Logs...");

    const buildErrors = parseBuildLog();

    //-------------------------------------------------------
    // STEP 2
    //-------------------------------------------------------

    console.log("Running TypeScript Analyzer...");

    const tsErrors = analyzeTypeScript(buildErrors);

    //-------------------------------------------------------
    // STEP 3
    //-------------------------------------------------------

    console.log("Running ESLint Analyzer...");

    const eslintErrors = analyzeESLint(buildErrors);

    //-------------------------------------------------------
    // STEP 4
    //-------------------------------------------------------

    console.log("Running Runtime Analyzer...");

    const runtimeErrors = analyzeRuntime(buildErrors);

    //-------------------------------------------------------
    // STEP 5
    //-------------------------------------------------------

    console.log("Running Firebase Analyzer...");

    const firebaseErrors = analyzeFirebase(buildErrors);

    //-------------------------------------------------------
    // STEP 6
    //-------------------------------------------------------

    const allErrors = [

        ...tsErrors,

        ...eslintErrors,

        ...runtimeErrors,

        ...firebaseErrors

    ];

    //-------------------------------------------------------
    // STEP 7
    //-------------------------------------------------------

    console.log("Analyzing Dependencies...");

    analyzeDependencies(allErrors);

    //-------------------------------------------------------
    // STEP 8
    //-------------------------------------------------------

    console.log("Finding Root Cause...");

    analyzeRootCause(allErrors);

    //-------------------------------------------------------
    // STEP 9
    //-------------------------------------------------------

    console.log("Generating Fix Suggestions...");

    generateFixSuggestions(allErrors);

    //-------------------------------------------------------
    // STEP 10
    //-------------------------------------------------------

    console.log("Generating Reports...");

    generateJsonReport(allErrors);

    generateMarkdownReport(allErrors);

    //-------------------------------------------------------
    // SUMMARY
    //-------------------------------------------------------

    const critical = allErrors.filter(
        e => e.severity === "CRITICAL"
    ).length;

    const high = allErrors.filter(
        e => e.severity === "HIGH"
    ).length;

    const medium = allErrors.filter(
        e => e.severity === "MEDIUM"
    ).length;

    const low = allErrors.filter(
        e => e.severity === "LOW"
    ).length;

    console.log("");
    console.log("==========================================");
    console.log(" AI Error Analysis Completed");
    console.log("==========================================");
    console.log("");

    console.table({
        Total: allErrors.length,
        Critical: critical,
        High: high,
        Medium: medium,
        Low: low
    });

    console.log("");

    console.log("Reports Generated:");

    console.log("reports/error-analysis.json");

    console.log("reports/error-analysis.md");

    console.log("");

}

runErrorAnalysis().catch((error) => {

    console.error("");

    console.error("AI Error Analysis Failed");

    console.error(error);

    process.exit(1);

});
