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

          <div className="flex h-16 w-16 items-center justify-center rounded-[24px] bg-pink-500">

            <Gift size={30} />

          </div>

          <div>

            <h1 className="text-3xl font-black">
              Rewards System
            </h1>

            <p className="mt-1 text-sm text-gray-400">
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
              "referral
