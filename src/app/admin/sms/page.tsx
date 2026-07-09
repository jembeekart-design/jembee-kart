"use client";

export const dynamic = "force-dynamic";

import { useEffect, useState } from "react";

import {
  doc,
  getDoc,
  setDoc
} from "firebase/firestore";

import {
  MessageSquare,
  Save,
  Send,
  ShieldCheck,
  Smartphone,
  Bell
} from "lucide-react";

import { db } from "@/firebase/config";

interface SMSSettings {
  smsEnabled: boolean;
  otpEnabled: boolean;
  orderSmsEnabled: boolean;
  promotionalSmsEnabled: boolean;
  senderId: string;
  smsProvider: string;
  apiKey: string;
  testPhone: string;
}

export default function SMSPage() {

  const [settings, setSettings] =
    useState<SMSSettings>({
      smsEnabled: true,
      otpEnabled: true,
      orderSmsEnabled: true,
      promotionalSmsEnabled: false,
      senderId: "JEMBEE",
      smsProvider: "Fast2SMS",
      apiKey: "",
      testPhone: ""
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
        "sms_settings"
      );

      const snap =
        await getDoc(ref);

      if (snap.exists()) {

        setSettings(
          snap.data() as SMSSettings
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
          "sms_settings"
        ),
        settings
      );

      alert(
        "SMS Settings Saved"
      );

    } catch (error) {

      console.log(error);

    } finally {

      setSaving(false);

    }
  }

  function updateField(
    field: keyof SMSSettings,
    value: string | boolean
  ) {

    setSettings((prev) => ({
      ...prev,
      [field]: value
    }));

  }

  function sendTestSMS() {

    if (
      !settings.testPhone
    ) {

      alert(
        "Enter test phone number"
      );

      return;

    }

    alert(
      `Test SMS sent to ${settings.testPhone}`
    );

  }

  if (loading) {

    return (

      <div className="flex min-h-screen items-center justify-center bg-[var(--card-color)] text-[var(--button-text-color)]">

        Loading SMS Settings...

      </div>

    );
  }

  return (

    <main className="min-h-screen bg-[#0b0b0b] p-4 text-[var(--button-text-color)]">

      {/* HEADER */}

      <div className="mb-8 flex items-center justify-between">

        <div className="flex items-center gap-4">

          <div className="flex h-16 w-16 items-center justify-center rounded-[24px] bg-sky-500">

            <MessageSquare size={30} />

          </div>

          <div>

            <h1 className="text-3xl font-black">
              SMS & OTP System
            </h1>

            <p className="mt-1 text-sm text-[var(--muted-text-color)]">
              Manage SMS notifications & OTP
            </p>

          </div>

        </div>

        <button
          onClick={saveSettings}
          disabled={saving}
          className="flex items-center gap-2 rounded-2xl bg-sky-500 px-5 py-3 font-bold text-[var(--text-color)]"
        >

          <Save size={18} />

          {saving
            ? "Saving..."
            : "Save"}

        </button>

      </div>

      {/* INPUTS */}

      <div className="grid grid-cols-1 gap-5 md:grid-cols-2">

        <InputCard
          title="SMS Provider"
          value={
            settings.smsProvider
          }
          onChange={(value: string) =>
            updateField(
              "smsProvider",
              value
            )
          }
        />

        <InputCard
          title="Sender ID"
          value={
            settings.senderId
          }
          onChange={(value: string) =>
            updateField(
              "senderId",
              value
            )
          }
        />

        <InputCard
          title="API Key"
          value={
            settings.apiKey
          }
          onChange={(value: string) =>
            updateField(
              "apiKey",
              value
            )
          }
        />

        <InputCard
          title="Test Phone"
          value={
            settings.testPhone
          }
          onChange={(value: string) =>
            updateField(
              "testPhone",
              value
            )
          }
        />

      </div>

      {/* TOGGLES */}

      <div className="mt-6 grid grid-cols-1 gap-5 md:grid-cols-2">

        <ToggleCard
          title="SMS System"
          description="Enable SMS service"
          enabled={
            settings.smsEnabled
          }
          icon={
            <MessageSquare size={24} />
          }
          onClick={() =>
            updateField(
              "smsEnabled",
              !settings.smsEnabled
            )
          }
        />

        <ToggleCard
          title="OTP Verification"
          description="Enable OTP login"
          enabled={
            settings.otpEnabled
          }
          icon={
            <ShieldCheck size={24} />
          }
          onClick={() =>
            updateField(
              "otpEnabled",
              !settings.otpEnabled
            )
          }
        />

        <ToggleCard
          title="Order SMS"
          description="Send order updates"
          enabled={
            settings.orderSmsEnabled
          }
          icon={
            <Smartphone size={24} />
          }
          onClick={() =>
            updateField(
              "orderSmsEnabled",
              !settings.orderSmsEnabled
            )
          }
        />

        <ToggleCard
          title="Promotional SMS"
          description="Send marketing SMS"
          enabled={
            settings.promotionalSmsEnabled
          }
          icon={
            <Bell size={24} />
          }
          onClick={() =>
            updateField(
              "promotionalSmsEnabled",
              !settings.promotionalSmsEnabled
            )
          }
        />

      </div>

      {/* TEST SECTION */}

      <div className="mt-6 rounded-[30px] bg-gradient-to-r from-sky-500 to-cyan-500 p-6">

        <h2 className="text-3xl font-black text-[var(--text-color)]">
          Test SMS
        </h2>

        <p className="mt-2 text-[var(--text-color)]/70">
          Send a test message to verify SMS setup
        </p>

        <button
          onClick={sendTestSMS}
          className="mt-6 flex items-center gap-2 rounded-2xl bg-[var(--card-color)] px-5 py-4 font-bold text-[var(--button-text-color)]"
        >

          <Send size={18} />

          Send Test SMS

        </button>

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
  enabled,
  icon,
  onClick
}: {
  title: string;
  description: string;
  enabled: boolean;
  icon: React.ReactNode;
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
              ? "bg-[var(--success-color)] text-[var(--text-color)]"
              : "bg-[var(--danger-color)] text-[var(--button-text-color)]"
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
