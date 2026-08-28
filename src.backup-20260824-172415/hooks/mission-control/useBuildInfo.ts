"use client";

import { useCallback, useEffect, useState } from "react";

import { getBuildInfo } from "@/lib/mission-control/api";
import { BuildInfo } from "@/types/mission-control";

interface UseBuildInfoReturn {
  data: BuildInfo | null;
  loading: boolean;
  error: Error | null;
  refresh: () => Promise<void>;
}

export function useBuildInfo(): UseBuildInfoReturn {
  const [data, setData] = useState<BuildInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const load = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await getBuildInfo();

      setData(response);
    } catch (err) {
      setError(
        err instanceof Error
          ? err
          : new Error("Failed to load Build Information")
      );

      setData(null);
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
