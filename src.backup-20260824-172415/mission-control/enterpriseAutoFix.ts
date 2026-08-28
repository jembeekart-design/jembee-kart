import { fixHardcodedTheme } from "./autofix/themeAutoFix";
import { findHardcodedBusinessRules } from "./autofix/hardcodedRuleAutoFix";

export interface FixModuleResult {
  module: string;
  success: boolean;
  message: string;
  duration: number;
  fixedFiles?: number;
  fixedItems?: number;
  scannedFiles?: number;
  issues?: number;
}

export interface EnterpriseAutoFixReport {
  success: boolean;
  startedAt: string;
  finishedAt: string;
  totalDuration: number;
  totalModules: number;
  successModules: number;
  failedModules: number;
  modules: FixModuleResult[];
}

export class EnterpriseAutoFix {

  static async run(): Promise<EnterpriseAutoFixReport> {

    const started = Date.now();

    const modules: FixModuleResult[] = [];

    /* ===============================
       Theme Auto Fix
    ================================ */

    try {

      const t = Date.now();

      const result = await fixHardcodedTheme();

      modules.push({
        module: "Theme Auto Fix",
        success: true,
        message: "Completed",
        fixedFiles: result.modifiedFiles,
        fixedItems: result.totalReplacements,
        duration: Date.now() - t,
      });

    } catch (e: any) {

      modules.push({
        module: "Theme Auto Fix",
        success: false,
        message: e?.message ?? "Unknown Error",
        duration: 0,
      });

    }

    /* ===============================
       Business Rule Scan
    ================================ */

    try {

      const t = Date.now();

      const result =
        await findHardcodedBusinessRules();

      modules.push({

        module: "Business Rule Scanner",

        success: true,

        message:
          result.issueCount === 0
            ? "No Hardcoded Rules Found"
            : "Issues Found",

        scannedFiles: result.scannedFiles,

        issues: result.issueCount,

        duration: Date.now() - t,

      });

    } catch (e: any) {

      modules.push({

        module: "Business Rule Scanner",

        success: false,

        message: e?.message ?? "Unknown Error",

        duration: 0,

      });

    }

    const finished = Date.now();

    return {

      success: modules.every(m => m.success),

      startedAt: new Date(started).toISOString(),

      finishedAt: new Date(finished).toISOString(),

      totalDuration: finished - started,

      totalModules: modules.length,

      successModules: modules.filter(
        m => m.success
      ).length,

      failedModules: modules.filter(
        m => !m.success
      ).length,

      modules,

    };

  }

}
