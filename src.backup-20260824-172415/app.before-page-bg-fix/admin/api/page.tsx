"use client";

export const dynamic = "force-dynamic";

import { useEffect, useState } from "react";

import {
  doc,
  getDoc,
  setDoc
} from "firebase/firestore";

import {
  Server,
  Save,
  Key,
  Globe,
  Shield,
  RefreshCcw,
  CheckCircle
} from "lucide-react";

import { db } from "@/firebase/config";

interface APISettings {
  apiUrl: string;
  apiKey: string;
  webhookUrl: string;
  apiVersion: string;
  maintenanceMode: boolean;
  secureAPI: boolean;
}

export default function APIPage() {

  const [settings, setSettings] =
    useState<APISettings>({
      apiUrl: "",
      apiKey: "",
      webhookUrl: "",
      apiVersion: "v1",
      maintenanceMode: false,
      secureAPI: true
    });

  const [loading, setLoading] =
    useState(true);

  const [saving, setSaving] =
    useState(false);

  useEffect(() => {

    fetchAPISettings();

  }, []);

  async function fetchAPISettings() {

    try {

      const ref = doc(
        db,
        "admin_settings",
        "api_settings"
      );

      const snap =
        await getDoc(ref);

      if (snap.exists()) {

        setSettings(
          snap.data() as APISettings
        );

      }

    } catch (error) {

      console.log(error);

    } finally {

      setLoading(false);

    }
  }

  async function saveAPISettings() {

    try {

      setSaving(true);

      await setDoc(
        doc(
          db,
          "admin_settings",
          "api_settings"
        ),
        settings
      );

      alert(
        "API Settings Saved"
      );

    } catch (error) {

      console.log(error);

    } finally {

      setSaving(false);

    }
  }

  function updateField(
    field: keyof APISettings,
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

          <div className="flex h-16 w-16 items-center justify-center rounded-[24px] bg-[var(--primary-color)]">

            <Server size={30} />

          </div>

          <div>

            <h1 className="text-3xl font-black">
              API Manager
            </h1>

            <p className="mt-1 text-sm text-[var(--muted-text-color)]">
              Manage backend API settings
            </p>

          </div>

        </div>

        <button
          onClick={saveAPISettings}
          disabled={saving}
          className="flex items-center gap-2 rounded-2xl bg-[var(--primary-color)] px-5 py-3 font-bold"
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
          title="API URL"
          icon={
            <Globe size={22} />
          }
          value={settings.apiUrl}
          onChange={(value: string) =>
            updateField(
              "apiUrl",
              value
            )
          }
        />

        <InputCard
          title="API Key"
          icon={
            <Key size={22} />
          }
          value={settings.apiKey}
          onChange={(value: string) =>
            updateField(
              "apiKey",
              value
            )
          }
        />

        <InputCard
          title="Webhook URL"
          icon={
            <RefreshCcw size={22} />
          }
          value={
            settings.webhookUrl
          }
          onChange={(value: string) =>
            updateField(
              "webhookUrl",
              value
            )
          }
        />

        <InputCard
          title="API Version"
          icon={
            <Server size={22} />
          }
          value={
            settings.apiVersion
          }
          onChange={(value: string) =>
            updateField(
              "apiVersion",
              value
            )
          }
        />

      </div>

      {/* TOGGLES */}

      <div className="mt-6 grid grid-cols-1 gap-5 md:grid-cols-2">

        <ToggleCard
          title="Secure API"
          description="Enable API protection"
          icon={
            <Shield size={24} />
          }
          enabled={
            settings.secureAPI
          }
          onClick={() =>
            updateField(
              "secureAPI",
              !settings.secureAPI
            )
          }
        />

        <ToggleCard
          title="Maintenance Mode"
          description="Disable API temporarily"
          icon={
            <RefreshCcw size={24} />
          }
          enabled={
            settings.maintenanceMode
          }
          onClick={() =>
            updateField(
              "maintenanceMode",
              !settings.maintenanceMode
            )
          }
        />

      </div>

      {/* STATUS */}

      <div className="mt-6 rounded-[30px] bg-gradient-to-r from-[var(--primary-color)] to-[var(--primary-color)] p-6">

        <div className="flex items-center gap-3">

          <CheckCircle size={28} />

          <h2 className="text-3xl font-black">
            API Status
          </h2>

        </div>

        <div className="mt-6 space-y-3">

          <p className="text-[var(--button-text-color)]/90">
            🌐 URL:
            {" "}
            {settings.apiUrl ||
              "Not Set"}
          </p>

          <p className="text-[var(--button-text-color)]/90">
            🔑 API Key:
            {" "}
            {settings.apiKey
              ? "Configured"
              : "Missing"}
          </p>

          <p className="text-[var(--button-text-color)]/90">
            ⚡ Version:
            {" "}
            {settings.apiVersion}
          </p>

          <p className="text-[var(--button-text-color)]/90">
            🔄 Webhook:
            {" "}
            {settings.webhookUrl ||
              "Not Configured"}
          </p>

          <p className="text-[var(--button-text-color)]/90">
            🛡️ Security:
            {" "}
            {settings.secureAPI
              ? "Enabled"
              : "Disabled"}
          </p>

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

    <div className="rounded-[30px] bg-[var(--primary-color)] p-5">

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
