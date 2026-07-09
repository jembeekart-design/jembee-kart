"use client";

import { useEffect, useState } from "react";

import type {
  CreatorEconomyRules,
} from "@/firestore/businessRules";

type Props = {
  open: boolean;
  rules: CreatorEconomyRules;
  onClose: () => void;
  onSave: (
    rules: CreatorEconomyRules
  ) => Promise<void>;
};

export default function CreatorEconomyEditDialog({
  open,
  rules,
  onClose,
  onSave,
}: Props) {

  const [form, setForm] =
    useState<CreatorEconomyRules>(rules);

  useEffect(() => {
    setForm(rules);
  }, [rules]);

  if (!open) {
    return null;
  }

  async function handleSave() {
    await onSave(form);
  }

  return (

    <div className="fixed inset-0 z-50 flex items-center justify-center bg-[var(--card-color)]/60 p-4">

      <div className="w-full max-w-lg rounded-xl bg-slate-900 p-6">

        <h2 className="text-3xl font-bold">
          Edit Creator Economy
        </h2>

        <p className="mt-2 text-slate-400">
          Configure creator revenue sharing.
        </p>

        <div className="mt-6 grid gap-4">

          <div>

            <label className="text-sm">
              Creator Revenue Share (%)
            </label>

            <input
              type="number"
              value={form.creatorRevenueShare}
              onChange={(e) =>
                setForm({
                  ...form,
                  creatorRevenueShare: Number(
                    e.target.value
                  ),
                })
              }
              className="mt-1 w-full rounded-lg border border-slate-700 bg-slate-800 px-4 py-3"
            />

          </div>

          <div>

            <label className="text-sm">
              Affiliate Revenue Share (%)
            </label>

            <input
              type="number"
              value={form.affiliateRevenueShare}
              onChange={(e) =>
                setForm({
                  ...form,
                  affiliateRevenueShare: Number(
                    e.target.value
                  ),
                })
              }
              className="mt-1 w-full rounded-lg border border-slate-700 bg-slate-800 px-4 py-3"
            />

          </div>

          <div>

            <label className="text-sm">
              Minimum Payout
            </label>

            <input
              type="number"
              value={form.minimumPayout}
              onChange={(e) =>
                setForm({
                  ...form,
                  minimumPayout: Number(
                    e.target.value
                  ),
                })
              }
              className="mt-1 w-full rounded-lg border border-slate-700 bg-slate-800 px-4 py-3"
            />

          </div>

        </div>

        <div className="mt-8 flex justify-end gap-4">

          <button
            onClick={onClose}
            className="rounded-lg border border-slate-700 px-6 py-3"
          >
            Cancel
          </button>

          <button
            onClick={handleSave}
            className="rounded-lg bg-indigo-600 px-6 py-3 hover:bg-indigo-700"
          >
            Save
          </button>

        </div>

      </div>

    </div>

  );

}
