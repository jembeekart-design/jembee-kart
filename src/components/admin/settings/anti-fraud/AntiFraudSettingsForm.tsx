"use client";

import { useEffect, useMemo, useState } from "react";

import type {
  AntiFraudConfig,
} from "@/modules/anti-fraud";

interface Props {
  config: AntiFraudConfig;
  saving: boolean;
  onSave: (
    config: Partial<AntiFraudConfig>
  ) => Promise<void>;
}

export default function AntiFraudSettingsForm({
  config,
  saving,
  onSave,
}: Props) {

  const [form, setForm] =
    useState<AntiFraudConfig>(config);

  const [error, setError] =
    useState<string | null>(null);

  const [success, setSuccess] =
    useState<string | null>(null);

  useEffect(() => {

    setForm(config);

  }, [config]);

  const dirty = useMemo(() => {

    return (
      JSON.stringify(form) !==
      JSON.stringify(config)
    );

  }, [form, config]);

  function updateField<
    K extends keyof AntiFraudConfig
  >(
    key: K,
    value: AntiFraudConfig[K]
  ) {

    setForm((prev) => ({

      ...prev,

      [key]: value,

    }));

  }

  async function handleSave() {

    try {

      setError(null);

      setSuccess(null);

      await onSave(form);

      setSuccess(
        "Anti Fraud configuration updated successfully."
      );

    } catch (err) {

      console.error(err);

      setError(
        "Failed to update Anti Fraud configuration."
      );

    }

  }

  function handleReset() {

    setForm(config);

    setError(null);

    setSuccess(null);

  }
    return (

    <div className="space-y-6">

      {error && (

        <div className="rounded-lg border border-[var(--danger-color)] bg-[var(--danger-color)] p-3 text-[var(--danger-color)]">

          {error}

        </div>

      )}

      {success && (

        <div className="rounded-lg border border-[var(--success-color)] bg-[var(--success-color)] p-3 text-[var(--success-color)]">

          {success}

        </div>

      )}

      <div className="rounded-xl border p-6 space-y-5">

        <h2 className="text-xl font-semibold">

          Core Protection

        </h2>

        <label className="flex items-center justify-between">

          <span>

            Enable Anti Fraud System

          </span>

          <input
            type="checkbox"
            checked={form.enabled}
            onChange={(e) =>
              updateField(
                "enabled",
                e.target.checked
              )
            }
          />

        </label>

        <label className="flex items-center justify-between">

          <span>

            Self Referral Protection

          </span>

          <input
            type="checkbox"
            checked={
              form.selfReferralProtection
            }
            onChange={(e) =>
              updateField(
                "selfReferralProtection",
                e.target.checked
              )
            }
          />

        </label>

        <label className="flex items-center justify-between">

          <span>

            Withdrawal Fraud Protection

          </span>

          <input
            type="checkbox"
            checked={
              form.withdrawalFraudProtection
            }
            onChange={(e) =>
              updateField(
                "withdrawalFraudProtection",
                e.target.checked
              )
            }
          />

        </label>

        <label className="flex items-center justify-between">

          <span>

            Watch Farming Protection

          </span>

          <input
            type="checkbox"
            checked={
              form.watchFarmingProtection
            }
            onChange={(e) =>
              updateField(
                "watchFarmingProtection",
                e.target.checked
              )
            }
          />

        </label>

      </div>

<div className="rounded-xl border border-[var(--border-color)] bg-[var(--card-color)] text-[var(--text-color)] p-6 space-y-5">

  <h2 className="text-xl font-semibold">
    Validation Rules
  </h2>

        
        <label className="flex items-center justify-between">

          <span>Check Mobile Number</span>

          <input
            type="checkbox"
            checked={form.checkMobile}
            onChange={(e) =>
              updateField(
                "checkMobile",
                e.target.checked
              )
            }
          />

        </label>

        <label className="flex items-center justify-between">

          <span>Check Email</span>

          <input
            type="checkbox"
            checked={form.checkEmail}
            onChange={(e) =>
              updateField(
                "checkEmail",
                e.target.checked
              )
            }
          />

        </label>

        <label className="flex items-center justify-between">

          <span>Check Device</span>

          <input
            type="checkbox"
            checked={form.checkDevice}
            onChange={(e) =>
              updateField(
                "checkDevice",
                e.target.checked
              )
            }
          />

        </label>

        <label className="flex items-center justify-between">

          <span>Check IP Address</span>

          <input
            type="checkbox"
            checked={form.checkIP}
            onChange={(e) =>
              updateField(
                "checkIP",
                e.target.checked
              )
            }
          />

        </label>

        <label className="flex items-center justify-between">

          <span>Check KYC</span>

          <input
            type="checkbox"
            checked={form.checkKYC}
            onChange={(e) =>
              updateField(
                "checkKYC",
                e.target.checked
              )
            }
          />

        </label>

        <label className="flex items-center justify-between">

          <span>Check PAN</span>

          <input
            type="checkbox"
            checked={form.checkPAN}
            onChange={(e) =>
              updateField(
                "checkPAN",
                e.target.checked
              )
            }
          />

        </label>

        <label className="flex items-center justify-between">

          <span>Check Aadhaar</span>

          <input
            type="checkbox"
            checked={form.checkAadhaar}
            onChange={(e) =>
              updateField(
                "checkAadhaar",
                e.target.checked
              )
            }
          />

        </label>

      </div>
            <div className="rounded-xl border p-6 space-y-5">

        <h2 className="text-xl font-semibold">

          Action Rules

        </h2>

        <label className="flex items-center justify-between">

          <span>Block Commission</span>

          <input
            type="checkbox"
            checked={form.blockCommission}
            onChange={(e) =>
              updateField(
                "blockCommission",
                e.target.checked
              )
            }
          />

        </label>

        <label className="flex items-center justify-between">

          <span>Auto Suspend User</span>

          <input
            type="checkbox"
            checked={form.autoSuspend}
            onChange={(e) =>
              updateField(
                "autoSuspend",
                e.target.checked
              )
            }
          />

        </label>

        <label className="flex items-center justify-between">

          <span>Log Every Fraud Attempt</span>

          <input
            type="checkbox"
            checked={form.logViolation}
            onChange={(e) =>
              updateField(
                "logViolation",
                e.target.checked
              )
            }
          />

        </label>

      </div>

      <div className="flex gap-3">

        <button
          type="button"
          onClick={handleReset}
          disabled={!dirty || saving}
          className="rounded-lg border px-5 py-2"
        >
          Reset
        </button>

        <button
          type="button"
          onClick={handleSave}
          disabled={!dirty || saving}
          className="rounded-lg bg-[var(--primary-color)] px-5 py-2 text-[var(--button-text-color)] disabled:opacity-50"
        >
          {saving ? "Saving..." : "Save Settings"}
        </button>

      </div>

    </div>

  );

}
