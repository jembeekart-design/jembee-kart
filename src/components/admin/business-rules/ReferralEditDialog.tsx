"use client";

import { useEffect, useState } from "react";

import type {
  ReferralRules,
} from "@/firestore/businessRules";

interface Props {
  open: boolean;
  rules: ReferralRules;
  onClose: () => void;
  onSave: (
    rules: ReferralRules
  ) => Promise<void>;
}

export default function ReferralEditDialog({
  open,
  rules,
  onClose,
  onSave,
}: Props) {

  const [form, setForm] =
    useState<ReferralRules>(rules);

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

      <div className="w-full max-w-lg rounded-xl bg-[var(--card-color)] p-6">

        <h2 className="text-xl font-bold">
          Edit Referral Rules
        </h2>

        <p className="mt-2 text-sm text-[var(--text-color)]">
          Configure referral commission percentages.
        </p>

        <div className="mt-6 grid gap-4">

          <div>
            <label className="text-sm">
              Level 1 Commission (%)
            </label>

            <input
              type="number"
              value={form.level1Commission}
              onChange={(e) =>
                setForm({
                  ...form,
                  level1Commission: Number(e.target.value),
                })
              }
              className="mt-1 w-full rounded-lg border border-[var(--border-color)] bg-[var(--card-color)] p-3"
            />
          </div>

          <div>
            <label className="text-sm">
              Level 2 Commission (%)
            </label>

            <input
              type="number"
              value={form.level2Commission}
              onChange={(e) =>
                setForm({
                  ...form,
                  level2Commission: Number(e.target.value),
                })
              }
              className="mt-1 w-full rounded-lg border border-[var(--border-color)] bg-[var(--card-color)] p-3"
            />
          </div>

          <div>
            <label className="text-sm">
              Level 3 Commission (%)
            </label>

            <input
              type="number"
              value={form.level3Commission}
              onChange={(e) =>
                setForm({
                  ...form,
                  level3Commission: Number(e.target.value),
                })
              }
              className="mt-1 w-full rounded-lg border border-[var(--border-color)] bg-[var(--card-color)] p-3"
            />
          </div>

          <div>
            <label className="text-sm">
              Level 4 Commission (%)
            </label>

            <input
              type="number"
              value={form.level4Commission}
              onChange={(e) =>
                setForm({
                  ...form,
                  level4Commission: Number(e.target.value),
                })
              }
              className="mt-1 w-full rounded-lg border border-[var(--border-color)] bg-[var(--card-color)] p-3"
            />
          </div>

        </div>

        <div className="mt-6 flex justify-end gap-3">

          <button
            onClick={onClose}
            className="rounded-lg border border-[var(--border-color)] px-4 py-2"
          >
            Cancel
          </button>

          <button
            onClick={handleSave}
            disabled={saving}
            className="rounded-lg bg-[var(--primary-color)] px-4 py-2 hover:bg-[var(--primary-color)] disabled:opacity-50"
          >
            {saving ? "Saving..." : "Save"}
          </button>

        </div>

      </div>

    </div>

  );

}
