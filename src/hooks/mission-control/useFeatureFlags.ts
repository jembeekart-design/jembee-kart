"use client";

import { useCallback, useEffect, useState } from "react";

import {
  getFeatureFlags,
  updateFeatureFlag,
} from "@/lib/mission-control/api";
import { FeatureFlag } from "@/types/mission-control";

interface UseFeatureFlagsReturn {
  data: FeatureFlag[];
  loading: boolean;
  actionLoading: boolean;
  error: Error | null;

  refresh: () => Promise<void>;
  toggleFlag: (
    id: string,
    enabled: boolean
  ) => Promise<void>;

  clearError: () => void;
}

export function useFeatureFlags(): UseFeatureFlagsReturn {
  const [data, setData] = useState<FeatureFlag[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] =
    useState(false);
  const [error, setError] = useState<Error | null>(null);

  const load = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await getFeatureFlags();

      setData(response);
    } catch (err) {
      setError(
        err instanceof Error
          ? err
          : new Error("Failed to load Feature Flags")
      );

      setData([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const toggleFlag = useCallback(
    async (id: string, enabled: boolean) => {
      try {
        setActionLoading(true);
        setError(null);

        await updateFeatureFlag(id, enabled);

        await load();
      } catch (err) {
        setError(
          err instanceof Error
            ? err
            : new Error("Failed to update Feature Flag")
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
    toggleFlag,
    clearError,
  };
}
