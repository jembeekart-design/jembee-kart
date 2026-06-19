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
  RotateCw,
  Coins,
  Trophy,
  Sparkles,
  ShieldCheck
} from "lucide-react";

import { db } from "@/firebase/config";

interface SpinWheelSettings {
  spinWheelEnabled: boolean;
  dailySpin: boolean;
  signupSpinBonus: boolean;
  cashbackSpin: boolean;
  jackpotEnabled: boolean;
  spinCost: string;
  dailySpinLimit: string;
  minimumReward: string;
  maximumReward: string;
}

export default function SpinWheelPage() {

  const [settings, setSettings] =
    useState<SpinWheelSettings>({
      spinWheelEnabled: true,
      dailySpin: true,
      signupSpinBonus: true,
      cashbackSpin: true,
      jackpotEnabled: false,
      spinCost: "10",
      dailySpinLimit: "3",
      minimumReward: "5",
      maximumReward: "500"
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
        "spin_wheel"
      );

      const snap =
        await getDoc(ref);

      if (snap.exists()) {

        setSettings(
          snap.data() as SpinWheelSettings
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
          "spin_wheel"
        ),
        settings
      );

      alert(
        "Spin Wheel Settings Saved"
      );

    } catch (error) {

      console.log(error);

    } finally {

      setSaving(false);

    }
  }

  function updateField(
    field: keyof SpinWheelSettings,
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

          <div className="flex h-16 w-16 items-center justify-center rounded-[24px] bg-yellow-500">

            <RotateCw size={30} />

          </div>

          <div>

            <h1 className="text-3xl font-black">
              Spin Wheel System
            </h1>

            <p className="mt-1 text-sm text-gray-400">
              Manage lucky spin & rewards
            </p>

          </div>

        </div>

        <button
          onClick={saveSettings}
          disabled={saving}
          className="flex items-center gap-2 rounded-2xl bg-yellow-500 px-5 py-3 font-bold text-black"
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
          title="Spin Wheel"
          description="Enable spin wheel system"
          icon={
            <RotateCw size={24} />
          }
          enabled={
            settings.spinWheelEnabled
          }
          onClick={() =>
            updateField(
              "spinWheelEnabled",
              !settings.spinWheelEnabled
            )
          }
        />

        <ToggleCard
          title="Daily Spin"
          description="Allow daily spins"
          icon={
            <Gift size={24} />
          }
          enabled={
            settings.dailySpin
          }
          onClick={() =>
            updateField(
              "dailySpin",
              !settings.dailySpin
            )
          }
        />

        <ToggleCard
          title="Signup Bonus Spin"
          description="Give free spin on signup"
          icon={
            <Sparkles size={24} />
          }
          enabled={
            settings.signupSpinBonus
          }
          onClick={() =>
            updateField(
              "signupSpinBonus",
              !settings.signupSpinBonus
            )
          }
        />

        <ToggleCard
          title="Cashback Spin"
          description="Enable cashback rewards"
          icon={
            <Coins size={24} />
          }
          enabled={
            settings.cashbackSpin
          }
          onClick={() =>
            updateField(
              "cashbackSpin",
              !settings.cashbackSpin
            )
          }
        />

        <ToggleCard
          title="Jackpot Reward"
          description="Enable jackpot prize"
          icon={
            <Trophy size={24} />
          }
          enabled={
            settings.jackpotEnabled
          }
          onClick={() =>
            updateField(
              "jackpotEnabled",
              !settings.jackpotEnabled
            )
          }
        />

      </div>

      {/* INPUTS */}

      <div className="mt-6 grid grid-cols-1 gap-5 md:grid-cols-2">

        <InputCard
          title="Spin Cost"
          value={settings.spinCost}
          onChange={(value: string) =>
            updateField(
              "spinCost",
              value
            )
          }
        />

        <InputCard
          title="Daily Spin Limit"
          value={
            settings.dailySpinLimit
          }
          onChange={(value: string) =>
            updateField(
              "dailySpinLimit",
              value
            )
          }
        />

        <InputCard
          title="Minimum Reward"
          value={
            settings.minimumReward
          }
          onChange={(value: string) =>
            updateField(
              "minimumReward",
              value
            )
          }
        />

        <InputCard
          title="Maximum Reward"
          value={
            settings.maximumReward
          }
          onChange={(value: string) =>
            updateField(
              "maximumReward",
              value
            )
          }
        />

      </div>

      {/* STATUS */}

      <div className="mt-6 rounded-[30px] bg-gradient-to-r from-yellow-500 to-orange-500 p-6">

        <div className="flex items-center gap-3">

          <ShieldCheck size={28} />

          <h2 className="text-3xl font-black text-black">
            Spin Wheel Status
          </h2>

        </div>

        <div className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-2">

          <StatusCard
            title="Spin Cost"
            value={`₹${settings.spinCost}`}
          />

          <StatusCard
            title="Daily Limit"
            value={`${settings.dailySpinLimit} Spins`}
          />

          <StatusCard
            title="Minimum Reward"
            value={`₹${settings.minimumReward}`}
          />

          <StatusCard
            title="Maximum Reward"
            value={`₹${settings.maximumReward}`}
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
