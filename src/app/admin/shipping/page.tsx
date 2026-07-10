"use client";

export const dynamic = "force-dynamic";

import { useState } from "react";

import {
  Truck,
  Save,
  Package,
  MapPin,
  CheckCircle
} from "lucide-react";

export default function ShippingPage() {

  const [shippingCharge, setShippingCharge] =
    useState("99");

  const [freeShipping, setFreeShipping] =
    useState("999");

  const [codEnabled, setCodEnabled] =
    useState(true);

  const [trackingEnabled, setTrackingEnabled] =
    useState(true);

  return (

    <main className="min-h-screen bg-[var(--primary-color)] p-4 text-[var(--button-text-color)]">

      <div className="mb-8 flex items-center justify-between">

        <div className="flex items-center gap-4">

          <div className="flex h-16 w-16 items-center justify-center rounded-[24px] bg-[var(--primary-color)]">

            <Truck size={30} />

          </div>

          <div>

            <h1 className="text-3xl font-black">
              Shipping Settings
            </h1>

            <p className="mt-1 text-sm text-[var(--muted-text-color)]">
              Manage delivery & shipping
            </p>

          </div>

        </div>

        <button
          className="flex items-center gap-2 rounded-2xl bg-[var(--primary-color)] px-5 py-3 text-sm font-bold"
        >

          <Save size={18} />

          Save Settings

        </button>

      </div>

      <div className="space-y-5">

        <div className="rounded-[30px] bg-[var(--primary-color)] p-5">

          <div className="mb-5 flex items-center gap-3">

            <Package
              size={24}
              className="text-[var(--primary-color)]"
            />

            <h2 className="text-2xl font-black">
              Delivery Charge
            </h2>

          </div>

          <input
            type="text"
            value={shippingCharge}
            onChange={(e) =>
              setShippingCharge(
                e.target.value
              )
            }
            className="w-full rounded-2xl border border-[var(--border-color)]/10 bg-[var(--card-color)] px-4 py-4 outline-none"
          />

        </div>

        <div className="rounded-[30px] bg-[var(--primary-color)] p-5">

          <div className="mb-5 flex items-center gap-3">

            <Truck
              size={24}
              className="text-[var(--success-color)]"
            />

            <h2 className="text-2xl font-black">
              Free Shipping Limit
            </h2>

          </div>

          <input
            type="text"
            value={freeShipping}
            onChange={(e) =>
              setFreeShipping(
                e.target.value
              )
            }
            className="w-full rounded-2xl border border-[var(--border-color)]/10 bg-[var(--card-color)] px-4 py-4 outline-none"
          />

        </div>

        <div className="rounded-[30px] bg-[var(--primary-color)] p-5">

          <div className="flex items-center justify-between">

            <div className="flex items-center gap-3">

              <MapPin
                size={24}
                className="text-[var(--warning-color)]"
              />

              <div>

                <h2 className="text-2xl font-black">
                  Cash On Delivery
                </h2>

                <p className="text-sm text-[var(--muted-text-color)]">
                  Enable COD payments
                </p>

              </div>

            </div>

            <button
              onClick={() =>
                setCodEnabled(
                  !codEnabled
                )
              }
              className={`rounded-2xl px-5 py-3 font-bold ${
                codEnabled
                  ? "bg-[var(--success-color)]"
                  : "bg-[var(--danger-color)]"
              }`}
            >

              {codEnabled
                ? "Enabled"
                : "Disabled"}

            </button>

          </div>

        </div>

        <div className="rounded-[30px] bg-[var(--primary-color)] p-5">

          <div className="flex items-center justify-between">

            <div className="flex items-center gap-3">

              <CheckCircle
                size={24}
                className="text-[var(--primary-color)]"
              />

              <div>

                <h2 className="text-2xl font-black">
                  Tracking System
                </h2>

                <p className="text-sm text-[var(--muted-text-color)]">
                  Order tracking enabled
                </p>

              </div>

            </div>

            <button
              onClick={() =>
                setTrackingEnabled(
                  !trackingEnabled
                )
              }
              className={`rounded-2xl px-5 py-3 font-bold ${
                trackingEnabled
                  ? "bg-[var(--success-color)]"
                  : "bg-[var(--danger-color)]"
              }`}
            >

              {trackingEnabled
                ? "Enabled"
                : "Disabled"}

            </button>

          </div>

        </div>

      </div>

    </main>

  );
}
