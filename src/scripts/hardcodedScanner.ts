import fs from "fs";
import path from "path";
import crypto from "crypto";

const ROOT = path.join(process.cwd(), "src");
const startedAt = Date.now();
const scannedFiles = new Set<string>();

const SKIP_DIRS = new Set([
  ".next", ".git", "node_modules", "dist", "coverage", ".theme-backup",
]);

type HardcodedIssue = {
  id: string;
  file: string;
  issue: string;
  line: number;
  column: number;
  currentCode: string;
  matchedValue: string;
  fixedCode: string;
  suggestion: string;
  autoFix: boolean;
  patchId: string;
  severity: "Critical" | "High" | "Medium" | "Low";
  confidence: number;
  governanceCategory: string;
  firestoreCollection: string;
  adminSection: string;
};

const PATTERNS = [
  { name: "Hardcoded Percentage", regex: /\b\d+\s*%/g },
  { name: "Hardcoded Currency", regex: /₹\s*\d+(?:\.\d+)?(?:\s*(?:L|K|Cr|Crore|Lakh))?/gi },
  { name: "Hardcoded Boolean", regex: /(?:=|:)\s*(true|false)\b/g },
  { name: "Hardcoded Number", regex: /(?:>=|<=|=|:|>|<)\s*-?\d+(?:\.\d+)?/g },
];

const results: HardcodedIssue[] = [];
const needsBusinessContext = ["Hardcoded Number", "Hardcoded Currency"];

// Config
const BUSINESS_KEYWORDS = ["commission", "cashback", "reward", "wallet", "withdraw", "withdrawal", "bonus", "earning", "income", "profit", "referral", "level", "rank", "seller", "delivery", "shipping", "gst", "tax", "coin", "points", "watch", "video", "premium", "subscription", "membership", "businessrules", "featureflags", "rewardamount", "minimumwithdrawal", "cashbackpercent", "commissionpercent"];
const IGNORE_KEYWORDS = ["width", "height", "maxWidth", "minWidth", "maxHeight", "minHeight", "padding", "margin", "gap", "spacing", "fontSize", "lineHeight", "borderRadius", "opacity", "zIndex", "duration", "delay", "timeout", "transition", "animate", "animation", "rotate", "translate", "scale", "flex", "grid", "className", "style=", "style{{"];
const IGNORE_STRING_PATTERNS = [/withdraw request/i, /lakh/i, /crore/i, /offer/i, /sale/i, /discount/i, /placeholder/i, /example/i, /sample/i, /demo/i, /welcome/i, /congratulations/i];

function isBusinessRule(line: string): boolean {
  return BUSINESS_KEYWORDS.some(k => line.toLowerCase().includes(k));
}

function isUIRule(line: string): boolean {
  const lower = line.toLowerCase();
  return IGNORE_KEYWORDS.some(k => lower.includes(k)) || lower.includes("bg-") || lower.includes("text-") || lower.includes("border-") || lower.includes("shadow");
}

function isProgrammingConstant(line: string): boolean {
  const lower = line.toLowerCase();
  return ["usestate", "setstate", "setloading", "setopen", "setvalue", "index", "currentindex", "page", "currentpage", "router", "pathname"].some(k => lower.includes(k));
}

function isDisplayString(line: string): boolean {
  const isStringLiteral = line.includes('"') || line.includes("'") || line.includes("`");
  if (!isStringLiteral) return false;
  return IGNORE_STRING_PATTERNS.some((pattern) => pattern.test(line));
}

function cleanMatchedValue(val: string): string {
  return val.replace(/^(?:>=|<=|=|:|>|<)\s*/, "");
}

function getSeverity(name: string): "Critical" | "High" | "Medium" | "Low" {
  switch (name) {
    case "Hardcoded Percentage": return "Critical";
    case "Hardcoded Currency": return "High";
    case "Hardcoded Boolean": return "Medium";
    default: return "Low";
  }
}

function getConfidence(issue: string): number {
  switch (issue) {
    case "Hardcoded Percentage": return 0.99;
    case "Hardcoded Currency": return 0.97;
    case "Hardcoded Boolean": return 0.95;
    default: return 0.75;
  }
}

function getGovernanceCategory(name: string): string {
  if (name.includes("Percentage") || name.includes("Currency")) return "Business Rules";
  if (name.includes("Boolean")) return "Feature Flags";
  return "Business Configuration";
}

function getFirestoreCollection(issue: string) {
  switch (issue) {
    case "Hardcoded Percentage": return "businessRules";
    case "Hardcoded Currency": return "walletSettings";
    case "Hardcoded Boolean": return "featureFlags";
    default: return "systemSettings";
  }
}

function getAdminSection(issue: string) {
  switch (issue) {
    case "Hardcoded Percentage": return "Business Rules";
    case "Hardcoded Currency": return "Wallet Settings";
    case "Hardcoded Boolean": return "Feature Flags";
    default: return "Global Settings";
  }
}

function getFix(issue: string) {
  switch (issue) {
    case "Hardcoded Percentage": return { fixedCode: "const rules = await businessRules.get();", suggestion: "Move to Firestore Business Rules.", autoFix: true };
    case "Hardcoded Currency": return { fixedCode: "const rules = await businessRules.get();", suggestion: "Move to Firestore Wallet Settings.", autoFix: true };
    case "Hardcoded Boolean": return { fixedCode: "const flags = await featureFlags.get();", suggestion: "Replace with Firestore Feature Flag.", autoFix: true };
    default: return { fixedCode: "const rules = await businessRules.get();", suggestion: "Move to Firestore configuration.", autoFix: false };
  }
}

function createId(prefix: string): string { return `${prefix}-${crypto.randomUUID()}`; }

function scan(dir: string) {
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      if (SKIP_DIRS.has(entry.name)) continue;
      scan(fullPath);
      continue;
    }
    
    if (fullPath.endsWith(".ts") || fullPath.endsWith(".tsx")) {
      scannedFiles.add(fullPath.replace(process.cwd(), ""));
    } else {
      continue;
    }

    let content = "";
    try {
      content = fs.readFileSync(fullPath, "utf8");
    } catch (error) { 
      console.error(`Failed to read ${fullPath}`, error);
      continue; 
    }

    const lines = content.split(/\r?\n/);
    for (let lineIndex = 0; lineIndex < lines.length; lineIndex++) {
      const currentLine = lines[lineIndex].trim();
      if (!currentLine || currentLine.startsWith("//") || currentLine.startsWith("/*")) continue;
      
      if (isUIRule(currentLine) || isProgrammingConstant(currentLine) || isDisplayString(currentLine)) {
        continue;
      }

      for (const pattern of PATTERNS) {
        pattern.regex.lastIndex = 0;
        const matches = [...currentLine.matchAll(pattern.regex)];
        for (const match of matches) {
          // Context-aware filtering
          if (needsBusinessContext.includes(pattern.name) && !isBusinessRule(currentLine)) continue;
          
          const id = createId("HC");
          const fix = getFix(pattern.name);
          const cleanValue = pattern.name === "Hardcoded Number" ? cleanMatchedValue(match[0]) : match[0];
          
          results.push({
            id, file: fullPath.replace(process.cwd(), ""), issue: pattern.name,
            line: lineIndex + 1, column: (match.index ?? 0) + 1, currentCode: currentLine,
            matchedValue: cleanValue, fixedCode: fix.fixedCode, suggestion: fix.suggestion,
            autoFix: fix.autoFix, patchId: id, severity: getSeverity(pattern.name),
            confidence: getConfidence(pattern.name), governanceCategory: getGovernanceCategory(pattern.name),
            firestoreCollection: getFirestoreCollection(pattern.name), adminSection: getAdminSection(pattern.name)
          });
        }
      }
    }
  }
}

// Execution
scan(ROOT);

const uniqueResults = Array.from(new Map(results.map(i => [`${i.file}:${i.line}:${i.column}:${i.issue}:${i.matchedValue}`, i])).values());
uniqueResults.sort((a, b) => a.file.localeCompare(b.file) || a.line - b.line || a.column - b.column);

const statistics = { 
  totalIssues: uniqueResults.length, 
  autoFixable: uniqueResults.filter(x => x.autoFix).length,
  manualFix: uniqueResults.filter(x => !x.autoFix).length,
  scannedFiles: scannedFiles.size,
  durationMs: Date.now() - startedAt
};

const severitySummary = { Critical: uniqueResults.filter(x => x.severity === "Critical").length, High: uniqueResults.filter(x => x.severity === "High").length, Medium: uniqueResults.filter(x => x.severity === "Medium").length, Low: uniqueResults.filter(x => x.severity === "Low").length };
const governanceSummary = { businessRules: uniqueResults.filter(x => x.governanceCategory === "Business Rules").length, featureFlags: uniqueResults.filter(x => x.governanceCategory === "Feature Flags").length, configuration: uniqueResults.filter(x => x.governanceCategory === "Business Configuration").length };

const report = {
  generatedAt: new Date().toISOString(),
  scanner: "Jembee Governance Hardcoded Scanner",
  version: "3.9.2",
  root: ROOT,
  summary: { ...statistics, severity: severitySummary, governance: governanceSummary },
  issues: uniqueResults
};

fs.writeFileSync(path.join(process.cwd(), "hardcoded-report.json"), JSON.stringify(report, null, 2), "utf8");

// Output
console.log("==================================");
console.log("AI Governance Scan Finished (v3.9.2)");
console.log("==================================");
console.log(`Total Issues   : ${statistics.totalIssues}`);
console.log(`Auto Fixable   : ${statistics.autoFixable}`);
console.log(`Manual Fix     : ${statistics.manualFix}`);
console.log(`Files Scanned  : ${statistics.scannedFiles}`);
console.log(`Duration       : ${statistics.durationMs} ms`);
console.log(`Critical       : ${severitySummary.Critical}`);
console.log("Report Saved   : hardcoded-report.json");
console.log("==================================");
