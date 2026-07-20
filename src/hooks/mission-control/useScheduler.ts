"use client";

import { useCallback, useEffect, useState } from "react";

import {
  getSchedulerJobs,
  runSchedulerJob,
  toggleSchedulerJob,
} from "@/lib/mission-control/api";

export interface SchedulerJob {
  id: string;
  name: string;
  description: string;
  enabled: boolean;
  status: "idle" | "running" | "failed" | "completed";
  lastRun?: string;
  nextRun?: string;
}

interface UseSchedulerReturn {
  data: SchedulerJob[];
  loading: boolean;
  actionLoading: boolean;
  error: Error | null;

  refresh: () => Promise<void>;

  runJob: (jobId: string) => Promise<void>;

  toggleJob: (
    jobId: string,
    enabled: boolean
  ) => Promise<void>;

  clearError: () => void;
}

export function useScheduler(): UseSchedulerReturn {
  const [data, setData] = useState<SchedulerJob[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] =
    useState(false);
  const [error, setError] = useState<Error | null>(null);

  const load = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const jobs = await getSchedulerJobs();

      setData(jobs);
    } catch (err) {
      setError(
        err instanceof Error
          ? err
          : new Error("Failed to load Scheduler Jobs")
      );

      setData([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const runJob = useCallback(
    async (jobId: string) => {
      try {
        setActionLoading(true);
        setError(null);

        await runSchedulerJob(jobId);

        await load();
      } catch (err) {
        setError(
          err instanceof Error
            ? err
            : new Error("Failed to run Scheduler Job")
        );
      } finally {
        setActionLoading(false);
      }
    },
    [load]
  );

  const toggleJob = useCallback(
    async (
      jobId: string,
      enabled: boolean
    ) => {
      try {
        setActionLoading(true);
        setError(null);

        await toggleSchedulerJob(
          jobId,
          enabled
        );

        await load();
      } catch (err) {
        setError(
          err instanceof Error
            ? err
            : new Error("Failed to update Scheduler Job")
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
    runJob,
    toggleJob,
    clearError,
  };
}
