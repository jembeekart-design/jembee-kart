"use client";

import { useCallback, useEffect, useState } from "react";

import { getErrorLogs } from "@/lib/mission-control/api";
import { ErrorLog } from "@/types/mission-control";

interface UseErrorLogsReturn {
  data: ErrorLog[];
  loading: boolean;
  error: Error | null;
  refresh: () => Promise<void>;
  clearError: () => void;
}

export function useErrorLogs(): UseErrorLogsReturn {
  const [data, setData] = useState<ErrorLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const load = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await getErrorLogs();

      setData(response);
    } catch (err) {
      const error =
        err instanceof Error
          ? err
          : new Error("Failed to load Error Logs");

      setError(error);

      setData([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  return {
    data,
    loading,
    error,
    refresh: load,
    clearError,
  };
}
