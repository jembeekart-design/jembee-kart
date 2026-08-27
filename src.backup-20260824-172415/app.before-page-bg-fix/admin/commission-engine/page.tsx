"use client";

export const dynamic = "force-dynamic";

import { useEffect, useState } from "react";

import {
  doc,
  getDoc,
  setDoc
} from "firebase/firestore";

import {
  Percent,
  Save,
  Users,
  Wallet,
  TrendingUp,
  ShieldCheck
} from "lucide-react";

import { db } from "@/firebase/config";

interface CommissionSettings {
  directCommission: string;
  level2Commission: string;
  level3Commission: string;
  sellerCommission: string;
  cashbackCommission: string;
  autoCredit: boolean;
  affiliateEnabled: boolean;
  cashbackEnabled: boolean;
}

export default function CommissionEnginePage() {

  const [settings, setSettings] =
    useState<CommissionSettings>({
      directCommission: "10",
      level2Commission: "5",
      level3Commission: "2",
      sellerCommission: "15",
      cashbackCommission: "3",
      autoCredit: true,
      affiliateEnabled: true,
      cashbackEnabled: true
    });

  const [loading, setLoading] =
    useState(true);

  const [saving, setSaving] =
    useState(false);

  useEffect(() => {

    fetchSettings();

  }, []);

  async function fetchSettings() {

    try {

      const ref = doc(
        db,
        "admin_settings",
        "commission_engine"
      );

      const snap =
        await getDoc(ref);

      if (snap.exists()) {

        setSettings(
          snap.data() as CommissionSettings
        );

      }

    } catch (error) {

      console.log(error);

    } finally {

      setLoading(false);

    }
  }

  async function saveSettings() {

    try {

      setSaving(true);

      await setDoc(
        doc(
          db,
          "admin_settings",
          "commission_engine"
        ),
        settings
      );

      alert(
        "Commission Settings Saved"
      );

    } catch (error) {

      console.log(error);

    } finally {

      setSaving(false);

    }
  }

  function updateField(
    field: keyof CommissionSettings,
    value: any
  ) {

    setSettings((prev) => ({
      ...prev,
      [field]: value
    }));

  }

  if (loading) {

    return (

      <div className="flex min-h-screen items-center justify-center bg-[var(--card-color)] text-[var(--button-text-color)]">

        Loading Commission Engine...

      </div>

    );
  }

  return (

    <main className="min-h-screen bg-[var(--primary-color)] p-4 text-[var(--button-text-color)]">

      {/* HEADER */}

      <div className="mb-8 flex items-center justify-between">

        <div className="flex items-center gap-4">

          <div className="flex h-16 w-16 items-center justify-center rounded-[24px] bg-[var(--success-color)]">

            <Percent size={30} />

          </div>

          <div>

            <h1 className="text-3xl font-black">
              Commission Engine
            </h1>

            <p className="mt-1 text-sm text-[var(--muted-text-color)]">
              Control affiliate & seller commissions
            </p>

          </div>

        </div>

        <button
          onClick={saveSettings}
          disabled={saving}
          className="flex items-center gap-2 rounded-2xl bg-[var(--success-color)] px-5 py-3 font-bold text-[var(--text-color)]"
        >

          <Save size={18} />

          {saving
            ? "Saving..."
            : "Save"}

        </button>

      </div>

      {/* COMMISSION INPUTS */}

      <div className="grid grid-cols-1 gap-5 md:grid-cols-2">

        <InputCard
          title="Direct Commission %"
          value={
            settings.directCommission
          }
          onChange={(value: string) =>
            updateField(
              "directCommission",
              value
            )
          }
        />

        <InputCard
          title="Level 2 Commission %"
          value={
            settings.level2Commission
          }
          onChange={(value: string) =>
            updateField(
              "level2Commission",
              value
            )
          }
        />

        <InputCard
          title="Level 3 Commission %"
          value={
            settings.level3Commission
          }
          onChange={(value: string) =>
            updateField(
              "level3Commission",
              value
            )
          }
        />

        <InputCard
          title="Seller Commission %"
          value={
            settings.sellerCommission
          }
          onChange={(value: string) =>
            updateField(
              "sellerCommission",
              value
            )
          }
        />

        <InputCard
          title="Cashback %"
          value={
            settings.cashbackCommission
          }
          onChange={(value: string) =>
            updateField(
              "cashbackCommission",
              value
            )
          }
        />

      </div>

      {/* TOGGLES */}

      <div className="mt-6 grid grid-cols-1 gap-5 md:grid-cols-3">

        <ToggleCard
          title="Auto Credit"
          description="Automatically credit commission"
          enabled={
            settings.autoCredit
          }
          icon={
            <Wallet size={24} />
          }
          onClick={() =>
            updateField(
              "autoCredit",
              !settings.autoCredit
            )
          }
        />

        <ToggleCard
          title="Affiliate System"
          description="Enable affiliate commissions"
          enabled={
            settings.affiliateEnabled
          }
          icon={
            <Users size={24} />
          }
          onClick={() =>
            updateField(
              "affiliateEnabled",
              !settings.affiliateEnabled
            )
          }
        />

        <ToggleCard
          title="Cashback System"
          description="Enable cashback rewards"
          enabled={
            settings.cashbackEnabled
          }
          icon={
            <TrendingUp size={24} />
          }
          onClick={() =>
            updateField(
              "cashbackEnabled",
              !settings.cashbackEnabled
            )
          }
        />

      </div>

      {/* STATUS */}

      <div className="mt-6 rounded-[30px] bg-gradient-to-r from-[var(--primary-color)] to-[var(--primary-color)] p-6">

        <div className="flex items-center gap-3">

          <ShieldCheck size={28} />

          <h2 className="text-3xl font-black text-[var(--text-color)]">
            Commission Status
          </h2>

        </div>

        <div className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-3">

          <StatusCard
            title="Direct Income"
            value={`${settings.directCommission}%`}
          />

          <StatusCard
            title="Seller Income"
            value={`${settings.sellerCommission}%`}
          />

          <StatusCard
            title="Cashback"
            value={`${settings.cashbackCommission}%`}
          />

        </div>

      </div>

    </main>

  );
}

function InputCard({
  title,
  value,
  onChange
}: {
  title: string;
  value: string;
  onChange: (
    value: string
  ) => void;
}) {

  return (

    <div className="rounded-[30px] bg-[var(--primary-color)] p-5">

      <h2 className="mb-4 text-2xl font-black">
        {title}
      </h2>

      <input
        type="number"
        value={value}
        onChange={(e) =>
          onChange(
            e.target.value
          )
        }
        className="w-full rounded-2xl bg-[var(--card-color)] px-4 py-4 outline-none"
      />

    </div>

  );
}

function ToggleCard({
  title,
  description,
  enabled,
  icon,
  onClick
}: {
  title: string;
  description: string;
  enabled: boolean;
  icon: React.ReactNode;
  onClick: () => void;
}) {

  return (

    <div className="rounded-[30px] bg-[var(--primary-color)] p-5">

      <div className="flex items-center justify-between">

        <div className="flex items-center gap-3">

          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[var(--card-color)]">

            {icon}

          </div>

          <div>

            <h2 className="text-xl font-black">
              {title}
            </h2>

            <p className="text-sm text-[var(--muted-text-color)]">
              {description}
            </p>

          </div>

        </div>

        <button
          onClick={onClick}
          className={`rounded-full px-5 py-3 text-sm font-bold ${
            enabled
              ? "bg-[var(--success-color)] text-[var(--text-color)]"
              : "bg-[var(--danger-color)]"
          }`}
        >

          {enabled
            ? "Enabled"
            : "Disabled"}

        </button>

      </div>

    </div>

  );
}

function StatusCard({
  title,
  value
}: {
  title: string;
  value: string;
}) {

  return (

    <div className="rounded-2xl bg-[var(--card-color)]/10 p-5">

      <p className="text-sm text-[var(--text-color)]/70">
        {title}
      </p>

      <h3 className="mt-2 text-3xl font-black text-[var(--text-color)]">
        {value}
      </h3>

    </div>

  );
}
