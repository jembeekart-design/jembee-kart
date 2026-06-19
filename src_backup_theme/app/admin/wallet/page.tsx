"use client";

export const dynamic = "force-dynamic";

import { useEffect, useState } from "react";

import {
  doc,
  getDoc,
  setDoc
} from "firebase/firestore";

import {
  Wallet,
  Save,
  IndianRupee,
  Gift,
  Users,
  CreditCard,
  ShieldCheck,
  TrendingUp
} from "lucide-react";

import { db } from "@/firebase/config";

interface WalletSettings {
  walletEnabled: boolean;
  cashbackEnabled: boolean;
  referralBonusEnabled: boolean;
  affiliateCommissionEnabled: boolean;
  sellerPayoutEnabled: boolean;
  minimumWithdrawal: string;
  signupBonus: string;
  referralBonus: string;
  cashbackPercent: string;
}

export default function WalletPage() {

  const [settings, setSettings] =
    useState<WalletSettings>({
      walletEnabled: true,
      cashbackEnabled: true,
      referralBonusEnabled: true,
      affiliateCommissionEnabled: true,
      sellerPayoutEnabled: true,
      minimumWithdrawal: "100",
      signupBonus: "50",
      referralBonus: "25",
      cashbackPercent: "5"
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
        "wallet"
      );

      const snap =
        await getDoc(ref);

      if (snap.exists()) {

        setSettings(
          snap.data() as WalletSettings
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
          "wallet"
        ),
        settings
      );

      alert(
        "Wallet Settings Saved"
      );

    } catch (error) {

      console.log(error);

    } finally {

      setSaving(false);

    }
  }

  function updateField(
    field: keyof WalletSettings,
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

          <div className="flex h-16 w-16 items-center justify-center rounded-[24px] bg-green-500">

            <Wallet size={30} />

          </div>

          <div>

            <h1 className="text-3xl font-black">
              Wallet Manager
            </h1>

            <p className="mt-1 text-sm text-gray-400">
              Manage cashback, affiliate & wallet system
            </p>

          </div>

        </div>

        <button
          onClick={saveSettings}
          disabled={saving}
          className="flex items-center gap-2 rounded-2xl bg-green-500 px-5 py-3 font-bold"
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
          title="Wallet System"
          description="Enable user wallet"
          icon={
            <Wallet size={24} />
          }
          enabled={
            settings.walletEnabled
          }
          onClick={() =>
            updateField(
              "walletEnabled",
              !settings.walletEnabled
            )
          }
        />

        <ToggleCard
          title="Cashback System"
          description="Enable cashback rewards"
          icon={
            <Gift size={24} />
          }
          enabled={
            settings.cashbackEnabled
          }
          onClick={() =>
            updateField(
              "cashbackEnabled",
              !settings.cashbackEnabled
            )
          }
        />

        <ToggleCard
          title="Referral Bonus"
          description="Enable referral earning"
          icon={
            <Users size={24} />
          }
          enabled={
            settings.referralBonusEnabled
          }
          onClick={() =>
            updateField(
              "referralBonusEnabled",
              !settings.referralBonusEnabled
            )
          }
        />

        <ToggleCard
          title="Affiliate Commission"
          description="Enable affiliate income"
          icon={
            <TrendingUp size={24} />
          }
          enabled={
            settings.affiliateCommissionEnabled
          }
          onClick={() =>
            updateField(
              "affiliateCommissionEnabled",
              !settings.affiliateCommissionEnabled
            )
          }
        />

        <ToggleCard
          title="Seller Payout"
          description="Enable seller withdrawal"
          icon={
            <CreditCard size={24} />
          }
          enabled={
            settings.sellerPayoutEnabled
          }
          onClick={() =>
            updateField(
              "sellerPayoutEnabled",
              !settings.sellerPayoutEnabled
            )
          }
        />

      </div>

      {/* INPUTS */}

      <div className="mt-6 grid grid-cols-1 gap-5 md:grid-cols-2">

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
          title="Signup Bonus"
          value={
            settings.signupBonus
          }
          onChange={(value: string) =>
            updateField(
              "signupBonus",
              value
            )
          }
        />

        <InputCard
          title="Referral Bonus"
          value={
            settings.referralBonus
          }
          onChange={(value: string) =>
            updateField(
              "referralBonus",
              value
            )
          }
        />

        <InputCard
          title="Cashback Percentage"
          value={
            settings.cashbackPercent
          }
          onChange={(value: string) =>
            updateField(
              "cashbackPercent",
              value
            )
          }
        />

      </div>

      {/* LIVE STATUS */}

      <div className="mt-6 rounded-[30px] bg-gradient-to-r from-green-500 to-emerald-600 p-6">

        <div className="flex items-center gap-3">

          <ShieldCheck size={28} />

          <h2 className="text-3xl font-black">
            Wallet Status
          </h2>

        </div>

        <div className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-2">

          <StatusCard
            title="Signup Bonus"
            value={`₹${settings.signupBonus}`}
          />

          <StatusCard
            title="Referral Bonus"
            value={`₹${settings.referralBonus}`}
          />

          <StatusCard
            title="Cashback"
            value={`${settings.cashbackPercent}%`}
          />

          <StatusCard
            title="Minimum Withdrawal"
            value={`₹${settings.minimumWithdrawal}`}
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

        <IndianRupee size={22} />

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

      <p className="text-sm text-white/70">
        {title}
      </p>

      <h3 className="mt-2 text-2xl font-black">
        {value}
      </h3>

    </div>

  );
}
