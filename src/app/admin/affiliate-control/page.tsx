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
  Wallet,
  Gift,
  Percent,
  ShieldCheck,
  TrendingUp,
  BadgeDollarSign
} from "lucide-react";

import { db } from "@/firebase/config";

interface AffiliateSettings {
  affiliateEnabled: boolean;
  referralSystem: boolean;
  levelIncome: boolean;
  signupBonus: boolean;
  withdrawalEnabled: boolean;
  autoCommission: boolean;
  directCommission: string;
  levelCommission: string;
  minimumWithdrawal: string;
  signupReward: string;
}

export default function AffiliateControlPage() {

  const [settings, setSettings] =
    useState<AffiliateSettings>({
      affiliateEnabled: true,
      referralSystem: true,
      levelIncome: true,
      signupBonus: true,
      withdrawalEnabled: true,
      autoCommission: true,
      directCommission: "10",
      levelCommission: "5",
      minimumWithdrawal: "200",
      signupReward: "50"
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
        "affiliate_control"
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
          "affiliate_control"
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

      <div className="flex min-h-screen items-center justify-center bg-black text-white">

        Loading...

      </div>

    );
  }

  return (

    <main className="min-h-screen bg-[#0b0b0b] p-4 text-white">

      {/* HEADER */}

      <div className="mb-8 flex items-center justify-between">

        <div className="flex items-center gap-4">

          <div className="flex h-16 w-16 items-center justify-center rounded-[24px] bg-emerald-500">

            <Users size={30} />

          </div>

          <div>

            <h1 className="text-3xl font-black">
              Affiliate Control
            </h1>

            <p className="mt-1 text-sm text-gray-400">
              Manage MLM & affiliate commissions
            </p>

          </div>

        </div>

        <button
          onClick={saveSettings}
          disabled={saving}
          className="flex items-center gap-2 rounded-2xl bg-emerald-500 px-5 py-3 font-bold text-black"
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
          description="Enable affiliate system"
          icon={
            <Users size={24} />
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
          title="Referral System"
          description="Enable referrals"
          icon={
            <Gift size={24} />
          }
          enabled={
            settings.referralSystem
          }
          onClick={() =>
            updateField(
              "referralSystem",
              !settings.referralSystem
            )
          }
        />

        <ToggleCard
          title="Level Income"
          description="Enable MLM levels"
          icon={
            <TrendingUp size={24} />
          }
          enabled={
            settings.levelIncome
          }
          onClick={() =>
            updateField(
              "levelIncome",
              !settings.levelIncome
            )
          }
        />

        <ToggleCard
          title="Signup Bonus"
          description="Reward new users"
          icon={
            <BadgeDollarSign size={24} />
          }
          enabled={
            settings.signupBonus
          }
          onClick={() =>
            updateField(
              "signupBonus",
              !settings.signupBonus
            )
          }
        />

        <ToggleCard
          title="Withdrawals"
          description="Enable withdrawals"
          icon={
            <Wallet size={24} />
          }
          enabled={
            settings.withdrawalEnabled
          }
          onClick={() =>
            updateField(
              "withdrawalEnabled",
              !settings.withdrawalEnabled
            )
          }
        />

        <ToggleCard
          title="Auto Commission"
          description="Automatic commission credit"
          icon={
            <ShieldCheck size={24} />
          }
          enabled={
            settings.autoCommission
          }
          onClick={() =>
            updateField(
              "autoCommission",
              !settings.autoCommission
            )
          }
        />

      </div>

      {/* INPUTS */}

      <div className="mt-6 grid grid-cols-1 gap-5 md:grid-cols-2">

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
          title="Level Commission %"
          value={
            settings.levelCommission
          }
          onChange={(value: string) =>
            updateField(
              "levelCommission",
              value
            )
          }
        />

        <InputCard
          title="Minimum Withdrawal"
          value={
            settings.minimumWithdrawal
          }
          onChange={(value: string) =>
            updateField(
              "minimumWithdrawal",
              value
            )
          }
        />

        <InputCard
          title="Signup Reward"
          value={
            settings.signupReward
          }
          onChange={(value: string) =>
            updateField(
              "signupReward",
              value
            )
          }
        />

      </div>

      {/* STATUS */}

      <div className="mt-6 rounded-[30px] bg-gradient-to-r from-emerald-500 to-green-500 p-6">

        <div className="flex items-center gap-3">

          <Percent size={28} />

          <h2 className="text-3xl font-black text-black">
            Affiliate Status
          </h2>

        </div>

        <div className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-2">

          <StatusCard
            title="Direct Commission"
            value={`${settings.directCommission}%`}
          />

          <StatusCard
            title="Level Commission"
            value={`${settings.levelCommission}%`}
          />

          <StatusCard
            title="Minimum Withdrawal"
            value={`₹${settings.minimumWithdrawal}`}
          />

          <StatusCard
            title="Signup Reward"
            value={`₹${settings.signupReward}`}
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

      <h2 className="mb-4 text-2xl font-black">
        {title}
      </h2>

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
              ? "bg-green-500"
              : "bg-red-500"
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

    <div className="rounded-2xl bg-white/10 p-4">

      <p className="text-sm text-black/70">
        {title}
      </p>

      <h3 className="mt-2 text-2xl font-black text-black">
        {value}
      </h3>

    </div>

  );
}
