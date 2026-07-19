"use client";

import { useCallback, useEffect, useState } from "react";

import { getMissionSummary } from "@/lib/mission-control/api";
import { MissionSummary } from "@/types/mission-control";

interface UseMissionSummaryReturn {
  data: MissionSummary | null;
  loading: boolean;
  error: Error | null;
  refresh: () => Promise<void>;
}

export function useMissionSummary(): UseMissionSummaryReturn {
  const [data, setData] = useState<MissionSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const load = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await getMissionSummary();

      setData(response);
    } catch (err) {
      setError(
        err instanceof Error
          ? err
          : new Error("Failed to load Mission Summary")
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
