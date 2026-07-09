"use client";

export const dynamic = "force-dynamic";

import { useEffect, useState } from "react";

import {
  doc,
  getDoc,
  setDoc
} from "firebase/firestore";

import {
  RefreshCcw,
  Save,
  CreditCard,
  Calendar,
  ShieldCheck,
  Bell,
  Crown
} from "lucide-react";

import { db } from "@/firebase/config";

interface SubscriptionSettings {
  subscriptionsEnabled: boolean;
  autoRenewal: boolean;
  trialEnabled: boolean;
  cancellationAllowed: boolean;
  reminderNotifications: boolean;
  monthlyPlanPrice: string;
  yearlyPlanPrice: string;
  freeTrialDays: string;
  gracePeriodDays: string;
}

export default function SubscriptionsPage() {

  const [settings, setSettings] =
    useState<SubscriptionSettings>({
      subscriptionsEnabled: true,
      autoRenewal: true,
      trialEnabled: true,
      cancellationAllowed: true,
      reminderNotifications: true,
      monthlyPlanPrice: "299",
      yearlyPlanPrice: "2999",
      freeTrialDays: "7",
      gracePeriodDays: "3"
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
        "subscriptions"
      );

      const snap =
        await getDoc(ref);

      if (snap.exists()) {

        setSettings(
          snap.data() as SubscriptionSettings
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
          "subscriptions"
        ),
        settings
      );

      alert(
        "Subscription Settings Saved"
      );

    } catch (error) {

      console.log(error);

    } finally {

      setSaving(false);

    }
  }

  function updateField(
    field: keyof SubscriptionSettings,
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

          <div className="flex h-16 w-16 items-center justify-center rounded-[24px] bg-cyan-500">

            <RefreshCcw size={30} />

          </div>

          <div>

            <h1 className="text-3xl font-black">
              Subscription System
            </h1>

            <p className="mt-1 text-sm text-[var(--muted-text-color)]">
              Manage recurring subscription plans
            </p>

          </div>

        </div>

        <button
          onClick={saveSettings}
          disabled={saving}
          className="flex items-center gap-2 rounded-2xl bg-cyan-500 px-5 py-3 font-bold text-[var(--text-color)]"
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
          title="Subscriptions"
          description="Enable subscription plans"
          icon={
            <RefreshCcw size={24} />
          }
          enabled={
            settings.subscriptionsEnabled
          }
          onClick={() =>
            updateField(
              "subscriptionsEnabled",
              !settings.subscriptionsEnabled
            )
          }
        />

        <ToggleCard
          title="Auto Renewal"
          description="Automatically renew plans"
          icon={
            <CreditCard size={24} />
          }
          enabled={
            settings.autoRenewal
          }
          onClick={() =>
            updateField(
              "autoRenewal",
              !settings.autoRenewal
            )
          }
        />

        <ToggleCard
          title="Free Trial"
          description="Enable trial period"
          icon={
            <Calendar size={24} />
          }
          enabled={
            settings.trialEnabled
          }
          onClick={() =>
            updateField(
              "trialEnabled",
              !settings.trialEnabled
            )
          }
        />

        <ToggleCard
          title="Cancellation"
          description="Allow plan cancellation"
          icon={
            <ShieldCheck size={24} />
          }
          enabled={
            settings.cancellationAllowed
          }
          onClick={() =>
            updateField(
              "cancellationAllowed",
              !settings.cancellationAllowed
            )
          }
        />

        <ToggleCard
          title="Notifications"
          description="Subscription reminders"
          icon={
            <Bell size={24} />
          }
          enabled={
            settings.reminderNotifications
          }
          onClick={() =>
            updateField(
              "reminderNotifications",
              !settings.reminderNotifications
            )
          }
        />

      </div>

      {/* INPUTS */}

      <div className="mt-6 grid grid-cols-1 gap-5 md:grid-cols-2">

        <InputCard
          title="Monthly Plan Price"
          value={
            settings.monthlyPlanPrice
          }
          onChange={(value: string) =>
            updateField(
              "monthlyPlanPrice",
              value
            )
          }
        />

        <InputCard
          title="Yearly Plan Price"
          value={
            settings.yearlyPlanPrice
          }
          onChange={(value: string) =>
            updateField(
              "yearlyPlanPrice",
              value
            )
          }
        />

        <InputCard
          title="Free Trial Days"
          value={
            settings.freeTrialDays
          }
          onChange={(value: string) =>
            updateField(
              "freeTrialDays",
              value
            )
          }
        />

        <InputCard
          title="Grace Period Days"
          value={
            settings.gracePeriodDays
          }
          onChange={(value: string) =>
            updateField(
              "gracePeriodDays",
              value
            )
          }
        />

      </div>

      {/* STATUS */}

      <div className="mt-6 rounded-[30px] bg-gradient-to-r from-cyan-500 to-blue-500 p-6">

        <div className="flex items-center gap-3">

          <Crown size={28} />

          <h2 className="text-3xl font-black text-[var(--text-color)]">
            Subscription Status
          </h2>

        </div>

        <div className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-2">

          <StatusCard
            title="Monthly Plan"
            value={`₹${settings.monthlyPlanPrice}`}
          />

          <StatusCard
            title="Yearly Plan"
            value={`₹${settings.yearlyPlanPrice}`}
          />

          <StatusCard
            title="Free Trial"
            value={`${settings.freeTrialDays} Days`}
          />

          <StatusCard
            title="Grace Period"
            value={`${settings.gracePeriodDays} Days`}
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

      <p className="text-sm text-[var(--text-color)]/70">
        {title}
      </p>

      <h3 className="mt-2 text-2xl font-black text-[var(--text-color)]">
        {value}
      </h3>

    </div>

  );
}
