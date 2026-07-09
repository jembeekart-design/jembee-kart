"use client";

export const dynamic = "force-dynamic";

import { useEffect, useState } from "react";

import {
  doc,
  getDoc,
  setDoc
} from "firebase/firestore";

import {
  Truck,
  Save,
  MapPin,
  Clock3,
  ShieldCheck,
  PackageCheck,
  Bike
} from "lucide-react";

import { db } from "@/firebase/config";

interface DeliverySettings {
  deliveryEnabled: boolean;
  cashOnDelivery: boolean;
  expressDelivery: boolean;
  freeDelivery: boolean;
  deliveryPartner: string;
  deliveryCharge: string;
  estimatedDeliveryDays: string;
  maxDeliveryDistance: string;
}

export default function DeliveryPage() {

  const [settings, setSettings] =
    useState<DeliverySettings>({
      deliveryEnabled: true,
      cashOnDelivery: true,
      expressDelivery: false,
      freeDelivery: false,
      deliveryPartner: "Shiprocket",
      deliveryCharge: "50",
      estimatedDeliveryDays: "5",
      maxDeliveryDistance: "25"
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
        "delivery"
      );

      const snap =
        await getDoc(ref);

      if (snap.exists()) {

        setSettings(
          snap.data() as DeliverySettings
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
          "delivery"
        ),
        settings
      );

      alert(
        "Delivery Settings Saved"
      );

    } catch (error) {

      console.log(error);

    } finally {

      setSaving(false);

    }
  }

  function updateField(
    field: keyof DeliverySettings,
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

          <div className="flex h-16 w-16 items-center justify-center rounded-[24px] bg-[var(--warning-color)]">

            <Truck size={30} />

          </div>

          <div>

            <h1 className="text-3xl font-black">
              Delivery Settings
            </h1>

            <p className="mt-1 text-sm text-gray-400">
              Manage shipping & delivery system
            </p>

          </div>

        </div>

        <button
          onClick={saveSettings}
          disabled={saving}
          className="flex items-center gap-2 rounded-2xl bg-[var(--warning-color)] px-5 py-3 font-bold text-[var(--text-color)]"
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
          title="Delivery System"
          description="Enable delivery system"
          icon={
            <Truck size={24} />
          }
          enabled={
            settings.deliveryEnabled
          }
          onClick={() =>
            updateField(
              "deliveryEnabled",
              !settings.deliveryEnabled
            )
          }
        />

        <ToggleCard
          title="Cash On Delivery"
          description="Enable COD payments"
          icon={
            <PackageCheck size={24} />
          }
          enabled={
            settings.cashOnDelivery
          }
          onClick={() =>
            updateField(
              "cashOnDelivery",
              !settings.cashOnDelivery
            )
          }
        />

        <ToggleCard
          title="Express Delivery"
          description="Enable fast delivery"
          icon={
            <Bike size={24} />
          }
          enabled={
            settings.expressDelivery
          }
          onClick={() =>
            updateField(
              "expressDelivery",
              !settings.expressDelivery
            )
          }
        />

        <ToggleCard
          title="Free Delivery"
          description="Enable free shipping"
          icon={
            <ShieldCheck size={24} />
          }
          enabled={
            settings.freeDelivery
          }
          onClick={() =>
            updateField(
              "freeDelivery",
              !settings.freeDelivery
            )
          }
        />

      </div>

      {/* INPUTS */}

      <div className="mt-6 grid grid-cols-1 gap-5 md:grid-cols-2">

        <InputCard
          title="Delivery Partner"
          icon={
            <Truck size={22} />
          }
          value={
            settings.deliveryPartner
          }
          onChange={(value: string) =>
            updateField(
              "deliveryPartner",
              value
            )
          }
        />

        <InputCard
          title="Delivery Charge"
          icon={
            <MapPin size={22} />
          }
          value={
            settings.deliveryCharge
          }
          onChange={(value: string) =>
            updateField(
              "deliveryCharge",
              value
            )
          }
        />

        <InputCard
          title="Estimated Delivery Days"
          icon={
            <Clock3 size={22} />
          }
          value={
            settings.estimatedDeliveryDays
          }
          onChange={(value: string) =>
            updateField(
              "estimatedDeliveryDays",
              value
            )
          }
        />

        <InputCard
          title="Max Delivery Distance (KM)"
          icon={
            <MapPin size={22} />
          }
          value={
            settings.maxDeliveryDistance
          }
          onChange={(value: string) =>
            updateField(
              "maxDeliveryDistance",
              value
            )
          }
        />

      </div>

      {/* STATUS */}

      <div className="mt-6 rounded-[30px] bg-gradient-to-r from-yellow-500 to-orange-500 p-6">

        <div className="flex items-center gap-3">

          <Truck size={28} />

          <h2 className="text-3xl font-black text-[var(--text-color)]">
            Delivery Status
          </h2>

        </div>

        <div className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-2">

          <StatusCard
            title="Delivery"
            value={
              settings.deliveryEnabled
                ? "Enabled"
                : "Disabled"
            }
          />

          <StatusCard
            title="COD"
            value={
              settings.cashOnDelivery
                ? "Available"
                : "Disabled"
            }
          />

          <StatusCard
            title="Delivery Charge"
            value={`₹${settings.deliveryCharge}`}
          />

          <StatusCard
            title="Delivery Days"
            value={`${settings.estimatedDeliveryDays} Days`}
          />

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
