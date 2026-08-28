"use client";

import { useCallback, useEffect, useState } from "react";

import {
  getApiMonitor,
  retryApiEndpoint,
} from "@/lib/mission-control/api";

export interface ApiEndpoint {
  id: string;
  name: string;
  endpoint: string;
  method: "GET" | "POST" | "PUT" | "PATCH" | "DELETE";
  status: "healthy" | "warning" | "critical" | "offline";
  responseTime: number;
  lastChecked: string;
}

interface UseApiMonitorReturn {
  data: ApiEndpoint[];
  loading: boolean;
  actionLoading: boolean;
  error: Error | null;

  refresh: () => Promise<void>;

  retryEndpoint: (
    endpointId: string
  ) => Promise<void>;

  clearError: () => void;
}

export function useApiMonitor(): UseApiMonitorReturn {
  const [data, setData] = useState<ApiEndpoint[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] =
    useState(false);
  const [error, setError] = useState<Error | null>(null);

  const load = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await getApiMonitor();

      setData(response);
    } catch (err) {
      setError(
        err instanceof Error
          ? err
          : new Error("Failed to load API Monitor")
      );

      setData([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const retryEndpoint = useCallback(
    async (endpointId: string) => {
      try {
        setActionLoading(true);
        setError(null);

        await retryApiEndpoint(endpointId);

        await load();
      } catch (err) {
        setError(
          err instanceof Error
            ? err
            : new Error("Failed to retry API endpoint")
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
    retryEndpoint,
    clearError,
  };
}
