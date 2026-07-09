"use client";

export const dynamic = "force-dynamic";

import { useEffect, useState } from "react";

import {
  doc,
  getDoc,
  setDoc
} from "firebase/firestore";

import {
  Users,
  Save,
  Percent,
  ShieldCheck,
  Gift,
  TrendingUp,
  Network
} from "lucide-react";

import { db } from "@/firebase/config";

interface AffiliateSettings {
  affiliateEnabled: boolean;
  mlmEnabled: boolean;
  referralEnabled: boolean;
  autoApprove: boolean;
  level1Commission: string;
  level2Commission: string;
  level3Commission: string;
  joiningBonus: string;
  minimumPayout: string;
}

export default function AffiliateSettingsPage() {

  const [settings, setSettings] =
    useState<AffiliateSettings>({
      affiliateEnabled: true,
      mlmEnabled: true,
      referralEnabled: true,
      autoApprove: false,
      level1Commission: "10",
      level2Commission: "5",
      level3Commission: "2",
      joiningBonus: "50",
      minimumPayout: "100"
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
        "affiliate_settings"
      );

      const snap =
        await getDoc(ref);

      if (snap.exists()) {

        setSettings(
          snap.data() as AffiliateSettings
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
          "affiliate_settings"
        ),
        settings
      );

      alert(
        "Affiliate Settings Saved"
      );

    } catch (error) {

      console.log(error);

    } finally {

      setSaving(false);

    }
  }

  function updateField(
    field: keyof AffiliateSettings,
    value: any
  ) {

    setSettings((prev) => ({
      ...prev,
      [field]: value
    }));
  }

  if (loading) {

    return (

      <div className="flex min-h-screen items-center justify-center bg-black text-[var(--button-text-color)]">

        Loading...

      </div>

    );
  }

  return (

    <main className="min-h-screen bg-[#0b0b0b] p-4 text-[var(--button-text-color)]">

      {/* HEADER */}

      <div className="mb-8 flex items-center justify-between">

        <div className="flex items-center gap-4">

          <div className="flex h-16 w-16 items-center justify-center rounded-[24px] bg-orange-500">

            <Users size={30} />

          </div>

          <div>

            <h1 className="text-3xl font-black">
              Affiliate Settings
            </h1>

            <p className="mt-1 text-sm text-gray-400">
              MLM + Referral + Affiliate Control
            </p>

          </div>

        </div>

        <button
          onClick={saveSettings}
          disabled={saving}
          className="flex items-center gap-2 rounded-2xl bg-orange-500 px-5 py-3 font-bold"
        >

          <Save size={18} />

          {saving
            ? "Saving..."
            : "Save"}

        </button>

      </div>

      {/* TOGGLES */}

      <div className="grid grid-cols-1 gap-5 md:grid-cols-2">

        <ToggleCard
          title="Affiliate System"
          description="Enable affiliate earning"
          icon={
            <TrendingUp size={24} />
          }
          enabled={
            settings.affiliateEnabled
          }
          onClick={() =>
            updateField(
              "affiliateEnabled",
              !settings.affiliateEnabled
            )
          }
        />

        <ToggleCard
          title="MLM System"
          description="Enable multilevel commission"
          icon={
            <Network size={24} />
          }
          enabled={
            settings.mlmEnabled
          }
          onClick={() =>
            updateField(
              "mlmEnabled",
              !settings.mlmEnabled
            )
          }
        />

        <ToggleCard
          title="Referral System"
          description="Enable referral rewards"
          icon={
            <Gift size={24} />
          }
          enabled={
            settings.referralEnabled
          }
          onClick={() =>
            updateField(
              "referralEnabled",
              !settings.referralEnabled
            )
          }
        />

        <ToggleCard
          title="Auto Approve Affiliates"
          description="Automatically approve users"
          icon={
            <ShieldCheck size={24} />
          }
          enabled={
            settings.autoApprove
          }
          onClick={() =>
            updateField(
              "autoApprove",
              !settings.autoApprove
            )
          }
        />

      </div>

      {/* INPUTS */}

      <div className="mt-6 grid grid-cols-1 gap-5 md:grid-cols-2">

        <InputCard
          title="Level 1 Commission (%)"
          value={
            settings.level1Commission
          }
          onChange={(value: string) =>
            updateField(
              "level1Commission",
              value
            )
          }
        />

        <InputCard
          title="Level 2 Commission (%)"
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
          title="Level 3 Commission (%)"
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
          title="Joining Bonus"
          value={
            settings.joiningBonus
          }
          onChange={(value: string) =>
            updateField(
              "joiningBonus",
              value
            )
          }
        />

        <InputCard
          title="Minimum Payout"
          value={
            settings.minimumPayout
          }
          onChange={(value: string) =>
            updateField(
              "minimumPayout",
              value
            )
          }
        />

      </div>

      {/* STATUS */}

      <div className="mt-6 rounded-[30px] bg-gradient-to-r from-orange-500 to-red-500 p-6">

        <div className="flex items-center gap-3">

          <Percent size={28} />

          <h2 className="text-3xl font-black">
            Commission Status
          </h2>

        </div>

        <div className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-3">

          <StatusCard
            title="Level 1"
            value={`${settings.level1Commission}%`}
          />

          <StatusCard
            title="Level 2"
            value={`${settings.level2Commission}%`}
          />

          <StatusCard
            title="Level 3"
            value={`${settings.level3Commission}%`}
          />

          <StatusCard
            title="Joining Bonus"
            value={`₹${settings.joiningBonus}`}
          />

          <StatusCard
            title="Minimum Payout"
            value={`₹${settings.minimumPayout}`}
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

    <div className="rounded-[30px] bg-[#151515] p-5">

      <div className="mb-4 flex items-center gap-3">

        <Percent size={22} />

        <h2 className="text-2xl font-black">
          {title}
        </h2>

      </div>

      <input
        type="text"
        value={value}
        onChange={(e) =>
          onChange(
            e.target.value
          )
        }
        className="w-full rounded-2xl bg-black px-4 py-4 outline-none"
      />

    </div>

  );
}

function ToggleCard({
  title,
  description,
  icon,
  enabled,
  onClick
}: {
  title: string;
  description: string;
  icon: React.ReactNode;
  enabled: boolean;
  onClick: () => void;
}) {

  return (

    <div className="rounded-[30px] bg-[#151515] p-5">

      <div className="flex items-center justify-between">

        <div className="flex items-center gap-3">

          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-black">

            {icon}

          </div>

          <div>

            <h2 className="text-xl font-black">
              {title}
            </h2>

            <p className="text-sm text-gray-400">
              {description}
            </p>

          </div>

        </div>

        <button
          onClick={onClick}
          className={`rounded-full px-5 py-3 text-sm font-bold ${
            enabled
              ? "bg-[var(--success-color)]"
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

    <div className="rounded-2xl bg-[var(--card-color)]/10 p-4">

      <p className="text-sm text-[var(--button-text-color)]/70">
        {title}
      </p>

      <h3 className="mt-2 text-2xl font-black">
        {value}
      </h3>

    </div>

  );
}
