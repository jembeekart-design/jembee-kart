"use client";

export const dynamic = "force-dynamic";

import { useEffect, useState } from "react";

import {
  doc,
  getDoc,
  setDoc
} from "firebase/firestore";

import {
  Settings2,
  Save,
  Globe,
  Smartphone,
  Shield,
  Bell,
  Moon,
  Sun
} from "lucide-react";

import { auth, db } from "@/firebase/config";
import { useRouter } from "next/navigation";

interface AppConfig {
  appName: string;
  appVersion: string;
  appMode: string;
  darkMode: boolean;
  notifications: boolean;
  maintenanceMode: boolean;
  appUrl: string;
  supportEmail: string;
}

export default function AppConfigPage() {
  const router = useRouter();

  const [settings, setSettings] =
    useState<AppConfig>({
      appName: "JembeeKart",
      appVersion: "1.0.0",
      appMode: "Production",
      darkMode: true,
      notifications: true,
      maintenanceMode: false,
      appUrl: "https://jembeekart.com",
      supportEmail: "support@jembeekart.com"
    });

  const [loading, setLoading] =
    useState(true);

  const [saving, setSaving] =
    useState(false);
  useEffect(() => {
  const unsubscribe = auth.onAuthStateChanged((user) => {
    if (!user) {
      router.replace("/login");
    }
  });

  return () => unsubscribe();
}, [router]);

  useEffect(() => {

    fetchSettings();

  }, []);

  async function fetchSettings() {

    try {

      const ref = doc(
        db,
        "admin_settings",
        "app_config"
      );

      const snap =
        await getDoc(ref);

      if (snap.exists()) {

        setSettings(
          snap.data() as AppConfig
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
          "app_config"
        ),
        settings
      );

      alert(
        "App Config Saved"
      );

    } catch (error) {

      console.log(error);

    } finally {

      setSaving(false);

    }
  }

  function updateField(
    field: keyof AppConfig,
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

          <div className="flex h-16 w-16 items-center justify-center rounded-[24px] bg-purple-500">

            <Settings2 size={30} />

          </div>

          <div>

            <h1 className="text-3xl font-black">
              App Config
            </h1>

            <p className="mt-1 text-sm text-gray-400">
              Global application configuration
            </p>

          </div>

        </div>

        <button
          onClick={saveSettings}
          disabled={saving}
          className="flex items-center gap-2 rounded-2xl bg-purple-500 px-5 py-3 font-bold"
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
          title="App Version"
          value={settings.appVersion}
          onChange={(value: string) =>
            updateField(
              "appVersion",
              value
            )
          }
        />

        <InputCard
          title="App Mode"
          value={settings.appMode}
          onChange={(value: string) =>
            updateField(
              "appMode",
              value
            )
          }
        />

        <InputCard
          title="Website URL"
          value={settings.appUrl}
          onChange={(value: string) =>
            updateField(
              "appUrl",
              value
            )
          }
        />

        <InputCard
          title="Support Email"
          value={
            settings.supportEmail
          }
          onChange={(value: string) =>
            updateField(
              "supportEmail",
              value
            )
          }
        />

      </div>

      {/* TOGGLES */}

      <div className="mt-6 grid grid-cols-1 gap-5 md:grid-cols-2">

        <ToggleCard
          title="Dark Mode"
          description="Enable dark UI"
          icon={
            settings.darkMode
              ? <Moon size={24} />
              : <Sun size={24} />
          }
          enabled={
            settings.darkMode
          }
          onClick={() =>
            updateField(
              "darkMode",
              !settings.darkMode
            )
          }
        />

        <ToggleCard
          title="Notifications"
          description="Enable notifications"
          icon={
            <Bell size={24} />
          }
          enabled={
            settings.notifications
          }
          onClick={() =>
            updateField(
              "notifications",
              !settings.notifications
            )
          }
        />

        <ToggleCard
          title="Maintenance Mode"
          description="Enable maintenance"
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

      {/* STATUS */}

      <div className="mt-6 rounded-[30px] bg-gradient-to-r from-purple-500 to-indigo-500 p-6">

        <div className="flex items-center gap-3">

          <Smartphone size={28} />

          <h2 className="text-3xl font-black">
            App Status
          </h2>

        </div>

        <div className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-2">

          <StatusCard
            title="App Name"
            value={settings.appName}
          />

          <StatusCard
            title="Version"
            value={settings.appVersion}
          />

          <StatusCard
            title="Mode"
            value={settings.appMode}
          />

          <StatusCard
            title="Dark Mode"
            value={
              settings.darkMode
                ? "Enabled"
                : "Disabled"
            }
          />

          <StatusCard
            title="Notifications"
            value={
              settings.notifications
                ? "Enabled"
                : "Disabled"
            }
          />

          <StatusCard
            title="Maintenance"
            value={
              settings.maintenanceMode
                ? "ON"
                : "OFF"
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
