"use client";

import { useCallback, useEffect, useRef, useState } from "react";

import { getRealtimeStatus } from "@/lib/mission-control/api";
import { SystemHealth } from "@/types/mission-control";

interface UseRealtimeReturn {
  data: SystemHealth | null;
  loading: boolean;
  connected: boolean;
  error: Error | null;

  refresh: () => Promise<void>;
  start: () => void;
  stop: () => void;
  clearError: () => void;
}

const DEFAULT_INTERVAL = 10000;

export function useRealtime(
  interval = DEFAULT_INTERVAL
): UseRealtimeReturn {
  const [data, setData] = useState<SystemHealth | null>(null);
  const [loading, setLoading] = useState(true);
  const [connected, setConnected] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const load = useCallback(async () => {
    try {
      setError(null);

      const response = await getRealtimeStatus();

      setData(response);
      setConnected(true);
    } catch (err) {
      setConnected(false);

      setError(
        err instanceof Error
          ? err
          : new Error("Failed to fetch realtime status")
      );
    } finally {
      setLoading(false);
    }
  }, []);

  const stop = useCallback(() => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }

    setConnected(false);
  }, []);

  const start = useCallback(() => {
    stop();

    load();

    timerRef.current = setInterval(() => {
      load();
    }, interval);
  }, [interval, load, stop]);

  useEffect(() => {
    start();

    return () => {
      stop();
    };
  }, [start, stop]);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  return {
    data,
    loading,
    connected,
    error,
    refresh: load,
    start,
    stop,
    clearError,
  };
}
