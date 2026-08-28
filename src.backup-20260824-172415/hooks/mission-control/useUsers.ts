"use client";

import { useCallback, useEffect, useState } from "react";

import {
  getAdminSessions,
  terminateAdminSession,
} from "@/lib/mission-control/api";

import { AdminSession } from "@/types/mission-control";

interface UseUsersReturn {
  data: AdminSession[];
  loading: boolean;
  actionLoading: boolean;
  error: Error | null;

  refresh: () => Promise<void>;

  terminateSession: (
    sessionId: string
  ) => Promise<void>;

  clearError: () => void;
}

export function useUsers(): UseUsersReturn {
  const [data, setData] = useState<AdminSession[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] =
    useState(false);
  const [error, setError] = useState<Error | null>(null);

  const load = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await getAdminSessions();

      setData(response);
    } catch (err) {
      setError(
        err instanceof Error
          ? err
          : new Error(
              "Failed to load Admin Sessions"
            )
      );

      setData([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const terminateSession = useCallback(
    async (sessionId: string) => {
      try {
        setActionLoading(true);
        setError(null);

        await terminateAdminSession(sessionId);

        await load();
      } catch (err) {
        setError(
          err instanceof Error
            ? err
            : new Error(
                "Failed to terminate Admin Session"
              )
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
    terminateSession,
    clearError,
  };
}
