"use client";

import { useCallback, useEffect, useState } from "react";

import {
  getDeployments,
  redeployProject,
} from "@/lib/mission-control/api";
import { DeploymentInfo } from "@/types/mission-control";

interface UseDeploymentReturn {
  data: DeploymentInfo[];
  loading: boolean;
  actionLoading: boolean;
  error: Error | null;

  refresh: () => Promise<void>;
  redeploy: (deploymentId: string) => Promise<void>;
  clearError: () => void;
}

export function useDeployment(): UseDeploymentReturn {
  const [data, setData] = useState<DeploymentInfo[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const load = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await getDeployments();

      setData(response);
    } catch (err) {
      setError(
        err instanceof Error
          ? err
          : new Error("Failed to load Deployments")
      );

      setData([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const redeploy = useCallback(
    async (deploymentId: string) => {
      try {
        setActionLoading(true);
        setError(null);

        await redeployProject(deploymentId);

        await load();
      } catch (err) {
        setError(
          err instanceof Error
            ? err
            : new Error("Failed to redeploy project")
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
    redeploy,
    clearError,
  };
}
