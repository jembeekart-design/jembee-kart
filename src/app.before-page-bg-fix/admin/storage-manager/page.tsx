"use client";

export const dynamic = "force-dynamic";

import { useEffect, useState } from "react";

import {
  doc,
  getDoc,
  setDoc
} from "firebase/firestore";

import {
  HardDrive,
  Save,
  Image,
  Video,
  FileText,
  Trash2,
  Cloud,
  ShieldCheck
} from "lucide-react";

import { db } from "@/firebase/config";

interface StorageSettings {
  storageEnabled: boolean;
  imageUploads: boolean;
  videoUploads: boolean;
  documentUploads: boolean;
  autoCleanup: boolean;
  cloudStorage: boolean;
  maxFileSize: string;
  storageLimit: string;
}

export default function StorageManagerPage() {

  const [settings, setSettings] =
    useState<StorageSettings>({
      storageEnabled: true,
      imageUploads: true,
      videoUploads: true,
      documentUploads: true,
      autoCleanup: false,
      cloudStorage: true,
      maxFileSize: "50",
      storageLimit: "1000"
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
        "storage_manager"
      );

      const snap =
        await getDoc(ref);

      if (snap.exists()) {

        setSettings(
          snap.data() as StorageSettings
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
          "storage_manager"
        ),
        settings
      );

      alert(
        "Storage Settings Saved"
      );

    } catch (error) {

      console.log(error);

    } finally {

      setSaving(false);

    }
  }

  function updateField(
    field: keyof StorageSettings,
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

            <HardDrive size={30} />

          </div>

          <div>

            <h1 className="text-3xl font-black">
              Storage Manager
            </h1>

            <p className="mt-1 text-sm text-[var(--muted-text-color)]">
              Manage uploads & cloud storage
            </p>

          </div>

        </div>

        <button
          onClick={saveSettings}
          disabled={saving}
          className="flex items-center gap-2 rounded-2xl bg-[var(--primary-color)] px-5 py-3 font-bold text-[var(--text-color)]"
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
          title="Storage System"
          description="Enable storage manager"
          icon={
            <HardDrive size={24} />
          }
          enabled={
            settings.storageEnabled
          }
          onClick={() =>
            updateField(
              "storageEnabled",
              !settings.storageEnabled
            )
          }
        />

        <ToggleCard
          title="Image Uploads"
          description="Allow image uploads"
          icon={
            <Image size={24} />
          }
          enabled={
            settings.imageUploads
          }
          onClick={() =>
            updateField(
              "imageUploads",
              !settings.imageUploads
            )
          }
        />

        <ToggleCard
          title="Video Uploads"
          description="Allow video uploads"
          icon={
            <Video size={24} />
          }
          enabled={
            settings.videoUploads
          }
          onClick={() =>
            updateField(
              "videoUploads",
              !settings.videoUploads
            )
          }
        />

        <ToggleCard
          title="Document Uploads"
          description="Allow file uploads"
          icon={
            <FileText size={24} />
          }
          enabled={
            settings.documentUploads
          }
          onClick={() =>
            updateField(
              "documentUploads",
              !settings.documentUploads
            )
          }
        />

        <ToggleCard
          title="Auto Cleanup"
          description="Delete unused files"
          icon={
            <Trash2 size={24} />
          }
          enabled={
            settings.autoCleanup
          }
          onClick={() =>
            updateField(
              "autoCleanup",
              !settings.autoCleanup
            )
          }
        />

        <ToggleCard
          title="Cloud Storage"
          description="Enable cloud sync"
          icon={
            <Cloud size={24} />
          }
          enabled={
            settings.cloudStorage
          }
          onClick={() =>
            updateField(
              "cloudStorage",
              !settings.cloudStorage
            )
          }
        />

      </div>

      {/* INPUTS */}

      <div className="mt-6 grid grid-cols-1 gap-5 md:grid-cols-2">

        <InputCard
          title="Max File Size (MB)"
          value={
            settings.maxFileSize
          }
          onChange={(value: string) =>
            updateField(
              "maxFileSize",
              value
            )
          }
        />

        <InputCard
          title="Storage Limit (GB)"
          value={
            settings.storageLimit
          }
          onChange={(value: string) =>
            updateField(
              "storageLimit",
              value
            )
          }
        />

      </div>

      {/* STATUS */}

      <div className="mt-6 rounded-[30px] bg-gradient-to-r from-[var(--primary-color)] to-[var(--primary-color)] p-6">

        <div className="flex items-center gap-3">

          <ShieldCheck size={28} />

          <h2 className="text-3xl font-black text-[var(--text-color)]">
            Storage Status
          </h2>

        </div>

        <div className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-2">

          <StatusCard
            title="Cloud Storage"
            value={
              settings.cloudStorage
                ? "Enabled"
                : "Disabled"
            }
          />

          <StatusCard
            title="Max File Size"
            value={`${settings.maxFileSize} MB`}
          />

          <StatusCard
            title="Storage Limit"
            value={`${settings.storageLimit} GB`}
          />

          <StatusCard
            title="Auto Cleanup"
            value={
              settings.autoCleanup
                ? "Enabled"
                : "Disabled"
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

      <p className="text-sm text-[var(--text-color)]/70">
        {title}
      </p>

      <h3 className="mt-2 text-2xl font-black text-[var(--text-color)]">
        {value}
      </h3>

    </div>

  );
}
