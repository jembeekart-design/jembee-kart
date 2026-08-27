"use client";

import { useCallback, useEffect, useState } from "react";

import { getScannerResults } from "@/lib/mission-control/api";
import { ScannerResult } from "@/types/mission-control";

interface UseScannerResultsReturn {
  data: ScannerResult[];
  loading: boolean;
  error: Error | null;
  refresh: () => Promise<void>;
}

export function useScannerResults(): UseScannerResultsReturn {
  const [data, setData] = useState<ScannerResult[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const load = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await getScannerResults();

      setData(response);
    } catch (err) {
      setError(
        err instanceof Error
          ? err
          : new Error("Failed to load Scanner Results")
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
