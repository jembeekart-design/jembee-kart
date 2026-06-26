/**
 * ==========================================================
 * AI Error Analysis System
 * GitHub Annotation Parser
 * Parses GitHub Actions / TypeScript / ESLint annotations
 * ==========================================================
 */

import fs from "node:fs";
import path from "node:path";

export interface GitHubAnnotation {

    id: string;

    file: string;

    line: number;

    column: number;

    endLine?: number;

    endColumn?: number;

    severity: "CRITICAL" | "HIGH" | "MEDIUM" | "LOW";

    source:
        | "TYPESCRIPT"
        | "ESLINT"
        | "BUILD"
        | "RUNTIME"
        | "UNKNOWN";

    code: string;

    title: string;

    message: string;

    raw: string;

}

const REPORTS = path.join(
    process.cwd(),
    "reports"
);

const FILES = [

    "typescript.log",

    "eslint.log",

    "build.log"

];

export function parseGitHubAnnotations(): GitHubAnnotation[] {

    const annotations: GitHubAnnotation[] = [];

    let id = 1;

    for (const log of FILES) {

        const file = path.join(REPORTS, log);

        if (!fs.existsSync(file)) {

            continue;

        }

        const content = fs.readFileSync(
            file,
            "utf8"
        );

        const lines = content.split(/\r?\n/);

        for (const line of lines) {

            const parsed = parseLine(line);

            if (!parsed) continue;

            annotations.push({

                id: `ANN-${String(id).padStart(4, "0")}`,

                ...parsed

            });

            id++;

        }

    }

    return removeDuplicates(annotations);

}

function parseLine(
    line: string
): Omit<GitHubAnnotation, "id"> | null {

    /**
     * Matches:
     *
     * src/file.ts(90,19): error TS2353: message
     */

    const ts = line.match(

        /^(.+?)(\d+),(\d+):\s*error\s*(TS\d+):\s*(.+)$/i

    );

    if (ts) {

        return {

            file: ts[1],

            line: Number(ts[2]),

            column: Number(ts[3]),

            severity: "CRITICAL",

            source: "TYPESCRIPT",

            code: ts[4],

            title: "TypeScript Error",

            message: ts[5],

            raw: line

        };

    }

    /**
     * ESLint
     */

    const eslint = line.match(

        /^(.+?):(\d+):(\d+):\s*error\s*(.+?)\s*(.+)$/i

    );

    if (eslint) {

        return {

            file: eslint[1],

            line: Number(eslint[2]),

            column: Number(eslint[3]),

            severity: "HIGH",

            source: "ESLINT",

            code: eslint[5],

            title: "ESLint",

            message: eslint[4],

            raw: line

        };

    }

    /**
     * Generic Build Error
     */

    if (

        line.includes("Build failed") ||

        line.includes("Process completed with exit code")

    ) {

        return {

            file: "",

            line: 0,

            column: 0,

            severity: "HIGH",

            source: "BUILD",

            code: "BUILD",

            title: "Build Failed",

            message: line.trim(),

            raw: line

        };

    }

    return null;

}

function removeDuplicates(
    list: GitHubAnnotation[]
): GitHubAnnotation[] {

    const map = new Map<
        string,
        GitHubAnnotation
    >();

    for (const item of list) {

        const key = [

            item.file,

            item.line,

            item.column,

            item.code,

            item.message

        ].join("|");

        if (!map.has(key)) {

            map.set(key, item);

        }

    }

    return [...map.values()];

}

export function annotationSummary(
    annotations: GitHubAnnotation[]
) {

    const summary = {

        total: annotations.length,

        critical: 0,

        high: 0,

        medium: 0,

        low: 0,

        byCode: {} as Record<string, number>

    };

    for (const item of annotations) {

        switch (item.severity) {

            case "CRITICAL":

                summary.critical++;

                break;

            case "HIGH":

                summary.high++;

                break;

            case "MEDIUM":

                summary.medium++;

                break;

            case "LOW":

                summary.low++;

                break;

        }

        summary.byCode[item.code] =

            (summary.byCode[item.code] || 0) + 1;

    }

    return summary;

}
