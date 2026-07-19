"use client";

import { useCallback, useEffect, useState } from "react";

import { getActivityLogs } from "@/lib/mission-control/api";
import { ActivityLog } from "@/types/mission-control";

interface UseActivitiesReturn {
  data: ActivityLog[];
  loading: boolean;
  error: Error | null;
  refresh: () => Promise<void>;
}

export function useActivities(): UseActivitiesReturn {
  const [data, setData] = useState<ActivityLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const load = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await getActivityLogs();

      setData(response);
    } catch (err) {
      setError(
        err instanceof Error
          ? err
          : new Error("Failed to load Activity Logs")
      );

      setData([]);
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
