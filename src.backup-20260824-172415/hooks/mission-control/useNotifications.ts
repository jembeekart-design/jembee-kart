"use client";

import { useCallback, useEffect, useState } from "react";

import { getNotifications } from "@/lib/mission-control/api";
import { NotificationItem } from "@/types/mission-control";

interface UseNotificationsReturn {
  data: NotificationItem[];
  loading: boolean;
  error: Error | null;
  refresh: () => Promise<void>;
  clearError: () => void;
}

export function useNotifications(): UseNotificationsReturn {
  const [data, setData] = useState<NotificationItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const load = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await getNotifications();

      setData(response);
    } catch (err) {
      const error =
        err instanceof Error
          ? err
          : new Error("Failed to load Notifications");

      setError(error);
      setData([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  return {
    data,
    loading,
    error,
    refresh: load,
    clearError,
  };
}
