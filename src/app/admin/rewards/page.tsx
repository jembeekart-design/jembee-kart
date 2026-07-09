"use client";

export const dynamic = "force-dynamic";

import { useEffect, useState } from "react";

import {
  doc,
  getDoc,
  setDoc
} from "firebase/firestore";

import {
  Gift,
  Save,
  Trophy,
  Star,
  Coins,
  ShieldCheck,
  Sparkles
} from "lucide-react";

import { db } from "@/firebase/config";

interface RewardSettings {
  rewardsEnabled: boolean;
  dailyRewards: boolean;
  referralRewards: boolean;
  cashbackRewards: boolean;
  vipRewards: boolean;
  signupReward: string;
  dailyRewardPoints: string;
  referralRewardPoints: string;
  vipMinimumPoints: string;
}

export default function RewardsPage() {

  const [settings, setSettings] =
    useState<RewardSettings>({
      rewardsEnabled: true,
      dailyRewards: true,
      referralRewards: true,
      cashbackRewards: true,
      vipRewards: false,
      signupReward: "100",
      dailyRewardPoints: "10",
      referralRewardPoints: "50",
      vipMinimumPoints: "1000"
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
        "rewards"
      );

      const snap =
        await getDoc(ref);

      if (snap.exists()) {

        setSettings(
          snap.data() as RewardSettings
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
          "rewards"
        ),
        settings
      );

      alert(
        "Rewards Settings Saved"
      );

    } catch (error) {

      console.log(error);

    } finally {

      setSaving(false);

    }
  }

  function updateField(
    field: keyof RewardSettings,
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

        Loading...

      </div>

    );
  }

  return (

    <main className="min-h-screen bg-[#0b0b0b] p-4 text-[var(--button-text-color)]">

      {/* HEADER */}

      <div className="mb-8 flex items-center justify-between">

        <div className="flex items-center gap-4">

          <div className="flex h-16 w-16 items-center justify-center rounded-[24px] bg-pink-500">

            <Gift size={30} />

          </div>

          <div>

            <h1 className="text-3xl font-black">
              Rewards System
            </h1>

            <p className="mt-1 text-sm text-[var(--muted-text-color)]">
              Manage points, rewards & loyalty system
            </p>

          </div>

        </div>

        <button
          onClick={saveSettings}
          disabled={saving}
          className="flex items-center gap-2 rounded-2xl bg-pink-500 px-5 py-3 font-bold"
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
          title="Rewards System"
          description="Enable rewards system"
          icon={
            <Gift size={24} />
          }
          enabled={
            settings.rewardsEnabled
          }
          onClick={() =>
            updateField(
              "rewardsEnabled",
              !settings.rewardsEnabled
            )
          }
        />

        <ToggleCard
          title="Daily Rewards"
          description="Daily login rewards"
          icon={
            <Star size={24} />
          }
          enabled={
            settings.dailyRewards
          }
          onClick={() =>
            updateField(
              "dailyRewards",
              !settings.dailyRewards
            )
          }
        />

        <ToggleCard
          title="Referral Rewards"
          description="Referral bonus points"
          icon={
            <Sparkles size={24} />
          }
          enabled={
            settings.referralRewards
          }
          onClick={() =>
            updateField(
              "referralRewards",
              !settings.referralRewards
            )
          }
        />

        <ToggleCard
          title="Cashback Rewards"
          description="Reward cashback points"
          icon={
            <Coins size={24} />
          }
          enabled={
            settings.cashbackRewards
          }
          onClick={() =>
            updateField(
              "cashbackRewards",
              !settings.cashbackRewards
            )
          }
        />

        <ToggleCard
          title="VIP Rewards"
          description="Enable VIP loyalty system"
          icon={
            <Trophy size={24} />
          }
          enabled={
            settings.vipRewards
          }
          onClick={() =>
            updateField(
              "vipRewards",
              !settings.vipRewards
            )
          }
        />

      </div>

      {/* INPUTS */}

      <div className="mt-6 grid grid-cols-1 gap-5 md:grid-cols-2">

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

        <InputCard
          title="Daily Reward Points"
          value={
            settings.dailyRewardPoints
          }
          onChange={(value: string) =>
            updateField(
              "dailyRewardPoints",
              value
            )
          }
        />

        <InputCard
          title="Referral Reward Points"
          value={
            settings.referralRewardPoints
          }
          onChange={(value: string) =>
            updateField(
              "referralRewardPoints",
              value
            )
          }
        />

        <InputCard
          title="VIP Minimum Points"
          value={
            settings.vipMinimumPoints
          }
          onChange={(value: string) =>
            updateField(
              "vipMinimumPoints",
              value
            )
          }
        />

      </div>

      {/* STATUS */}

      <div className="mt-6 rounded-[30px] bg-gradient-to-r from-pink-500 to-purple-500 p-6">

        <div className="flex items-center gap-3">

          <ShieldCheck size={28} />

          <h2 className="text-3xl font-black">
            Reward Status
          </h2>

        </div>

        <div className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-2">

          <StatusCard
            title="Signup Bonus"
            value={`${settings.signupReward} Points`}
          />

          <StatusCard
            title="Daily Reward"
            value={`${settings.dailyRewardPoints} Points`}
          />

          <StatusCard
            title="Referral Reward"
            value={`${settings.referralRewardPoints} Points`}
          />

          <StatusCard
            title="VIP Requirement"
            value={`${settings.vipMinimumPoints} Points`}
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
        className="w-full rounded-2xl bg-[var(--card-color)] px-4 py-4 outline-none"
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
