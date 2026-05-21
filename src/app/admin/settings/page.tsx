"use client";

export const dynamic = "force-dynamic";

import { useEffect, useState } from "react";

import {
  doc,
  getDoc,
  setDoc
} from "firebase/firestore";

import {
  Save,
  Settings,
  Globe,
  Phone,
  Mail,
  MapPin,
  Facebook,
  Instagram,
  Play
} from "lucide-react";

import { db } from "@/firebase/config";

interface AppSettings {
  appName: string;
  supportEmail: string;
  supportPhone: string;
  address: string;
  website: string;
  facebook: string;
  instagram: string;
  youtube: string;
  currency: string;
  deliveryCharge: string;
}

export default function SettingsPage() {

  const [settings, setSettings] =
    useState<AppSettings>({
      appName: "JembeeKart",
      supportEmail: "",
      supportPhone: "",
      address: "",
      website: "",
      facebook: "",
      instagram: "",
      youtube: "",
      currency: "₹",
      deliveryCharge: "0"
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
        "settings",
        "app_settings"
      );

      const snapshot =
        await getDoc(ref);

      if (snapshot.exists()) {

        setSettings(
          snapshot.data() as AppSettings
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
          "settings",
          "app_settings"
        ),
        settings
      );

      alert(
        "Settings Saved Successfully"
      );

    } catch (error) {

      console.log(error);

    } finally {

      setSaving(false);

    }
  }

  function handleChange(
    field: string,
    value: string
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

      <div className="mb-6 flex items-center justify-between">

        <div>

          <h1 className="text-3xl font-black">
            App Settings
          </h1>

          <p className="mt-2 text-sm text-gray-400">
            Manage application settings
          </p>

        </div>

        <button
          onClick={saveSettings}
          disabled={saving}
          className="flex items-center gap-2 rounded-2xl bg-violet-600 px-5 py-3 text-sm font-bold text-white"
        >

          <Save size={18} />

          {saving
            ? "Saving..."
            : "Save Settings"}

        </button>

      </div>

      {/* SETTINGS */}

      <div className="space-y-5">

        {/* GENERAL */}

        <div className="rounded-[30px] border border-white/10 bg-[#151515] p-5">

          <div className="mb-5 flex items-center gap-3">

            <Settings
              size={22}
              className="text-violet-400"
            />

            <h2 className="text-2xl font-black">
              General Settings
            </h2>

          </div>

          <div className="space-y-4">

            <InputField
              label="App Name"
              value={settings.appName}
              onChange={(value) =>
                handleChange(
                  "appName",
                  value
                )
              }
            />

            <InputField
              label="Currency Symbol"
              value={settings.currency}
              onChange={(value) =>
                handleChange(
                  "currency",
                  value
                )
              }
            />

            <InputField
              label="Delivery Charge"
              value={
                settings.deliveryCharge
              }
              onChange={(value) =>
                handleChange(
                  "deliveryCharge",
                  value
                )
              }
            />

          </div>

        </div>

        {/* CONTACT */}

        <div className="rounded-[30px] border border-white/10 bg-[#151515] p-5">

          <div className="mb-5 flex items-center gap-3">

            <Phone
              size={22}
              className="text-green-400"
            />

            <h2 className="text-2xl font-black">
              Contact Settings
            </h2>

          </div>

          <div className="space-y-4">

            <InputField
              label="Support Email"
              value={
                settings.supportEmail
              }
              onChange={(value) =>
                handleChange(
                  "supportEmail",
                  value
                )
              }
            />

            <InputField
              label="Support Phone"
              value={
                settings.supportPhone
              }
              onChange={(value) =>
                handleChange(
                  "supportPhone",
                  value
                )
              }
            />

            <InputField
              label="Address"
              value={settings.address}
              onChange={(value) =>
                handleChange(
                  "address",
                  value
                )
              }
            />

            <InputField
              label="Website"
              value={settings.website}
              onChange={(value) =>
                handleChange(
                  "website",
                  value
                )
              }
            />

          </div>

        </div>

        {/* SOCIAL */}

        <div className="rounded-[30px] border border-white/10 bg-[#151515] p-5">

          <div className="mb-5 flex items-center gap-3">

            <Globe
              size={22}
              className="text-pink-400"
            />

            <h2 className="text-2xl font-black">
              Social Media
            </h2>

          </div>

          <div className="space-y-4">

            <InputField
              label="Facebook Link"
              value={settings.facebook}
              onChange={(value) =>
                handleChange(
                  "facebook",
                  value
                )
              }
            />

            <InputField
              label="Instagram Link"
              value={
                settings.instagram
              }
              onChange={(value) =>
                handleChange(
                  "instagram",
                  value
                )
              }
            />

            <InputField
              label="Youtube Link"
              value={settings.youtube}
              onChange={(value) =>
                handleChange(
                  "youtube",
                  value
                )
              }
            />

          </div>

        </div>

        {/* LIVE PREVIEW */}

        <div className="overflow-hidden rounded-[30px] bg-gradient-to-r from-violet-600 to-fuchsia-500 p-6">

          <h2 className="text-3xl font-black">
            {settings.appName}
          </h2>

          <p className="mt-2 text-white/80">
            Live Settings Preview
          </p>

          <div className="mt-6 grid grid-cols-2 gap-4">

            <div className="rounded-2xl bg-white/10 p-4">

              <div className="flex items-center gap-2">

                <Mail size={18} />

                <p className="text-sm font-bold">
                  Email
                </p>

              </div>

              <p className="mt-2 text-sm break-all">
                {
                  settings.supportEmail
                }
              </p>

            </div>

            <div className="rounded-2xl bg-white/10 p-4">

              <div className="flex items-center gap-2">

                <Phone size={18} />

                <p className="text-sm font-bold">
                  Phone
                </p>

              </div>

              <p className="mt-2 text-sm">
                {
                  settings.supportPhone
                }
              </p>

            </div>

            <div className="rounded-2xl bg-white/10 p-4">

              <div className="flex items-center gap-2">

                <MapPin size={18} />

                <p className="text-sm font-bold">
                  Address
                </p>

              </div>

              <p className="mt-2 text-sm">
                {settings.address}
              </p>

            </div>

            <div className="rounded-2xl bg-white/10 p-4">

              <div className="flex items-center gap-2">

                <Globe size={18} />

                <p className="text-sm font-bold">
                  Website
                </p>

              </div>

              <p className="mt-2 text-sm break-all">
                {settings.website}
              </p>

            </div>

          </div>

          {/* SOCIAL ICONS */}

          <div className="mt-6 flex items-center gap-4">

            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-white/20">

              <Facebook size={20} />

            </div>

            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-white/20">

              <Instagram size={20} />

            </div>

            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-white/20">

              <Play size={20} />

            </div>

          </div>

        </div>

      </div>

    </main>
  );
}

function InputField({
  label,
  value,
  onChange
}: {
  label: string;
  value: string;
  onChange: (
    value: string
  ) => void;
}) {

  return (

    <div>

      <p className="mb-2 text-sm font-bold">
        {label}
      </p>

      <input
        type="text"
        value={value}
        onChange={(e) =>
          onChange(
            e.target.value
          )
        }
        className="w-full rounded-2xl border border-white/10 bg-[#1e1e1e] px-4 py-3 text-sm text-white outline-none"
      />

    </div>

  );
}
