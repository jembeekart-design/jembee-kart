'use client';

import { useEffect, useCallback, useRef } from 'react';
import { useFirestoreListener } from './useFirestoreListener';

interface RealtimeOptions {
  debounceMs?: number;
  onUpdate?: (data: any[]) => void;
}

export function useRealtimeUpdates(
  collectionName: string,
  filters?: Array<{ field: string; operator: string; value: any }>,
  options?: RealtimeOptions
) {
  const debounceTimerRef = useRef<NodeJS.Timeout | null>(null);
  const { data, loading, error } = useFirestoreListener(
    collectionName,
    filters,
    { orderByField: 'updatedAt', orderByDirection: 'desc' }
  );

  useEffect(() => {
    if (options?.onUpdate && data) {
      if (options.debounceMs) {
        if (debounceTimerRef.current) {
          clearTimeout(debounceTimerRef.current);
        }

        debounceTimerRef.current = setTimeout(() => {
          options.onUpdate(data);
        }, options.debounceMs);
      } else {
        options.onUpdate(data);
      }
    }

    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
    };
  }, [data, options]);

  return { data, loading, error };
}
