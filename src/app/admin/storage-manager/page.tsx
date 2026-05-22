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

            <HardDrive size={30} />

          </div>

          <div>

            <h1 className="text-3xl font-black">
              Storage Manager
            </h1>

            <p className="mt-1 text-sm text-gray-400">
              Manage uploads & cloud storage
            </p>

          </div>

        </div>

        <button
          onClick={saveSettings}
          disabled={saving}
          className="flex items-center gap-2 rounded-2xl bg-cyan-500 px-5 py-3 font-bold text-black"
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

<div className="mt-6 rounded-[30px] bg-gradient-to-r from-cyan-500 to-blue-500 p-6">

  <div className="flex items-center gap-3">

    <ShieldCheck size={28} />

    <h2 className="text-3xl font-black text-black">
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
