"use client";

export const dynamic = "force-dynamic";

import { useEffect, useState } from "react";

import {
  doc,
  getDoc,
  setDoc
} from "firebase/firestore";

import {
  Mail,
  Save,
  Send,
  Shield,
  CheckCircle,
  AlertCircle
} from "lucide-react";

import { db } from "@/firebase/config";

interface EmailSettings {
  smtpHost: string;
  smtpPort: string;
  smtpEmail: string;
  smtpPassword: string;
  senderName: string;
  secureConnection: boolean;
  emailNotifications: boolean;
}

export default function EmailPage() {

  const [settings, setSettings] =
    useState<EmailSettings>({
      smtpHost: "",
      smtpPort: "587",
      smtpEmail: "",
      smtpPassword: "",
      senderName: "JembeeKart",
      secureConnection: true,
      emailNotifications: true
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
        "email"
      );

      const snap =
        await getDoc(ref);

      if (snap.exists()) {

        setSettings(
          snap.data() as EmailSettings
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
          "email"
        ),
        settings
      );

      alert(
        "Email Settings Saved"
      );

    } catch (error) {

      console.log(error);

    } finally {

      setSaving(false);

    }
  }

  function updateField(
    field: keyof EmailSettings,
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

            <Mail size={30} />

          </div>

          <div>

            <h1 className="text-3xl font-black">
              Email Settings
            </h1>

            <p className="mt-1 text-sm text-gray-400">
              Configure SMTP & mail system
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

      {/* INPUTS */}

      <div className="grid grid-cols-1 gap-5 md:grid-cols-2">

        <InputCard
          title="SMTP Host"
          value={
            settings.smtpHost
          }
          onChange={(value: string) =>
            updateField(
              "smtpHost",
              value
            )
          }
        />

        <InputCard
          title="SMTP Port"
          value={
            settings.smtpPort
          }
          onChange={(value: string) =>
            updateField(
              "smtpPort",
              value
            )
          }
        />

        <InputCard
          title="SMTP Email"
          value={
            settings.smtpEmail
          }
          onChange={(value: string) =>
            updateField(
              "smtpEmail",
              value
            )
          }
        />

        <InputCard
          title="SMTP Password"
          value={
            settings.smtpPassword
          }
          onChange={(value: string) =>
            updateField(
              "smtpPassword",
              value
            )
          }
        />

        <InputCard
          title="Sender Name"
          value={
            settings.senderName
          }
          onChange={(value: string) =>
            updateField(
              "senderName",
              value
            )
          }
        />

      </div>

      {/* TOGGLES */}

      <div className="mt-6 grid grid-cols-1 gap-5 md:grid-cols-2">

        <ToggleCard
          title="Secure Connection"
          description="Enable SSL/TLS protection"
          enabled={
            settings.secureConnection
          }
          icon={
            <Shield size={24} />
          }
          onClick={() =>
            updateField(
              "secureConnection",
              !settings.secureConnection
            )
          }
        />

        <ToggleCard
          title="Email Notifications"
          description="Send automated emails"
          enabled={
            settings.emailNotifications
          }
          icon={
            <Send size={24} />
          }
          onClick={() =>
            updateField(
              "emailNotifications",
              !settings.emailNotifications
            )
          }
        />

      </div>

      {/* STATUS */}

      <div className="mt-6 rounded-[30px] bg-gradient-to-r from-pink-500 to-rose-600 p-6">

        <div className="flex items-center gap-3">

          <CheckCircle size={28} />

          <h2 className="text-3xl font-black">
            Email Status
          </h2>

        </div>

        <div className="mt-6 space-y-4">

          <div className="rounded-2xl bg-white/10 p-4">

            <p className="text-sm text-white/70">
              SMTP Server
            </p>

            <h3 className="mt-2 text-xl font-black">

              {settings.smtpHost ||
                "Not Connected"}

            </h3>

          </div>

          <div className="rounded-2xl bg-white/10 p-4">

            <p className="text-sm text-white/70">
              Sender Email
            </p>

            <h3 className="mt-2 text-xl font-black">

              {settings.smtpEmail ||
                "No Email"}

            </h3>

          </div>

          <div className="rounded-2xl bg-white/10 p-4">

            <p className="text-sm text-white/70">
              Security
            </p>

            <h3 className="mt-2 text-xl font-black">

              {settings.secureConnection
                ? "Protected"
                : "Disabled"}

            </h3>

          </div>

          <div className="rounded-2xl bg-white/10 p-4">

            <div className="flex items-center gap-3">

              <AlertCircle size={20} />

              <p className="font-bold">

                {settings.emailNotifications
                  ? "Email Notifications Enabled"
                  : "Email Notifications Disabled"}

              </p>

            </div>

          </div>

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
