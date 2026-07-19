"use client";

import { useCallback, useState } from "react";

import {
  createBackup,
  rollbackProject,
  runAllScanners,
  runAutoFix,
} from "@/lib/mission-control/api";

interface AutomationResult {
  success: boolean;
  message?: string;
}

interface UseAutomationReturn {
  loading: boolean;
  error: Error | null;

  runScanners: () => Promise<AutomationResult>;
  autoFix: () => Promise<AutomationResult>;
  rollback: () => Promise<AutomationResult>;
  backup: () => Promise<AutomationResult>;

  clearError: () => void;
}

export function useAutomation(): UseAutomationReturn {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const execute = useCallback(
    async (
      action: () => Promise<AutomationResult>,
      defaultError: string
    ): Promise<AutomationResult> => {
      try {
        setLoading(true);
        setError(null);

        return await action();
      } catch (err) {
        const error =
          err instanceof Error
            ? err
            : new Error(defaultError);

        setError(error);

        return {
          success: false,
          message: error.message,
        };
      } finally {
        setLoading(false);
      }
    },
    []
  );

  const runScanners = useCallback(() => {
    return execute(
      () => runAllScanners(),
      "Failed to run scanners"
    );
  }, [execute]);

  const autoFix = useCallback(() => {
    return execute(
      () => runAutoFix(),
      "Failed to run auto fix"
    );
  }, [execute]);

  const rollback = useCallback(() => {
    return execute(
      () => rollbackProject(),
      "Failed to rollback project"
    );
  }, [execute]);

  const backup = useCallback(() => {
    return execute(
      () => createBackup(),
      "Failed to create backup"
    );
  }, [execute]);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  return {
    loading,
    error,

    runScanners,
    autoFix,
    rollback,
    backup,

    clearError,
  };
}
