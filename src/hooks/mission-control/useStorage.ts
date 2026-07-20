"use client";

import { useCallback, useEffect, useState } from "react";

import { getStorageInfo } from "@/lib/mission-control/api";
import { StorageInfo } from "@/types/mission-control";

interface UseStorageReturn {
  data: StorageInfo | null;
  loading: boolean;
  error: Error | null;

  refresh: () => Promise<void>;
  clearError: () => void;
}

export function useStorage(): UseStorageReturn {
  const [data, setData] = useState<StorageInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const load = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await getStorageInfo();

      setData(response);
    } catch (err) {
      setError(
        err instanceof Error
          ? err
          : new Error("Failed to load Storage Information")
      );

      setData(null);
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
