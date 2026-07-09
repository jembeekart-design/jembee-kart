"use client";

export const dynamic = "force-dynamic";

import { useEffect, useState } from "react";

import {
  doc,
  getDoc,
  setDoc
} from "firebase/firestore";

import {
  Smartphone,
  Save,
  Bell,
  Shield,
  Globe,
  RefreshCcw
} from "lucide-react";

import { db } from "@/firebase/config";

interface MobileAppSettings {
  appName: string;
  packageName: string;
  version: string;
  forceUpdate: boolean;
  maintenanceMode: boolean;
  pushNotifications: boolean;
  appLink: string;
}

export default function MobileAppPage() {

  const [settings, setSettings] =
    useState<MobileAppSettings>({
      appName: "JembeeKart",
      packageName:
        "com.jembeekart.app",
      version: "1.0.0",
      forceUpdate: false,
      maintenanceMode: false,
      pushNotifications: true,
      appLink: ""
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
        "mobile_app"
      );

      const snap =
        await getDoc(ref);

      if (snap.exists()) {

        setSettings(
          snap.data() as MobileAppSettings
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
          "mobile_app"
        ),
        settings
      );

      alert(
        "Mobile App Settings Saved"
      );

    } catch (error) {

      console.log(error);

    } finally {

      setSaving(false);

    }
  }

  function updateField(
    field: keyof MobileAppSettings,
    value: any
  ) {

    setSettings((prev) => ({
      ...prev,
      [field]: value
    }));
  }

  if (loading) {

    return (

      <div className="flex min-h-screen items-center justify-center bg-black text-[var(--button-text-color)]">

        Loading...

      </div>

    );
  }

  return (

    <main className="min-h-screen bg-[#0b0b0b] p-4 text-[var(--button-text-color)]">

      {/* HEADER */}

      <div className="mb-8 flex items-center justify-between">

        <div className="flex items-center gap-4">

          <div className="flex h-16 w-16 items-center justify-center rounded-[24px] bg-[var(--success-color)]">

            <Smartphone size={30} />

          </div>

          <div>

            <h1 className="text-3xl font-black">
              Mobile App Control
            </h1>

            <p className="mt-1 text-sm text-gray-400">
              Manage Android app settings
            </p>

          </div>

        </div>

        <button
          onClick={saveSettings}
          disabled={saving}
          className="flex items-center gap-2 rounded-2xl bg-[var(--success-color)] px-5 py-3 font-bold"
        >

          <Save size={18} />

          {saving
            ? "Saving..."
            : "Save"}

        </button>

      </div>

      {/* SETTINGS */}

      <div className="grid grid-cols-1 gap-5 md:grid-cols-2">

        <InputCard
          title="App Name"
          value={settings.appName}
          onChange={(value: string) =>
            updateField(
              "appName",
              value
            )
          }
        />

        <InputCard
          title="Package Name"
          value={
            settings.packageName
          }
          onChange={(value: string) =>
            updateField(
              "packageName",
              value
            )
          }
        />

        <InputCard
          title="App Version"
          value={settings.version}
          onChange={(value: string) =>
            updateField(
              "version",
              value
            )
          }
        />

        <InputCard
          title="Play Store Link"
          value={settings.appLink}
          onChange={(value: string) =>
            updateField(
              "appLink",
              value
            )
          }
        />

      </div>

      {/* TOGGLES */}

      <div className="mt-6 grid grid-cols-1 gap-5 md:grid-cols-3">

        <ToggleCard
          title="Force Update"
          description="Users must update app"
          icon={
            <RefreshCcw size={24} />
          }
          enabled={
            settings.forceUpdate
          }
          onClick={() =>
            updateField(
              "forceUpdate",
              !settings.forceUpdate
            )
          }
        />

        <ToggleCard
          title="Push Notifications"
          description="Enable app notifications"
          icon={
            <Bell size={24} />
          }
          enabled={
            settings.pushNotifications
          }
          onClick={() =>
            updateField(
              "pushNotifications",
              !settings.pushNotifications
            )
          }
        />

        <ToggleCard
          title="Maintenance Mode"
          description="Temporarily disable app"
          icon={
            <Shield size={24} />
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

      {/* LIVE PREVIEW */}

      <div className="mt-6 rounded-[30px] bg-gradient-to-r from-green-500 to-emerald-600 p-6">

        <div className="flex items-center gap-4">

          <div className="flex h-20 w-20 items-center justify-center rounded-[24px] bg-[var(--card-color)]/20">

            <Smartphone size={40} />

          </div>

          <div>

            <h2 className="text-4xl font-black">
              {settings.appName}
            </h2>

            <p className="mt-2 text-[var(--button-text-color)]/80">
              Version:
              {" "}
              {settings.version}
            </p>

          </div>

        </div>

        <div className="mt-6 flex flex-wrap gap-3">

          <PreviewBadge
            title={
              settings.forceUpdate
                ? "Force Update ON"
                : "Force Update OFF"
            }
          />

          <PreviewBadge
            title={
              settings.pushNotifications
                ? "Notifications ON"
                : "Notifications OFF"
            }
          />

          <PreviewBadge
            title={
              settings.maintenanceMode
                ? "Maintenance ON"
                : "Maintenance OFF"
            }
          />

        </div>

        <div className="mt-6 flex items-center gap-3 text-sm text-[var(--button-text-color)]/80">

          <Globe size={18} />

          {settings.appLink ||
            "No Play Store Link"}

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

function PreviewBadge({
  title
}: {
  title: string;
}) {

  return (

    <div className="rounded-full bg-[var(--card-color)]/20 px-5 py-3 text-sm font-bold backdrop-blur-lg">

      {title}

    </div>

  );
}
