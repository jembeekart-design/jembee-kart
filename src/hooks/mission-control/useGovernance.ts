"use client";

import { useCallback, useEffect, useState } from "react";

import { getGovernanceReport } from "@/lib/mission-control/api";
import { GovernanceReport } from "@/types/mission-control";

interface UseGovernanceReturn {
  data: GovernanceReport | null;
  loading: boolean;
  error: Error | null;
  refresh: () => Promise<void>;
}

export function useGovernance(): UseGovernanceReturn {
  const [data, setData] = useState<GovernanceReport | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const load = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await getGovernanceReport();

      setData(response);
    } catch (err) {
      setError(
        err instanceof Error
          ? err
          : new Error("Failed to load Governance Report")
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
