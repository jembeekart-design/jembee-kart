import {
  fixHardcodedTheme,
  previewThemeFix,
  rollbackThemeFix,
} from "./autofix/themeAutoFix";

export interface MissionControlReport {
  success: boolean;
  startedAt: string;
  finishedAt: string;
  duration: number;

  scan: {
    scannedFiles: number;
    filesToModify: number;
  };

  fix: {
    modifiedFiles: number;
    totalReplacements: number;
  };

  rollback?: {
    restoredFiles: number;
  };

  report: any[];
}

export class MissionControl {

  static async preview() {
    return previewThemeFix();
  }

  static async autoFix(): Promise<MissionControlReport> {

    const start = Date.now();

    const preview = previewThemeFix();

    const fix = await fixHardcodedTheme();

    const end = Date.now();

    return {

      success: true,

      startedAt: new Date(start).toISOString(),

      finishedAt: new Date(end).toISOString(),

      duration: end - start,

      scan: {

        scannedFiles: preview.scannedFiles,

        filesToModify: preview.filesToModify,

      },

      fix: {

        modifiedFiles: fix.modifiedFiles,

        totalReplacements: fix.totalReplacements,

      },

      report: fix.report,

    };

  }

  static async rollback() {

    const result = rollbackThemeFix();

    return {

      success: result.success,

      restoredFiles: result.restoredFiles ?? 0,

      message:
        result.success
          ? "Rollback Completed"
          : result.message,

    };

  }

}
