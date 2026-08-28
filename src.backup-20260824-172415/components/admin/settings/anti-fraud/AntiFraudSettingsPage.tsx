"use client";

import { useAntiFraudConfig } from "@/hooks/useAntiFraudConfig";

import AntiFraudSettingsForm from "./AntiFraudSettingsForm";

export default function AntiFraudSettingsPage() {

  const {
    config,
    loading,
    saving,
    error,
    save,
  } = useAntiFraudConfig();

  if (loading) {

    return (
      <div className="p-6">
        Loading Anti Fraud Settings...
      </div>
    );

  }

  if (error) {

    return (
      <div className="p-6 text-[var(--danger-color)]">
        {error}
      </div>
    );

  }

  if (!config) {

    return (
      <div className="p-6 text-[var(--danger-color)]">
        Anti Fraud Configuration Not Found
      </div>
    );

  }

  return (

    <div className="min-h-screen bg-[var(--card-color)] text-[var(--text-color)] space-y-6 p-6">

      <div>

        <h1 className="text-3xl font-bold">
          Anti Fraud Settings
        </h1>

        <p className="mt-2 text-[var(--text-color)]">
          Configure fraud protection rules for JembeeKart.
        </p>

      </div>

      <AntiFraudSettingsForm
        config={config}
        saving={saving}
        onSave={save}
      />

    </div>

  );

}
