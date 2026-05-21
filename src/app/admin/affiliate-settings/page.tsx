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

      {/* COMMISSION INPUTS */}

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
              "level3
