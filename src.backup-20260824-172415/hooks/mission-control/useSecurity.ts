"use client";

import { useCallback, useEffect, useState } from "react";

import {
  getSecurityEvents,
  resolveSecurityEvent,
} from "@/lib/mission-control/api";

import { SecurityEvent } from "@/types/mission-control";

interface UseSecurityReturn {
  data: SecurityEvent[];
  loading: boolean;
  actionLoading: boolean;
  error: Error | null;

  refresh: () => Promise<void>;

  resolveEvent: (
    eventId: string
  ) => Promise<void>;

  clearError: () => void;
}

export function useSecurity(): UseSecurityReturn {
  const [data, setData] = useState<SecurityEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] =
    useState(false);
  const [error, setError] = useState<Error | null>(null);

  const load = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const response =
        await getSecurityEvents();

      setData(response);
    } catch (err) {
      setError(
        err instanceof Error
          ? err
          : new Error(
              "Failed to load Security Events"
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

  const resolveEvent = useCallback(
    async (eventId: string) => {
      try {
        setActionLoading(true);
        setError(null);

        await resolveSecurityEvent(eventId);

        await load();
      } catch (err) {
        setError(
          err instanceof Error
            ? err
            : new Error(
                "Failed to resolve Security Event"
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
    resolveEvent,
    clearError,
  };
}
