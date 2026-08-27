"use client";

import { useCallback, useEffect, useState } from "react";

import {
  createBackup,
  getBackups,
  restoreBackup,
} from "@/lib/mission-control/api";
import { BackupInfo } from "@/types/mission-control";

interface UseBackupReturn {
  data: BackupInfo[];
  loading: boolean;
  actionLoading: boolean;
  error: Error | null;

  refresh: () => Promise<void>;
  backup: () => Promise<void>;
  restore: (backupId: string) => Promise<void>;
  clearError: () => void;
}

export function useBackup(): UseBackupReturn {
  const [data, setData] = useState<BackupInfo[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const load = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await getBackups();

      setData(response);
    } catch (err) {
      setError(
        err instanceof Error
          ? err
          : new Error("Failed to load backups")
      );

      setData([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const backup = useCallback(async () => {
    try {
      setActionLoading(true);
      setError(null);

      await createBackup();

      await load();
    } catch (err) {
      setError(
        err instanceof Error
          ? err
          : new Error("Failed to create backup")
      );
    } finally {
      setActionLoading(false);
    }
  }, [load]);

  const restore = useCallback(
    async (backupId: string) => {
      try {
        setActionLoading(true);
        setError(null);

        await restoreBackup(backupId);

        await load();
      } catch (err) {
        setError(
          err instanceof Error
            ? err
            : new Error("Failed to restore backup")
        );
      } finally {
        setActionLoading(false);
      }
    },
    [load]
  );

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  return {
    data,
    loading,
    actionLoading,
    error,
    refresh: load,
    backup,
    restore,
    clearError,
  };
}
