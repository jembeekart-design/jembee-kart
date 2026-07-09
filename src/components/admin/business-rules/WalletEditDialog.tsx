"use client";

import { useEffect, useState } from "react";

import type {
  WalletRules,
} from "@/firestore/businessRules";

interface Props {
  open: boolean;
  rules: WalletRules;
  onClose: () => void;
  onSave: (
    rules: WalletRules
  ) => Promise<void>;
}

export default function WalletEditDialog({
  open,
  rules,
  onClose,
  onSave,
}: Props) {

  const [form, setForm] =
    useState<WalletRules>(rules);

  const [saving, setSaving] =
    useState(false);

  useEffect(() => {
    setForm(rules);
  }, [rules]);

  if (!open) return null;

  async function handleSave() {

    try {

      setSaving(true);

      await onSave(form);

    } finally {

      setSaving(false);

    }

  }

  return (

    <div className="fixed inset-0 z-50 flex items-center justify-center bg-[var(--card-color)]/60">

      <div className="w-full max-w-lg rounded-xl bg-slate-900 p-6">

        <h2 className="text-xl font-bold">
          Edit Wallet Rules
        </h2>

        <p className="mt-2 text-sm text-slate-400">
          Configure wallet and withdrawal settings.
        </p>

        <div className="mt-6 grid gap-4">

          <div>
            <label className="text-sm">
              Minimum Withdrawal
            </label>

            <input
              type="number"
              value={form.minimumWithdrawal}
              onChange={(e) =>
                setForm({
                  ...form,
                  minimumWithdrawal: Number(e.target.value),
                })
              }
              className="mt-1 w-full rounded-lg border border-slate-700 bg-slate-800 p-3"
            />
          </div>

          <div>
            <label className="text-sm">
              Withdrawal Charge
            </label>

            <input
              type="number"
              value={form.withdrawalCharge}
              onChange={(e) =>
                setForm({
                  ...form,
                  withdrawalCharge: Number(e.target.value),
                })
              }
              className="mt-1 w-full rounded-lg border border-slate-700 bg-slate-800 p-3"
            />
          </div>

          <div>
            <label className="text-sm">
              Charge Type
            </label>

            <select
              value={form.withdrawalChargeType}
              onChange={(e) =>
                setForm({
                  ...form,
                  withdrawalChargeType:
                    e.target.value as
                      | "FIXED"
                      | "PERCENTAGE",
                })
              }
              className="mt-1 w-full rounded-lg border border-slate-700 bg-slate-800 p-3"
            >
              <option value="FIXED">
                Fixed
              </option>

              <option value="PERCENTAGE">
                Percentage
              </option>

            </select>
          </div>

          <div>
            <label className="flex items-center gap-3">

              <input
                type="checkbox"
                checked={form.kycRequired}
                onChange={(e) =>
                  setForm({
                    ...form,
                    kycRequired: e.target.checked,
                  })
                }
              />

              <span>KYC Required</span>

            </label>
          </div>

          <div>
            <label className="text-sm">
              Maximum Daily Withdrawal
            </label>

            <input
              type="number"
              value={form.maxDailyWithdrawal}
              onChange={(e) =>
                setForm({
                  ...form,
                  maxDailyWithdrawal: Number(e.target.value),
                })
              }
              className="mt-1 w-full rounded-lg border border-slate-700 bg-slate-800 p-3"
            />
          </div>

        </div>

        <div className="mt-6 flex justify-end gap-3">

          <button
            onClick={onClose}
            className="rounded-lg border border-slate-700 px-4 py-2"
          >
            Cancel
          </button>

          <button
            onClick={handleSave}
            disabled={saving}
            className="rounded-lg bg-indigo-600 px-4 py-2 hover:bg-indigo-700 disabled:opacity-50"
          >
            {saving ? "Saving..." : "Save"}
          </button>

        </div>

      </div>

    </div>

  );

}
