"use client";

import { useEffect, useState } from "react";

import {
  getAntiFraudConfig,
} from "@/firestore/settings/antiFraudConfig";

import type {
  AntiFraudConfig,
} from "@/modules/anti-fraud";

export default function AntiFraudSettingsPage() {

  const [config, setConfig] =
    useState<AntiFraudConfig | null>(null);

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState<string | null>(null);

  useEffect(() => {

    async function load() {

      try {

        const data =
          await getAntiFraudConfig();

        setConfig(data);

      } catch (err) {

        console.error(err);

        setError(
          "Unable to load Anti Fraud configuration."
        );

      } finally {

        setLoading(false);

      }

    }

    load();

  }, []);

  if (loading) {

    return (
      <div className="p-6">
        Loading Anti Fraud Settings...
      </div>
    );

  }

  if (error) {

    return (
      <div className="p-6 text-red-500">
        {error}
      </div>
    );

  }

  return (

    <div className="p-6 space-y-6">

      <h1 className="text-2xl font-bold">
        Anti Fraud Settings
      </h1>

      <pre className="rounded-lg border p-4 overflow-auto text-sm">

        {JSON.stringify(config, null, 2)}

      </pre>

    </div>

  );

}
