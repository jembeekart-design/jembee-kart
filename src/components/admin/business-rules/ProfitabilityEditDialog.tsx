"use client";

import { useEffect, useState } from "react";

import type {
  ProfitabilityRules,
} from "@/firestore/businessRules";

interface ProfitabilityEditDialogProps {
  open: boolean;
  rules: ProfitabilityRules | null;
  onClose: () => void;
  onSave: (rules: ProfitabilityRules) => Promise<void>;
}

export default function ProfitabilityEditDialog({
  open,
  rules,
  onClose,
  onSave,
}: ProfitabilityEditDialogProps) {

  const [form, setForm] =
    useState<ProfitabilityRules | null>(null);

  const [saving, setSaving] =
    useState(false);

  useEffect(() => {

    if (rules) {
      setForm(rules);
    }

  }, [rules]);

  if (!open || !form) {
    return null;
  }

  function updateField(
    field: keyof ProfitabilityRules,
    value: number
  ) {

    setForm((prev) => {

  if (!prev) {
    return prev;
  }

  return {
    ...prev,
    [field]: value,
  };

});

  }

  async function handleSave() {

    try {

      setSaving(true);

      await onSave(form!);

      onClose();

    } finally {

      setSaving(false);

    }

  }

  return (

    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60">

      <div className="w-full max-w-lg rounded-xl bg-slate-900 p-6">

        <h2 className="text-2xl font-bold">
          Edit Profitability Rules
        </h2>

        <div className="mt-6 space-y-4">

          <div>
            <label className="mb-1 block text-sm">
              Order Profit
            </label>

            <input
              type="number"
              value={form.orderProfit}
              onChange={(e) =>
                updateField(
                  "orderProfit",
                  Number(e.target.value)
                )
              }
              className="w-full rounded border border-slate-700 bg-slate-800 p-2"
            />
          </div>

          <div>
            <label className="mb-1 block text-sm">
              Cashback Expense
            </label>

            <input
              type="number"
              value={form.cashbackExpense}
              onChange={(e) =>
                updateField(
                  "cashbackExpense",
                  Number(e.target.value)
                )
              }
              className="w-full rounded border border-slate-700 bg-slate-800 p-2"
            />
          </div>

          <div>
            <label className="mb-1 block text-sm">
              Referral Expense
            </label>

            <input
              type="number"
              value={form.referralExpense}
              onChange={(e) =>
                updateField(
                  "referralExpense",
                  Number(e.target.value)
                )
              }
              className="w-full rounded border border-slate-700 bg-slate-800 p-2"
            />
          </div>

          <div>
            <label className="mb-1 block text-sm">
              Reward Expense
            </label>

            <input
              type="number"
              value={form.rewardExpense}
              onChange={(e) =>
                updateField(
                  "rewardExpense",
                  Number(e.target.value)
                )
              }
              className="w-full rounded border border-slate-700 bg-slate-800 p-2"
            />
          </div>

          <div>
            <label className="mb-1 block text-sm">
              Creator Expense
            </label>

            <input
              type="number"
              value={form.creatorExpense}
              onChange={(e) =>
                updateField(
                  "creatorExpense",
                  Number(e.target.value)
                )
              }
              className="w-full rounded border border-slate-700 bg-slate-800 p-2"
            />
          </div>

          <div>
            <label className="mb-1 block text-sm">
              Protection Fund Expense
            </label>

            <input
              type="number"
              value={form.protectionFundExpense}
              onChange={(e) =>
                updateField(
                  "protectionFundExpense",
                  Number(e.target.value)
                )
              }
              className="w-full rounded border border-slate-700 bg-slate-800 p-2"
            />
          </div>

        </div>

        <div className="mt-6 flex justify-end gap-3">

          <button
            onClick={onClose}
            className="rounded bg-slate-700 px-4 py-2"
          >
            Cancel
          </button>

          <button
            onClick={handleSave}
            disabled={saving}
            className="rounded bg-indigo-600 px-4 py-2"
          >
            {saving ? "Saving..." : "Save"}
          </button>

        </div>

      </div>

    </div>

  );

}
