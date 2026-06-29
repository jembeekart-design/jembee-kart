"use client";

import { useCallback, useEffect, useState } from "react";

import type {
  AntiFraudConfig,
} from "@/modules/anti-fraud";

import {
  getAntiFraudConfig,
} from "@/firestore/settings/antiFraudConfig";

import {
  updateAntiFraudConfig,
} from "@/firestore/settings/updateAntiFraudConfig";

interface UseAntiFraudConfigReturn {
  config: AntiFraudConfig | null;
  loading: boolean;
  saving: boolean;
  error: string | null;

  refresh: () => Promise<void>;

  save: (
    config: Partial<AntiFraudConfig>
  ) => Promise<void>;
}

export function useAntiFraudConfig(): UseAntiFraudConfigReturn {

  const [config, setConfig] =
    useState<AntiFraudConfig | null>(
      null
    );

  const [loading, setLoading] =
    useState(true);

  const [saving, setSaving] =
    useState(false);

  const [error, setError] =
    useState<string | null>(null);

  const refresh =
    useCallback(async () => {

      try {

        setLoading(true);

        setError(null);

        const data =
          await getAntiFraudConfig();

        setConfig(data);

      } catch (err) {

        console.error(err);

        setError(
          "Failed to load Anti Fraud configuration."
        );

      } finally {

        setLoading(false);

      }

    }, []);

  useEffect(() => {

    refresh();

  }, [refresh]);

  async function save(
    data: Partial<AntiFraudConfig>
  ) {

    try {

      setSaving(true);

      setError(null);

      await updateAntiFraudConfig(
        data
      );

      await refresh();

    } catch (err) {

      console.error(err);

      setError(
        "Failed to save Anti Fraud configuration."
      );

    } finally {

      setSaving(false);

    }

  }

  return {

    config,

    loading,

    saving,

    error,

    refresh,

    save,

  };

}
