"use client";

import { useAdminConfig } from "@/lib/admin-config/provider";
import { useRouter } from "next/navigation";

export default function MissionControl() {
  const { config, status, error, lastUpdated, source } = useAdminConfig();
  const router = useRouter();

  return (
    <div className="mx-auto max-w-7xl p-6 space-y-8">

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">
            JembeeKart Mission Control
          </h1>

          <p className="text-sm text-gray-500">
            Central Monitoring & Governance Dashboard
          </p>
        </div>

        <button
          onClick={() => router.refresh()}
          className="rounded-lg bg-black px-4 py-2 text-white"
        >
          Reload Config
        </button>
      </div>

      {/* Status */}
      <div className="rounded-xl border p-5">

        <h2 className="mb-4 text-lg font-semibold">
          System Status
        </h2>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">

          <Status
            title="Admin Config"
            value={status === "ready" ? "Connected" : "Loading"}
          />

          <Status
            title="Config Source"
            value={source}
          />

          <Status
            title="Theme"
            value={
              config.theme.primaryColor
                ? "Loaded"
                : "Missing"
            }
          />

          <Status
            title="Wallet"
            value={
              config.wallet.commissionWalletEnabled
                ? "Enabled"
                : "Disabled"
            }
          />

          <Status
            title="MLM"
            value={
              config.mlm.enabled
                ? "Enabled"
                : "Disabled"
            }
          />

          <Status
            title="Referral"
            value={
              config.referral.enabled
                ? "Enabled"
                : "Disabled"
            }
          />

        </div>

      </div>

      {/* Build Info */}

      <div className="rounded-xl border p-5">

        <h2 className="mb-4 text-lg font-semibold">
          Build Information
        </h2>

        <div className="space-y-2">

          <Info
            label="App Version"
            value={config.app.version}
          />

          <Info
            label="Config Version"
            value={String(config.version)}
          />

          <Info
            label="Last Sync"
            value={
              lastUpdated
                ? lastUpdated.toLocaleString()
                : "Never"
            }
          />

        </div>

      </div>

      {/* Error */}

      {error && (

        <div className="rounded-xl border border-red-300 bg-red-50 p-5">

          <p className="font-semibold text-red-700">
            Error
          </p>

          <p className="text-red-600">
            {error.message}
          </p>

        </div>

      )}

    </div>
  );
}

function Status({
  title,
  value,
}: {
  title: string;
  value: string;
}) {
  return (
    <div className="rounded-lg border p-4">
      <p className="text-xs text-gray-500">
        {title}
      </p>

      <p className="mt-2 font-semibold">
        {value}
      </p>
    </div>
  );
}

function Info({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div className="flex justify-between">
      <span className="text-gray-500">
        {label}
      </span>

      <span className="font-medium">
        {value}
      </span>
    </div>
  );
}
