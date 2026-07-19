"use client";

import { useCallback, useEffect, useState } from "react";

import { getReports } from "@/lib/mission-control/api";
import { ReportItem } from "@/types/mission-control";

interface UseReportsReturn {
  data: ReportItem[];
  loading: boolean;
  error: Error | null;
  refresh: () => Promise<void>;
}

export function useReports(): UseReportsReturn {
  const [data, setData] = useState<ReportItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const load = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await getReports();

      setData(response);
    } catch (err) {
      setError(
        err instanceof Error
          ? err
          : new Error("Failed to load Reports")
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
