"use client";

export const dynamic = "force-dynamic";

import { useEffect, useState } from "react";

import {
  doc,
  getDoc,
  setDoc
} from "firebase/firestore";

import {
  Database,
  Download,
  Upload,
  Save,
  RefreshCcw,
  ShieldCheck,
  Clock3,
  HardDrive
} from "lucide-react";

import { db } from "@/firebase/config";

interface BackupSettings {
  autoBackup: boolean;
  cloudBackup: boolean;
  realtimeSync: boolean;
  restoreProtection: boolean;
  backupFrequency: string;
  lastBackup: string;
  backupLocation: string;
}

export default function BackupRestorePage() {

  const [settings, setSettings] =
    useState<BackupSettings>({
      autoBackup: true,
      cloudBackup: true,
      realtimeSync: true,
      restoreProtection: true,
      backupFrequency: "Daily",
      lastBackup: "Not Available",
      backupLocation: "Firebase Cloud"
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
        "backup_restore"
      );

      const snap =
        await getDoc(ref);

      if (snap.exists()) {

        setSettings(
          snap.data() as BackupSettings
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
          "backup_restore"
        ),
        settings
      );

      alert(
        "Backup Settings Saved"
      );

    } catch (error) {

      console.log(error);

    } finally {

      setSaving(false);

    }
  }

  function updateField(
    field: keyof BackupSettings,
    value: any
  ) {

    setSettings((prev) => ({
      ...prev,
      [field]: value
    }));

  }

  function createBackup() {

    const currentDate =
      new Date().toLocaleString();

    updateField(
      "lastBackup",
      currentDate
    );

    alert(
      "Backup Created Successfully"
    );

  }

  function restoreBackup() {

    alert(
      "Backup Restore Started"
    );

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

            <Database size={30} />

          </div>

          <div>

            <h1 className="text-3xl font-black">
              Backup & Restore
            </h1>

            <p className="mt-1 text-sm text-[var(--muted-text-color)]">
              Manage database backups & recovery
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
          title="Auto Backup"
          description="Automatic scheduled backups"
          icon={
            <RefreshCcw size={24} />
          }
          enabled={
            settings.autoBackup
          }
          onClick={() =>
            updateField(
              "autoBackup",
              !settings.autoBackup
            )
          }
        />

        <ToggleCard
          title="Cloud Backup"
          description="Backup to cloud storage"
          icon={
            <HardDrive size={24} />
          }
          enabled={
            settings.cloudBackup
          }
          onClick={() =>
            updateField(
              "cloudBackup",
              !settings.cloudBackup
            )
          }
        />

        <ToggleCard
          title="Realtime Sync"
          description="Live backup synchronization"
          icon={
            <Upload size={24} />
          }
          enabled={
            settings.realtimeSync
          }
          onClick={() =>
            updateField(
              "realtimeSync",
              !settings.realtimeSync
            )
          }
        />

        <ToggleCard
          title="Restore Protection"
          description="Prevent accidental restores"
          icon={
            <ShieldCheck size={24} />
          }
          enabled={
            settings.restoreProtection
          }
          onClick={() =>
            updateField(
              "restoreProtection",
              !settings.restoreProtection
            )
          }
        />

      </div>

      {/* INPUTS */}

      <div className="mt-6 grid grid-cols-1 gap-5 md:grid-cols-2">

        <InputCard
          title="Backup Frequency"
          value={
            settings.backupFrequency
          }
          onChange={(value: string) =>
            updateField(
              "backupFrequency",
              value
            )
          }
        />

        <InputCard
          title="Backup Location"
          value={
            settings.backupLocation
          }
          onChange={(value: string) =>
            updateField(
              "backupLocation",
              value
            )
          }
        />

      </div>

      {/* ACTIONS */}

      <div className="mt-6 grid grid-cols-1 gap-5 md:grid-cols-2">

        <button
          onClick={createBackup}
          className="flex items-center justify-center gap-3 rounded-[30px] bg-[var(--success-color)] p-6 text-xl font-black text-[var(--text-color)]"
        >

          <Download size={24} />

          Create Backup

        </button>

        <button
          onClick={restoreBackup}
          className="flex items-center justify-center gap-3 rounded-[30px] bg-[var(--warning-color)] p-6 text-xl font-black text-[var(--text-color)]"
        >

          <Upload size={24} />

          Restore Backup

        </button>

      </div>

      {/* STATUS */}

      <div className="mt-6 rounded-[30px] bg-gradient-to-r from-[var(--primary-color)] to-[var(--primary-color)] p-6">

        <div className="flex items-center gap-3">

          <Clock3 size={28} />

          <h2 className="text-3xl font-black text-[var(--text-color)]">
            Backup Status
          </h2>

        </div>

        <div className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-2">

          <StatusCard
            title="Last Backup"
            value={
              settings.lastBackup
            }
          />

          <StatusCard
            title="Backup Frequency"
            value={
              settings.backupFrequency
            }
          />

          <StatusCard
            title="Cloud Backup"
            value={
              settings.cloudBackup
                ? "Enabled"
                : "Disabled"
            }
          />

          <StatusCard
            title="Realtime Sync"
            value={
              settings.realtimeSync
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
