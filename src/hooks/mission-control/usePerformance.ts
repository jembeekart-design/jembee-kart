"use client";

import { useCallback, useEffect, useState } from "react";

import { getPerformanceMetrics } from "@/lib/mission-control/api";
import { PerformanceMetrics } from "@/types/mission-control";

interface UsePerformanceReturn {
  data: PerformanceMetrics | null;
  loading: boolean;
  error: Error | null;
  refresh: () => Promise<void>;
  clearError: () => void;
}

export function usePerformance(): UsePerformanceReturn {
  const [data, setData] = useState<PerformanceMetrics | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const load = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await getPerformanceMetrics();

      setData(response);
    } catch (err) {
      const error =
        err instanceof Error
          ? err
          : new Error("Failed to load Performance Metrics");

      setError(error);
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
