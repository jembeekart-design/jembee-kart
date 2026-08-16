"use client";

export const dynamic = "force-dynamic";

import { useEffect, useState } from "react";

import {
  doc,
  getDoc,
  setDoc
} from "firebase/firestore";

import {
  Shield,
  Save,
  Ban,
  Smartphone,
  Globe,
  AlertTriangle,
  Lock,
  Eye
} from "lucide-react";

import { db } from "@/firebase/config";

interface FraudSettings {
  fraudProtectionEnabled: boolean;
  blockVpnUsers: boolean;
  deviceTracking: boolean;
  ipBlocking: boolean;
  suspiciousLoginAlerts: boolean;
  autoBanFraudUsers: boolean;
  maxLoginAttempts: string;
  fraudScoreLimit: string;
}

export default function FraudProtectionPage() {

  const [settings, setSettings] =
    useState<FraudSettings>({
      fraudProtectionEnabled: true,
      blockVpnUsers: true,
      deviceTracking: true,
      ipBlocking: true,
      suspiciousLoginAlerts: true,
      autoBanFraudUsers: false,
      maxLoginAttempts: "5",
      fraudScoreLimit: "80"
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
        "fraud_protection"
      );

      const snap =
        await getDoc(ref);

      if (snap.exists()) {

        setSettings(
          snap.data() as FraudSettings
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
          "fraud_protection"
        ),
        settings
      );

      alert(
        "Fraud Protection Settings Saved"
      );

    } catch (error) {

      console.log(error);

    } finally {

      setSaving(false);

    }
  }

  function updateField(
    field: keyof FraudSettings,
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

    <main className="min-h-screen bg-[var(--primary-color)] p-4 text-[var(--button-text-color)]">

      {/* HEADER */}

      <div className="mb-8 flex items-center justify-between">

        <div className="flex items-center gap-4">

          <div className="flex h-16 w-16 items-center justify-center rounded-[24px] bg-[var(--danger-color)]">

            <Shield size={30} />

          </div>

          <div>

            <h1 className="text-3xl font-black">
              Fraud Protection
            </h1>

            <p className="mt-1 text-sm text-[var(--muted-text-color)]">
              Secure your platform from fraud users
            </p>

          </div>

        </div>

        <button
          onClick={saveSettings}
          disabled={saving}
          className="flex items-center gap-2 rounded-2xl bg-[var(--danger-color)] px-5 py-3 font-bold"
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
          title="Fraud Protection"
          description="Enable security protection"
          icon={
            <Shield size={24} />
          }
          enabled={
            settings.fraudProtectionEnabled
          }
          onClick={() =>
            updateField(
              "fraudProtectionEnabled",
              !settings.fraudProtectionEnabled
            )
          }
        />

        <ToggleCard
          title="Block VPN Users"
          description="Prevent VPN access"
          icon={
            <Globe size={24} />
          }
          enabled={
            settings.blockVpnUsers
          }
          onClick={() =>
            updateField(
              "blockVpnUsers",
              !settings.blockVpnUsers
            )
          }
        />

        <ToggleCard
          title="Device Tracking"
          description="Track user devices"
          icon={
            <Smartphone size={24} />
          }
          enabled={
            settings.deviceTracking
          }
          onClick={() =>
            updateField(
              "deviceTracking",
              !settings.deviceTracking
            )
          }
        />

        <ToggleCard
          title="IP Blocking"
          description="Block suspicious IPs"
          icon={
            <Ban size={24} />
          }
          enabled={
            settings.ipBlocking
          }
          onClick={() =>
            updateField(
              "ipBlocking",
              !settings.ipBlocking
            )
          }
        />

        <ToggleCard
          title="Login Alerts"
          description="Suspicious login alerts"
          icon={
            <AlertTriangle size={24} />
          }
          enabled={
            settings.suspiciousLoginAlerts
          }
          onClick={() =>
            updateField(
              "suspiciousLoginAlerts",
              !settings.suspiciousLoginAlerts
            )
          }
        />

        <ToggleCard
          title="Auto Ban"
          description="Automatically ban fraud users"
          icon={
            <Lock size={24} />
          }
          enabled={
            settings.autoBanFraudUsers
          }
          onClick={() =>
            updateField(
              "autoBanFraudUsers",
              !settings.autoBanFraudUsers
            )
          }
        />

      </div>

      {/* INPUTS */}

      <div className="mt-6 grid grid-cols-1 gap-5 md:grid-cols-2">

        <InputCard
          title="Max Login Attempts"
          value={
            settings.maxLoginAttempts
          }
          onChange={(value: string) =>
            updateField(
              "maxLoginAttempts",
              value
            )
          }
        />

        <InputCard
          title="Fraud Score Limit"
          value={
            settings.fraudScoreLimit
          }
          onChange={(value: string) =>
            updateField(
              "fraudScoreLimit",
              value
            )
          }
        />

      </div>

      {/* STATUS */}

      <div className="mt-6 rounded-[30px] bg-gradient-to-r from-[var(--primary-color)] to-[var(--primary-color)] p-6">

        <div className="flex items-center gap-3">

          <Eye size={28} />

          <h2 className="text-3xl font-black">
            Security Status
          </h2>

        </div>

        <div className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-2">

          <StatusCard
            title="VPN Protection"
            value={
              settings.blockVpnUsers
                ? "Enabled"
                : "Disabled"
            }
          />

          <StatusCard
            title="Device Tracking"
            value={
              settings.deviceTracking
                ? "Enabled"
                : "Disabled"
            }
          />

          <StatusCard
            title="Max Attempts"
            value={
              settings.maxLoginAttempts
            }
          />

          <StatusCard
            title="Fraud Score"
            value={
              settings.fraudScoreLimit
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
  onChange
}: {
  title: string;
  value: string;
  onChange: (
    value: string
  ) => void;
}) {

  return (

    <div className="rounded-[30px] bg-[var(--primary-color)] p-5">

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

    <div className="rounded-[30px] bg-[var(--primary-color)] p-5">

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
