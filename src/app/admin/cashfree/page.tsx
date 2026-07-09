"use client";

export const dynamic = "force-dynamic";

import { useEffect, useState } from "react";

import {
  doc,
  getDoc,
  setDoc
} from "firebase/firestore";

import {
  CreditCard,
  Save,
  ShieldCheck,
  Globe,
  Key,
  Wallet,
  CheckCircle
} from "lucide-react";

import { db } from "@/firebase/config";

interface CashfreeSettings {
  enabled: boolean;
  sandboxMode: boolean;
  appId: string;
  secretKey: string;
  webhookSecret: string;
  paymentGatewayName: string;
  autoSettlement: boolean;
}

export default function CashfreePage() {

  const [settings, setSettings] =
    useState<CashfreeSettings>({
      enabled: true,
      sandboxMode: true,
      appId: "",
      secretKey: "",
      webhookSecret: "",
      paymentGatewayName: "Cashfree",
      autoSettlement: true
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
        "cashfree"
      );

      const snap =
        await getDoc(ref);

      if (snap.exists()) {

        setSettings(
          snap.data() as CashfreeSettings
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
          "cashfree"
        ),
        settings
      );

      alert(
        "Cashfree Settings Saved"
      );

    } catch (error) {

      console.log(error);

    } finally {

      setSaving(false);

    }
  }

  function updateField(
    field: keyof CashfreeSettings,
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

          <div className="flex h-16 w-16 items-center justify-center rounded-[24px] theme-primary-bg">

            <CreditCard size={30} />

          </div>

          <div>

            <h1 className="text-3xl font-black">
              Cashfree Settings
            </h1>

            <p className="mt-1 text-sm text-[var(--muted-text-color)]">
              Configure Cashfree payment gateway
            </p>

          </div>

        </div>

        <button
          onClick={saveSettings}
          disabled={saving}
          className="flex items-center gap-2 rounded-2xl theme-primary-bg px-5 py-3 font-bold"
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
          title="Cashfree Gateway"
          description="Enable payment gateway"
          icon={
            <Wallet size={24} />
          }
          enabled={
            settings.enabled
          }
          onClick={() =>
            updateField(
              "enabled",
              !settings.enabled
            )
          }
        />

        <ToggleCard
          title="Sandbox Mode"
          description="Enable testing environment"
          icon={
            <Globe size={24} />
          }
          enabled={
            settings.sandboxMode
          }
          onClick={() =>
            updateField(
              "sandboxMode",
              !settings.sandboxMode
            )
          }
        />

        <ToggleCard
          title="Auto Settlement"
          description="Automatically settle payments"
          icon={
            <ShieldCheck size={24} />
          }
          enabled={
            settings.autoSettlement
          }
          onClick={() =>
            updateField(
              "autoSettlement",
              !settings.autoSettlement
            )
          }
        />

      </div>

      {/* INPUTS */}

      <div className="mt-6 grid grid-cols-1 gap-5 md:grid-cols-2">

        <InputCard
          title="Cashfree App ID"
          icon={
            <Key size={22} />
          }
          value={settings.appId}
          onChange={(value: string) =>
            updateField(
              "appId",
              value
            )
          }
        />

        <InputCard
          title="Secret Key"
          icon={
            <ShieldCheck size={22} />
          }
          value={settings.secretKey}
          onChange={(value: string) =>
            updateField(
              "secretKey",
              value
            )
          }
        />

        <InputCard
          title="Webhook Secret"
          icon={
            <Globe size={22} />
          }
          value={
            settings.webhookSecret
          }
          onChange={(value: string) =>
            updateField(
              "webhookSecret",
              value
            )
          }
        />

        <InputCard
          title="Gateway Name"
          icon={
            <CreditCard size={22} />
          }
          value={
            settings.paymentGatewayName
          }
          onChange={(value: string) =>
            updateField(
              "paymentGatewayName",
              value
            )
          }
        />

      </div>

      {/* STATUS */}

      <div className="mt-6 rounded-[30px] bg-gradient-to-r from-blue-500 to-cyan-500 p-6">

        <div className="flex items-center gap-3">

          <CheckCircle size={28} />

          <h2 className="text-3xl font-black">
            Cashfree Status
          </h2>

        </div>

        <div className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-2">

          <StatusCard
            title="Gateway"
            value={
              settings.enabled
                ? "Enabled"
                : "Disabled"
            }
          />

          <StatusCard
            title="Mode"
            value={
              settings.sandboxMode
                ? "Sandbox"
                : "Production"
            }
          />

          <StatusCard
            title="Settlement"
            value={
              settings.autoSettlement
                ? "Automatic"
                : "Manual"
            }
          />

          <StatusCard
            title="Gateway Name"
            value={
              settings.paymentGatewayName
            }
          />

        </div>

      </div>

    </main>

  );
}

function InputCard({
  title,
  value,
  onChange,
  icon
}: {
  title: string;
  value: string;
  onChange: (
    value: string
  ) => void;
  icon: React.ReactNode;
}) {

  return (

    <div className="rounded-[30px] bg-[#151515] p-5">

      <div className="mb-4 flex items-center gap-3">

        {icon}

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
