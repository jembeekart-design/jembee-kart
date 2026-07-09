"use client";

export const dynamic = "force-dynamic";

import { useEffect, useState } from "react";

import {
  doc,
  getDoc,
  setDoc
} from "firebase/firestore";

import {
  Globe,
  Save,
  Shield,
  Link2,
  CheckCircle,
  Server
} from "lucide-react";

import { db } from "@/firebase/config";

interface DomainSettings {
  mainDomain: string;
  adminDomain: string;
  apiDomain: string;
  sslEnabled: boolean;
  maintenanceMode: boolean;
}

export default function DomainsPage() {

  const [settings, setSettings] =
    useState<DomainSettings>({
      mainDomain: "",
      adminDomain: "",
      apiDomain: "",
      sslEnabled: true,
      maintenanceMode: false
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
        "domains"
      );

      const snap =
        await getDoc(ref);

      if (snap.exists()) {

        setSettings(
          snap.data() as DomainSettings
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
          "domains"
        ),
        settings
      );

      alert(
        "Domain Settings Saved"
      );

    } catch (error) {

      console.log(error);

    } finally {

      setSaving(false);

    }
  }

  function updateField(
    field: keyof DomainSettings,
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

          <div className="flex h-16 w-16 items-center justify-center rounded-[24px] bg-cyan-500">

            <Globe size={30} />

          </div>

          <div>

            <h1 className="text-3xl font-black">
              Domain Manager
            </h1>

            <p className="mt-1 text-sm text-gray-400">
              Manage website domains
            </p>

          </div>

        </div>

        <button
          onClick={saveSettings}
          disabled={saving}
          className="flex items-center gap-2 rounded-2xl bg-cyan-500 px-5 py-3 font-bold"
        >

          <Save size={18} />

          {saving
            ? "Saving..."
            : "Save"}

        </button>

      </div>

      {/* DOMAIN INPUTS */}

      <div className="grid grid-cols-1 gap-5 md:grid-cols-2">

        <InputCard
          title="Main Website Domain"
          icon={
            <Globe size={22} />
          }
          value={
            settings.mainDomain
          }
          onChange={(value: string) =>
            updateField(
              "mainDomain",
              value
            )
          }
        />

        <InputCard
          title="Admin Panel Domain"
          icon={
            <Shield size={22} />
          }
          value={
            settings.adminDomain
          }
          onChange={(value: string) =>
            updateField(
              "adminDomain",
              value
            )
          }
        />

        <InputCard
          title="API Domain"
          icon={
            <Server size={22} />
          }
          value={
            settings.apiDomain
          }
          onChange={(value: string) =>
            updateField(
              "apiDomain",
              value
            )
          }
        />

      </div>

      {/* TOGGLES */}

      <div className="mt-6 grid grid-cols-1 gap-5 md:grid-cols-2">

        <ToggleCard
          title="SSL Protection"
          description="Enable HTTPS security"
          enabled={
            settings.sslEnabled
          }
          onClick={() =>
            updateField(
              "sslEnabled",
              !settings.sslEnabled
            )
          }
        />

        <ToggleCard
          title="Maintenance Mode"
          description="Temporarily disable domains"
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

      {/* LIVE STATUS */}

      <div className="mt-6 rounded-[30px] bg-gradient-to-r from-cyan-500 to-blue-600 p-6">

        <div className="flex items-center gap-3">

          <CheckCircle size={28} />

          <h2 className="text-3xl font-black">
            Domain Status
          </h2>

        </div>

        <div className="mt-6 space-y-4">

          <div className="rounded-2xl bg-[var(--card-color)]/10 p-4">

            <div className="flex items-center gap-3">

              <Link2 size={20} />

              <div>

                <p className="font-bold">
                  Main Domain
                </p>

                <p className="text-sm text-[var(--button-text-color)]/80">
                  {settings.mainDomain ||
                    "Not Configured"}
                </p>

              </div>

            </div>

          </div>

          <div className="rounded-2xl bg-[var(--card-color)]/10 p-4">

            <div className="flex items-center gap-3">

              <Shield size={20} />

              <div>

                <p className="font-bold">
                  Admin Domain
                </p>

                <p className="text-sm text-[var(--button-text-color)]/80">
                  {settings.adminDomain ||
                    "Not Configured"}
                </p>

              </div>

            </div>

          </div>

          <div className="rounded-2xl bg-[var(--card-color)]/10 p-4">

            <div className="flex items-center gap-3">

              <Server size={20} />

              <div>

                <p className="font-bold">
                  API Domain
                </p>

                <p className="text-sm text-[var(--button-text-color)]/80">
                  {settings.apiDomain ||
                    "Not Configured"}
                </p>

              </div>

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
        className="w-full rounded-2xl bg-black px-4 py-4 outline-none"
      />

    </div>

  );
}

function ToggleCard({
  title,
  description,
  enabled,
  onClick
}: {
  title: string;
  description: string;
  enabled: boolean;
  onClick: () => void;
}) {

  return (

    <div className="rounded-[30px] bg-[#151515] p-5">

      <div className="flex items-center justify-between">

        <div>

          <h2 className="text-2xl font-black">
            {title}
          </h2>

          <p className="mt-2 text-sm text-gray-400">
            {description}
          </p>

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
