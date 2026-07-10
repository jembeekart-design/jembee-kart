"use client";

import { useEffect, useState } from "react";

import type {
  FeatureFlags,
} from "@/firestore/businessRules";

type Props = {
  open: boolean;
  flags: FeatureFlags;
  onClose: () => void;
  onSave: (
    flags: FeatureFlags
  ) => Promise<void>;
};

export default function FeatureFlagsEditDialog({
  open,
  flags,
  onClose,
  onSave,
}: Props) {

  const [form, setForm] =
    useState<FeatureFlags>(flags);

  useEffect(() => {
    setForm(flags);
  }, [flags]);

  if (!open) {
    return null;
  }

  async function handleSave() {
    await onSave(form);
  }

  function toggle(
    key: keyof FeatureFlags
  ) {
    setForm({
      ...form,
      [key]: !form[key],
    });
  }

  function ToggleRow({
    label,
    field,
  }: {
    label: string;
    field: keyof FeatureFlags;
  }) {
    return (
      <label className="flex items-center justify-between rounded-lg border border-[var(--border-color)] bg-[var(--card-color)] px-4 py-3">

        <span>{label}</span>

        <input
          type="checkbox"
          checked={form[field]}
          onChange={() => toggle(field)}
          className="h-5 w-5"
        />

      </label>
    );
  }

  return (

    <div className="fixed inset-0 z-50 flex items-center justify-center bg-[var(--card-color)]/60 p-4">

      <div className="w-full max-w-lg rounded-xl bg-[var(--card-color)] p-6">

        <h2 className="text-3xl font-bold">
          Edit Feature Flags
        </h2>

        <p className="mt-2 text-[var(--text-color)]">
          Enable or disable platform features.
        </p>

        <div className="mt-6 grid gap-4">

          <ToggleRow
            label="Ecommerce"
            field="ecommerceEnabled"
          />

          <ToggleRow
            label="Referral"
            field="referralEnabled"
          />

          <ToggleRow
            label="Watch & Earn"
            field="watchEarnEnabled"
          />

          <ToggleRow
            label="Creator Economy"
            field="creatorEconomyEnabled"
          />

          <ToggleRow
            label="Cashback"
            field="cashbackEnabled"
          />

          <ToggleRow
            label="Advertisements"
            field="adsEnabled"
          />

          <ToggleRow
            label="Wallet"
            field="walletEnabled"
          />

          <ToggleRow
            label="Loyalty Program"
            field="loyaltyEnabled"
          />

        </div>

        <div className="mt-8 flex justify-end gap-4">

          <button
            onClick={onClose}
            className="rounded-lg border border-[var(--border-color)] px-6 py-3"
          >
            Cancel
          </button>

          <button
            onClick={handleSave}
            className="rounded-lg bg-[var(--primary-color)] px-6 py-3 hover:bg-[var(--primary-color)]"
          >
            Save
          </button>

        </div>

      </div>

    </div>

  );

}
