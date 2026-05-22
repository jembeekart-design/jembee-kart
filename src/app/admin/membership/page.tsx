"use client";

export const dynamic = "force-dynamic";

import { useEffect, useState } from "react";

import {
  doc,
  getDoc,
  setDoc
} from "firebase/firestore";

import {
  Crown,
  Save,
  Star,
  ShieldCheck,
  Gem,
  BadgeCheck,
  Wallet
} from "lucide-react";

import { db } from "@/firebase/config";

interface MembershipSettings {
  membershipEnabled: boolean;
  vipMembership: boolean;
  premiumSupport: boolean;
  freeShipping: boolean;
  cashbackBoost: boolean;
  monthlyPrice: string;
  yearlyPrice: string;
  rewardMultiplier: string;
  vipMinimumPurchase: string;
}

export default function MembershipPage() {

  const [settings, setSettings] =
    useState<MembershipSettings>({
      membershipEnabled: true,
      vipMembership: true,
      premiumSupport: true,
      freeShipping: true,
      cashbackBoost: true,
      monthlyPrice: "199",
      yearlyPrice: "1999",
      rewardMultiplier: "2",
      vipMinimumPurchase: "5000"
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
        "membership"
      );

      const snap =
        await getDoc(ref);

      if (snap.exists()) {

        setSettings(
          snap.data() as MembershipSettings
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
          "membership"
        ),
        settings
      );

      alert(
        "Membership Settings Saved"
      );

    } catch (error) {

      console.log(error);

    } finally {

      setSaving(false);

    }
  }

  function updateField(
    field: keyof MembershipSettings,
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

          <div className="flex h-16 w-16 items-center justify-center rounded-[24px] bg-amber-500">

            <Crown size={30} />

          </div>

          <div>

            <h1 className="text-3xl font-black">
              Membership System
            </h1>

            <p className="mt-1 text-sm text-gray-400">
              Manage premium membership plans
            </p>

          </div>

        </div>

        <button
          onClick={saveSettings}
          disabled={saving}
          className="flex items-center gap-2 rounded-2xl bg-amber-500 px-5 py-3 font-bold text-black"
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
          title="Membership System"
          description="Enable memberships"
          icon={
            <Crown size={24} />
          }
          enabled={
            settings.membershipEnabled
          }
          onClick={() =>
            updateField(
              "membershipEnabled",
              !settings.membershipEnabled
            )
          }
        />

        <ToggleCard
          title="VIP Membership"
          description="Enable VIP tier"
          icon={
            <Gem size={24} />
          }
          enabled={
            settings.vipMembership
          }
          onClick={() =>
            updateField(
              "vipMembership",
              !settings.vipMembership
            )
          }
        />

        <ToggleCard
          title="Premium Support"
          description="Priority customer support"
          icon={
            <ShieldCheck size={24} />
          }
          enabled={
            settings.premiumSupport
          }
          onClick={() =>
            updateField(
              "premiumSupport",
              !settings.premiumSupport
            )
          }
        />

        <ToggleCard
          title="Free Shipping"
          description="Free delivery for members"
          icon={
            <BadgeCheck size={24} />
          }
          enabled={
            settings.freeShipping
          }
          onClick={() =>
            updateField(
              "freeShipping",
              !settings.freeShipping
            )
          }
        />

        <ToggleCard
          title="Cashback Boost"
          description="Extra cashback rewards"
          icon={
            <Wallet size={24} />
          }
          enabled={
            settings.cashbackBoost
          }
          onClick={() =>
            updateField(
              "cashbackBoost",
              !settings.cashbackBoost
            )
          }
        />

      </div>

      {/* INPUTS */}

      <div className="mt-6 grid grid-cols-1 gap-5 md:grid-cols-2">

        <InputCard
          title="Monthly Price"
          value={
            settings.monthlyPrice
          }
          onChange={(value: string) =>
            updateField(
              "monthlyPrice",
              value
            )
          }
        />

        <InputCard
          title="Yearly Price"
          value={
            settings.yearlyPrice
          }
          onChange={(value: string) =>
            updateField(
              "yearlyPrice",
              value
            )
          }
        />

        <InputCard
          title="Reward Multiplier"
          value={
            settings.rewardMultiplier
          }
          onChange={(value: string) =>
            updateField(
              "rewardMultiplier",
              value
            )
          }
        />

        <InputCard
          title="VIP Minimum Purchase"
          value={
            settings.vipMinimumPurchase
          }
          onChange={(value: string) =>
            updateField(
              "vipMinimumPurchase",
              value
            )
          }
        />

      </div>

      {/* STATUS */}

      <div className="mt-6 rounded-[30px] bg-gradient-to-r from-amber-500 to-yellow-500 p-6">

        <div className="flex items-center gap-3">

          <Star size={28} />

          <h2 className="text-3xl font-black text-black">
            Membership Status
          </h2>

        </div>

        <div className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-2">

          <StatusCard
            title="Monthly Plan"
            value={`₹${settings.monthlyPrice}`}
          />

          <StatusCard
            title="Yearly Plan"
            value={`₹${settings.yearlyPrice}`}
          />

          <StatusCard
            title="Reward Boost"
            value={`${settings.rewardMultiplier}x`}
          />

          <StatusCard
            title="VIP Requirement"
            value={`₹${settings.vipMinimumPurchase}`}
          />

        </div>

      </div>

    </main>
