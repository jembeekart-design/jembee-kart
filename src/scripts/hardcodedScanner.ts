import fs from "fs";
import path from "path";
import crypto from "crypto";

// ==========================================
// 1. ENTERPRISE ARCHITECTURAL CONFIGURATION
// ==========================================
const ENGINE_CONFIG = {
  scanRoot: path.join(process.cwd(), "src"),
  reportOutput: "hardcoded-governance-report.json",
  cacheSnapshot: ".governance-cache.json",
  exclusions: new Set([".next", ".git", "node_modules", "dist", "coverage", ".theme-backup"]),
  supportedExtensions: new Set([".ts", ".tsx"]),
  chunkSize: 15 // Stream pipeline threshold for large directory handling
};

// ==========================================
// 2. STRICT TYPE DEFINITIONS & SCHEMAS
// ==========================================
interface GovernanceIssue {
  id: string;              // Deterministic SHA-256 fingerprint
  file: string;            // Absolute normalized workspace path
  ruleName: string;        // Triggered pattern ID
  line: number;            // 1-indexed target line
  column: number;          // 1-indexed string sequence start match
  matchedValue: string;    // Raw un-stripped hardcoded trace
  extractedValue: string;  // Sanitized config value ready for Firestore ingestion
  severity: "Critical" | "High" | "Medium" | "Low";
  governanceCategory: string;
  firestoreCollection: string;
  adminSection: string;
  remediation: {
    fixedCode: string;
    suggestion: string;
    isAutoFixable: boolean;
  };
  contextTrace: string;    // Captured context string for UI reporting previews
}

interface PerformanceMetric {
  totalFilesScanned: number;
  cacheHits: number;
  executionTimeMs: number;
  engineThroughputFilesPerSec: number;
}

// ==========================================
// 3. CORE FILTERING ENGINE MATRICES
// ==========================================
const UI_ENGINE_PATTERNS = [/className\s*=/, /max-w-\[/, /min-w-\[/, /w-\[/, /h-\[/, /rounded-/, /text-/, /bg-/, /border-/, /gap-/, /flex\b/, /grid\b/, /justify-/, /items-/, /p[xy]?-\d+/, /m[xy]?-\d+/];
const PROGRAMMING_INFRA_PATTERNS = [/success\s*:/, /loading\s*:/, /blocked\s*:/, /enabled\s*:/, /disabled\s*:/, /isOpen/, /isLoading/, /console\.(log|error|warn|info)/, /return\s+/, /useState\s*\(/, /useEffect\s*\(/, /useCallback\s*\(/];
const BUSINESS_LOGIC_KEYWORDS = ["commission", "cashback", "discount", "reward", "watch", "withdraw", "wallet", "gst", "shipping", "coin", "loyalty", "affiliate", "bonus", "profit", "seller", "referral"];

const CORE_REGEXP_RULES = [
  { name: "Hardcoded Percentage", regex: /\b\d+\s*%/g, severity: "Critical" as const },
  { name: "Hardcoded Currency", regex: /₹\s*\d+(?:\.\d+)?(?:\s*(?:L|K|Cr|Crore|Lakh))?/gi, severity: "High" as const },
  { name: "Hardcoded Boolean", regex: /(?:=|:)\s*(true|false)\b/g, severity: "Medium" as const },
  { name: "Hardcoded Number", regex: /(?:>=|<=|=|:|>|<)\s*-?\d+(?:\.\d+)?/g, severity: "Low" as const }
];

// ==========================================
// 4. GOVERNANCE KERNEL IMPLEMENTATION
// ==========================================
class GovernanceEngineSuite {
  private activeCache: Record<string, string> = {};
  private runtimeRegistry: GovernanceIssue[] = [];
  private scannedFilePaths: string[] = [];
  private cacheHitsCounter = 0;

  constructor() {
    this.hydrateCache();
  }

  private hydrateCache() {
    try {
      if (fs.existsSync(ENGINE_CONFIG.cacheSnapshot)) {
        this.activeCache = JSON.parse(fs.readFileSync(ENGINE_CONFIG.cacheSnapshot, "utf8"));
      }
    } catch {
      this.activeCache = {};
    }
  }

  private persistCache() {
    try {
      fs.writeFileSync(ENGINE_CONFIG.cacheSnapshot, JSON.stringify(this.activeCache, null, 2), "utf8");
    } catch (e) {
      console.error("⚠️ [Cache Warning] Failed to sync incremental cache layout.");
    }
  }

  private computeDeterministicId(filePath: string, line: number, rule: string, targetVal: string): string {
    return crypto
      .createHash("sha256")
      .update(`${filePath}:${line}:${rule}:${targetVal}`)
      .digest("hex")
      .slice(0, 16);
  }

  private isolateMetadata(ruleName: string) {
    switch (ruleName) {
      case "Hardcoded Percentage":
        return { cat: "Business Rules", coll: "businessRules", section: "Business Rules Dashboard", code: "const rules = await businessRules.get();", text: "Externalize hardcoded percentages into businessRules Firestore structure." };
      case "Hardcoded Currency":
        return { cat: "Business Rules", coll: "walletSettings", section: "Wallet Settings Configuration", code: "const walletConfigs = await walletSettings.get();", text: "Migrate hardcoded fiat/currency modifiers to global wallet settings backend orchestration." };
      case "Hardcoded Boolean":
        return { cat: "Feature Flags", coll: "featureFlags", section: "Dynamic Feature Flags Toggle Panel", code: "const flags = await featureFlags.get();", text: "Abstract state flags into hot-swappable enterprise feature flagging collections." };
      default:
        return { cat: "Business Configuration", coll: "systemSettings", section: "Global Administration Settings", code: "const platformConfig = await systemSettings.get();", text: "Map static platform parameters to centralized dynamic variable engine config handlers." };
    }
  }

  private isLineGarbageNoise(line: string): boolean {
    return UI_ENGINE_PATTERNS.some(pat => pat.test(line)) || PROGRAMMING_INFRA_PATTERNS.some(pat => pat.test(line));
  }

  private executionPipeline(dir: string) {
    const streamRegistry = fs.readdirSync(dir, { withFileTypes: true });
    
    for (const element of streamRegistry) {
      const resolvedPath = path.join(dir, element.name);
      
      if (element.isDirectory()) {
        if (ENGINE_CONFIG.exclusions.has(element.name)) continue;
        this.executionPipeline(resolvedPath);
      } else {
        const fileExt = path.extname(element.name);
        if (ENGINE_CONFIG.supportedExtensions.has(fileExt)) {
          this.scannedFilePaths.push(resolvedPath);
        }
      }
    }
  }

  private parseFileKernel(filePath: string) {
    try {
      const bufferedContent = fs.readFileSync(filePath, "utf8");
      const computedHash = crypto.createHash("md5").update(bufferedContent).digest("hex");
      const relativeWorkspacePath = filePath.replace(process.cwd(), "");

      // Incremental Analyzer Core
      if (this.activeCache[relativeWorkspacePath] === computedHash) {
        this.cacheHitsCounter++;
        return;
      }
      this.activeCache[relativeWorkspacePath] = computedHash;

      const lines = bufferedContent.split(/\r?\n/);
      for (let i = 0; i < lines.length; i++) {
        const rawLine = lines[i];
        const normalizedLine = rawLine.trim();

        // High-Speed Early Exclusions Guard Check
        if (!normalizedLine || normalizedLine.startsWith("//") || normalizedLine.startsWith("*") || normalizedLine.startsWith("/*")) continue;
        if (this.isLineGarbageNoise(normalizedLine)) continue;
        if (!BUSINESS_LOGIC_KEYWORDS.some(keyword => normalizedLine.toLowerCase().includes(keyword))) continue;

        // Pattern Rule Matching Core
        for (const rule of CORE_REGEXP_RULES) {
          rule.regex.lastIndex = 0;
          const engineMatches = [...normalizedLine.matchAll(rule.regex)];

          for (const match of engineMatches) {
            const indexValue = match.index ?? 0;
            const absoluteMatchValue = match[0];
            const cleanExtractedVal = rule.name === "Hardcoded Number" 
              ? absoluteMatchValue.replace(/^(?:>=|<=|=|:|>|<)\s*/, "").trim() 
              : absoluteMatchValue.trim();

            const meta = this.isolateMetadata(rule.name);
            const generationId = this.computeDeterministicId(relativeWorkspacePath, i + 1, rule.name, absoluteMatchValue);

            this.runtimeRegistry.push({
              id: `GOV-${generationId}`,
              file: relativeWorkspacePath,
              ruleName: rule.name,
              line: i + 1,
              column: indexValue + 1,
              matchedValue: absoluteMatchValue,
              extractedValue: cleanExtractedVal,
              severity: rule.severity,
              governanceCategory: meta.cat,
              firestoreCollection: meta.coll,
              adminSection: meta.section,
              remediation: {
                fixedCode: meta.code,
                suggestion: meta.text,
                isAutoFixable: rule.name !== "Hardcoded Number"
              },
              contextTrace: normalizedLine
            });
          }
        }
      }
    } catch (fsError) {
      console.error(`❌ [IO Core Sandbox Panic] Exception captured during stream reading on target: ${filePath}`);
    }
  }

  public bootstrapper() {
    const launchClock = Date.now();
    console.log("==========================================================================");
    console.log("🛰️ INITIALIZING ENTERPRISE HARDCODED GOVERNANCE SUITE COMPILER CORE KERNEL v10");
    console.log("==========================================================================");

    this.executionPipeline(ENGINE_CONFIG.scanRoot);
    
    // Core Chunk processing execution emulation
    this.scannedFilePaths.forEach(file => this.parseFileKernel(file));

    // Sort outputs deterministically by filename tracking logic sequence
    this.runtimeRegistry.sort((a, b) => a.file.localeCompare(b.file) || a.line - b.line || a.column - b.column);

    const runtimeStopClock = Date.now() - launchClock;
    this.persistCache();

    const performanceMetrics: PerformanceMetric = {
      totalFilesScanned: this.scannedFilePaths.length,
      cacheHits: this.cacheHitsCounter,
      executionTimeMs: runtimeStopClock,
      engineThroughputFilesPerSec: Math.round((this.scannedFilePaths.length / (runtimeStopClock / 1000 || 1)))
    };

    const aggregatedPayload = {
      auditSuiteMetadata: {
        engineSignature: "Jembee Autonomous Compliance Engine Engine Platform V10",
        compiledAt: new Date().toISOString(),
        configurationSnapshot: ENGINE_CONFIG
      },
      performanceProfilingMetrics: performanceMetrics,
      auditReportSummary: {
        totalViolationsIdentified: this.runtimeRegistry.length,
        autoFixableCount: this.runtimeRegistry.filter(issue => issue.remediation.isAutoFixable).length,
        manualReviewRequiredCount: this.runtimeRegistry.filter(issue => !issue.remediation.isAutoFixable).length,
        severityDistribution: {
          Critical: this.runtimeRegistry.filter(x => x.severity === "Critical").length,
          High: this.runtimeRegistry.filter(x => x.severity === "High").length,
          Medium: this.runtimeRegistry.filter(x => x.severity === "Medium").length,
          Low: this.runtimeRegistry.filter(x => x.severity === "Low").length
        }
      },
      findings: this.runtimeRegistry
    };

    fs.writeFileSync(ENGINE_CONFIG.reportOutput, JSON.stringify(aggregatedPayload, null, 2), "utf8");

    console.log("\n==========================================================================");
    console.log("🏁 GOVERNANCE ENGINE COMPILE COMPLETED SUCCESSFULLY");
    console.log("==========================================================================");
    console.log(`📊 Scanned Files Count  : ${performanceMetrics.totalFilesScanned} (⚡ Cache Hits: ${performanceMetrics.cacheHits})`);
    console.log(`🛑 Total Code Flaws     : ${aggregatedPayload.auditReportSummary.totalViolationsIdentified}`);
    console.log(`🛡️ Critical Security    : ${aggregatedPayload.auditReportSummary.severityDistribution.Critical}`);
    console.log(`🤖 Auto Fixable Patches : ${aggregatedPayload.auditReportSummary.autoFixableCount}`);
    console.log(`⏱️ Engine Execution Time : ${performanceMetrics.executionTimeMs} ms`);
    console.log(`📂 Saved Audit Output   : ${ENGINE_CONFIG.reportOutput}`);
    console.log("==========================================================================\n");
  }
}

// Instantiate engine initialization vector sequence runner execution pipeline
new GovernanceEngineSuite().bootstrapper();
