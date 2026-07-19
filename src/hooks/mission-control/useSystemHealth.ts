"use client";

import { useCallback, useEffect, useState } from "react";

import { getSystemHealth } from "@/lib/mission-control/api";
import { SystemHealth } from "@/types/mission-control";

interface UseSystemHealthReturn {
  data: SystemHealth | null;
  loading: boolean;
  error: Error | null;
  refresh: () => Promise<void>;
}

export function useSystemHealth(): UseSystemHealthReturn {
  const [data, setData] = useState<SystemHealth | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const load = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await getSystemHealth();

      setData(response);
    } catch (err) {
      setError(
        err instanceof Error
          ? err
          : new Error("Failed to load System Health")
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  return {
    data,
    loading,
    error,
    refresh: load,
  };
}
