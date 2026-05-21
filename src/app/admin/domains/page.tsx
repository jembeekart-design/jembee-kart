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
  AlertTriangle,
  ExternalLink
} from "lucide-react";

import { db } from "@/firebase/config";

interface DomainSettings {
  mainDomain: string;
  adminDomain: string;
  apiDomain: string;
  customDomainEnabled: boolean;
  sslEnabled: boolean;
}

export default function DomainsPage() {

  const [settings, setSettings] =
    useState<DomainSettings>({
      mainDomain: "",
      adminDomain: "",
      apiDomain: "",
      customDomainEnabled: true,
      sslEnabled: true
    });

  const [loading, setLoading] =
    useState(true);

  const [saving, setSaving] =
    useState(false);

  useEffect(() => {

    fetchDomains();

  }, []);

  async function fetchDomains() {

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

  async function saveDomains() {

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

          <div className="flex h-16 w-16 items-center justify-center rounded-[24px] bg-cyan-500">

            <Globe size={30} />

          </div>

          <div>

            <h1 className="text-3xl font-black">
              Domain Manager
            </h1>

            <p className="mt-1 text-sm text-gray-400">
              Manage website & API domains
            </p>

          </div>

        </div>

        <button
          onClick={saveDomains}
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

        <DomainCard
          title="Main Website Domain"
          value={
            settings.mainDomain
          }
          onChange={(value) =>
            updateField(
              "mainDomain",
              value
            )
          }
        />

        <DomainCard
          title="Admin Domain"
          value={
            settings.adminDomain
          }
          onChange={(value) =>
            updateField(
              "adminDomain",
              value
            )
          }
        />

        <DomainCard
          title="API Domain"
          value={
            settings.apiDomain
          }
          onChange={(value) =>
            updateField(
              "apiDomain",
              value
            )
          }
        />

      </div>

      {/* SETTINGS */}

      <div className="mt-6 grid grid-cols-1 gap-5 md:grid-cols-2">

        {/* CUSTOM DOMAIN */}

        <ToggleCard
          title="Custom Domain"
          description="Enable custom connected domains"
          icon={
            <Link2 size={24} />
          }
          enabled={
            settings.customDomainEnabled
          }
          onClick={() =>
            updateField(
              "customDomainEnabled",
              !settings.customDomainEnabled
            )
          }
        />

        {/* SSL */}

        <ToggleCard
          title="SSL Security"
          description="Enable HTTPS SSL encryption"
          icon={
            <Shield size={24} />
          }
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

      </div>

      {/* STATUS */}

      <div className="mt-6 grid grid-cols-1 gap-5 md:grid-cols-3">

        <StatusCard
          title="Main Domain"
          value="Connected"
          icon={
            <CheckCircle
              size={26}
            />
          }
          color="bg-green-500"
        />

        <StatusCard
          title="SSL Status"
          value={
            settings.sslEnabled
              ? "Protected"
              : "Disabled"
          }
          icon={
            settings.sslEnabled
              ? (
                <Shield
                  size={26}
                />
              )
              : (
                <AlertTriangle
                  size={26}
                />
              )
          }
          color={
            settings.sslEnabled
              ? "bg-cyan-500"
              : "bg-red-500"
          }
        />

        <StatusCard
          title="API Access"
          value="Online"
          icon={
            <ExternalLink
              size={26}
            />
          }
          color="bg-violet-600"
        />

      </div>

      {/* LIVE PREVIEW */}

      <div className="mt-6 rounded-[30px] bg-gradient-to-r from-cyan-500 to-blue-600 p-6">

        <h2 className="text-3xl font-black">
          Connected Domains
        </h2>

        <div className="mt-6 space-y-3 text-white/90">

          <p>
            🌐
            {" "}
            {settings.mainDomain ||
              "No Main Domain"}
          </p>

          <p>
            🛠️
            {" "}
            {settings.adminDomain ||
              "No Admin Domain"}
          </p>

          <p>
            ⚡
            {" "}
            {settings.apiDomain ||
              "No API Domain"}
          </p>

        </div>

      </div>

    </main>

  );
}

function DomainCard({
  title,
  value,
  onChange
}: any) {

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
        placeholder="https://example.com"
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
}: any) {

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
  value,
  icon,
  color
}: any) {

  return (

    <div className="rounded-[30px] bg-[#151515] p-5">

      <div className="flex items-center justify-between">

        <div>

          <p className="text-sm text-gray-400">
            {title}
          </p>

          <h2 className="mt-2 text-2xl font-black">
            {value}
          </h2>

        </div>

        <div
          className={`flex h-14 w-14 items-center justify-center rounded-2xl ${color}`}
        >

          {icon}

        </div>

      </div>

    </div>

  );
}
