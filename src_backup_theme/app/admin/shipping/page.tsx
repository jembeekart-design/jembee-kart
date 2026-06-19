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

    <main className="min-h-screen bg-[#0b0b0b] p-4 text-white">

      <div className="mb-8 flex items-center justify-between">

        <div className="flex items-center gap-4">

          <div className="flex h-16 w-16 items-center justify-center rounded-[24px] bg-cyan-500">

            <Truck size={30} />

          </div>

          <div>

            <h1 className="text-3xl font-black">
              Shipping Settings
            </h1>

            <p className="mt-1 text-sm text-gray-400">
              Manage delivery & shipping
            </p>

          </div>

        </div>

        <button
          className="flex items-center gap-2 rounded-2xl bg-cyan-500 px-5 py-3 text-sm font-bold"
        >

          <Save size={18} />

          Save Settings

        </button>

      </div>

      <div className="space-y-5">

        <div className="rounded-[30px] bg-[#151515] p-5">

          <div className="mb-5 flex items-center gap-3">

            <Package
              size={24}
              className="text-cyan-400"
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
            className="w-full rounded-2xl border border-white/10 bg-black px-4 py-4 outline-none"
          />

        </div>

        <div className="rounded-[30px] bg-[#151515] p-5">

          <div className="mb-5 flex items-center gap-3">

            <Truck
              size={24}
              className="text-green-400"
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
            className="w-full rounded-2xl border border-white/10 bg-black px-4 py-4 outline-none"
          />

        </div>

        <div className="rounded-[30px] bg-[#151515] p-5">

          <div className="flex items-center justify-between">

            <div className="flex items-center gap-3">

              <MapPin
                size={24}
                className="text-yellow-400"
              />

              <div>

                <h2 className="text-2xl font-black">
                  Cash On Delivery
                </h2>

                <p className="text-sm text-gray-400">
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
                  ? "bg-green-500"
                  : "bg-red-500"
              }`}
            >

              {codEnabled
                ? "Enabled"
                : "Disabled"}

            </button>

          </div>

        </div>

        <div className="rounded-[30px] bg-[#151515] p-5">

          <div className="flex items-center justify-between">

            <div className="flex items-center gap-3">

              <CheckCircle
                size={24}
                className="text-violet-400"
              />

              <div>

                <h2 className="text-2xl font-black">
                  Tracking System
                </h2>

                <p className="text-sm text-gray-400">
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
                  ? "bg-green-500"
                  : "bg-red-500"
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
