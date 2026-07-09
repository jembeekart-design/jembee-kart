"use client";

import { useEffect, useState } from "react";

import type {
  WatchEarnRules,
} from "@/firestore/businessRules";

interface Props {
  open: boolean;
  rules: WatchEarnRules;
  onClose: () => void;
  onSave: (rules: WatchEarnRules) => Promise<void>;
}

export default function WatchEarnEditDialog({
  open,
  rules,
  onClose,
  onSave,
}: Props) {
  const [form, setForm] =
    useState<WatchEarnRules>(rules);

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
          Edit Watch &amp; Earn Rules
        </h2>

        <div className="mt-6 grid gap-4">

          <div className="space-y-2">
  <label>Reward Per Video</label>

  <input
    type="number"
    value={form.rewardPerVideo}
    onChange={(e) =>
      setForm({
        ...form,
        rewardPerVideo: Number(e.target.value),
      })
    }
    className="w-full rounded-lg border border-slate-700 bg-slate-800 p-3"
  />
</div>

          <div>
            <label className="text-sm">
              Videos Required
            </label>

            <input
              type="number"
              value={form.videosRequired}
              onChange={(e) =>
                setForm({
                  ...form,
                  videosRequired: Number(e.target.value),
                })
              }
              className="mt-1 w-full rounded-lg border border-slate-700 bg-slate-800 p-2"
            />
          </div>

          <div>
            <label className="text-sm">
              Reward Amount
            </label>

            <input
              type="number"
              value={form.rewardAmount}
              onChange={(e) =>
                setForm({
                  ...form,
                  rewardAmount: Number(e.target.value),
                })
              }
              className="mt-1 w-full rounded-lg border border-slate-700 bg-slate-800 p-2"
            />
          </div>

          <div>
            <label className="text-sm">
              Required Sales
            </label>

            <input
              type="number"
              value={form.requiredSales}
              onChange={(e) =>
                setForm({
                  ...form,
                  requiredSales: Number(e.target.value),
                })
              }
              className="mt-1 w-full rounded-lg border border-slate-700 bg-slate-800 p-2"
            />
          </div>

          <div>
            <label className="text-sm">
              Maximum Active Cycles
            </label>

            <input
              type="number"
              value={form.maxActiveCycles}
              onChange={(e) =>
                setForm({
                  ...form,
                  maxActiveCycles: Number(e.target.value),
                })
              }
              className="mt-1 w-full rounded-lg border border-slate-700 bg-slate-800 p-2"
            />
          </div>

          <div>
            <label className="text-sm">
              Minimum Watch Duration (Seconds)
            </label>

            <input
              type="number"
              value={form.minimumWatchDuration}
              onChange={(e) =>
                setForm({
                  ...form,
                  minimumWatchDuration: Number(e.target.value),
                })
              }
              className="mt-1 w-full rounded-lg border border-slate-700 bg-slate-800 p-2"
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
