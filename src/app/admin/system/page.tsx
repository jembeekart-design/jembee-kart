"use client";

export const dynamic = "force-dynamic";

import { useState } from "react";

import {
  Server,
  Database,
  ShieldCheck,
  HardDrive,
  RefreshCcw,
  Trash2,
  Power,
  Cpu,
  Globe,
  CheckCircle,
  AlertTriangle
} from "lucide-react";

export default function SystemPage() {

  const [
    maintenanceMode,
    setMaintenanceMode
  ] = useState(false);

  const [
    cacheClearing,
    setCacheClearing
  ] = useState(false);

  const [
    deploymentRefreshing,
    setDeploymentRefreshing
  ] = useState(false);

  function clearCache() {

    setCacheClearing(true);

    setTimeout(() => {

      setCacheClearing(false);

      alert(
        "Cache Cleared Successfully"
      );

    }, 2000);
  }

  function refreshDeployment() {

    setDeploymentRefreshing(true);

    setTimeout(() => {

      setDeploymentRefreshing(false);

      alert(
        "Deployment Refreshed"
      );

    }, 2000);
  }

  return (

    <main className="min-h-screen bg-[#0b0b0b] p-4 text-[var(--button-text-color)]">

      {/* HEADER */}

      <div className="mb-8 flex items-center gap-4">

        <div className="flex h-16 w-16 items-center justify-center rounded-[24px] bg-cyan-500">

          <Server size={30} />

        </div>

        <div>

          <h1 className="text-3xl font-black">
            System Dashboard
          </h1>

          <p className="mt-1 text-sm text-gray-400">
            Advanced app & server controls
          </p>

        </div>

      </div>

      {/* STATUS GRID */}

      <div className="grid grid-cols-2 gap-4 md:grid-cols-4">

        {/* SERVER */}

        <div className="rounded-[30px] bg-[#151515] p-5">

          <div className="flex items-center justify-between">

            <Server
              size={28}
              className="text-cyan-400"
            />

            <CheckCircle
              size={22}
              className="text-green-400"
            />

          </div>

          <p className="mt-5 text-sm text-gray-400">
            Server Status
          </p>

          <h2 className="mt-2 text-2xl font-black">
            Online
          </h2>

        </div>

        {/* FIREBASE */}

        <div className="rounded-[30px] bg-[#151515] p-5">

          <div className="flex items-center justify-between">

            <Database
              size={28}
              className="text-orange-400"
            />

            <CheckCircle
              size={22}
              className="text-green-400"
            />

          </div>

          <p className="mt-5 text-sm text-gray-400">
            Firebase
          </p>

          <h2 className="mt-2 text-2xl font-black">
            Connected
          </h2>

        </div>

        {/* SECURITY */}

        <div className="rounded-[30px] bg-[#151515] p-5">

          <div className="flex items-center justify-between">

            <ShieldCheck
              size={28}
              className="text-violet-400"
            />

            <CheckCircle
              size={22}
              className="text-green-400"
            />

          </div>

          <p className="mt-5 text-sm text-gray-400">
            Security
          </p>

          <h2 className="mt-2 text-2xl font-black">
            Protected
          </h2>

        </div>

        {/* STORAGE */}

        <div className="rounded-[30px] bg-[#151515] p-5">

          <div className="flex items-center justify-between">

            <HardDrive
              size={28}
              className="text-pink-400"
            />

            <AlertTriangle
              size={22}
              className="text-yellow-400"
            />

          </div>

          <p className="mt-5 text-sm text-gray-400">
            Storage
          </p>

          <h2 className="mt-2 text-2xl font-black">
            72%
          </h2>

        </div>

      </div>

      {/* SYSTEM INFO */}

      <div className="mt-6 rounded-[30px] bg-[#151515] p-5">

        <h2 className="text-2xl font-black">
          System Information
        </h2>

        <div className="mt-6 space-y-5">

          <div className="flex items-center justify-between rounded-2xl bg-black/30 p-4">

            <div className="flex items-center gap-3">

              <Cpu
                size={22}
                className="text-cyan-400"
              />

              <div>

                <h3 className="font-bold">
                  App Version
                </h3>

                <p className="text-sm text-gray-400">
                  Current running version
                </p>

              </div>

            </div>

            <span className="rounded-full bg-cyan-500 px-4 py-2 text-sm font-bold">

              v1.0.0

            </span>

          </div>

          <div className="flex items-center justify-between rounded-2xl bg-black/30 p-4">

            <div className="flex items-center gap-3">

              <Globe
                size={22}
                className="text-green-400"
              />

              <div>

                <h3 className="font-bold">
                  Deployment Region
                </h3>

                <p className="text-sm text-gray-400">
                  Current active server
                </p>

              </div>

            </div>

            <span className="rounded-full bg-[var(--success-color)] px-4 py-2 text-sm font-bold">

              India

            </span>

          </div>

          <div className="flex items-center justify-between rounded-2xl bg-black/30 p-4">

            <div className="flex items-center gap-3">

              <Power
                size={22}
                className="text-red-400"
              />

              <div>

                <h3 className="font-bold">
                  Maintenance Mode
                </h3>

                <p className="text-sm text-gray-400">
                  Disable public access
                </p>

              </div>

            </div>

            <button
              onClick={() =>
                setMaintenanceMode(
                  !maintenanceMode
                )
              }
              className={`rounded-full px-5 py-2 text-sm font-bold ${
                maintenanceMode
                  ? "bg-[var(--danger-color)]"
                  : "bg-[var(--success-color)]"
              }`}
            >

              {maintenanceMode
                ? "Enabled"
                : "Disabled"}

            </button>

          </div>

        </div>

      </div>

      {/* ACTION BUTTONS */}

      <div className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-2">

        {/* CLEAR CACHE */}

        <button
          onClick={clearCache}
          className="rounded-[30px] bg-gradient-to-r from-orange-500 to-red-500 p-6 text-left"
        >

          <Trash2 size={32} />

          <h2 className="mt-5 text-2xl font-black">
            {cacheClearing
              ? "Clearing..."
              : "Clear Cache"}
          </h2>

          <p className="mt-2 text-[var(--button-text-color)]/80">
            Remove temporary stored files
          </p>

        </button>

        {/* REFRESH DEPLOYMENT */}

        <button
          onClick={
            refreshDeployment
          }
          className="rounded-[30px] bg-gradient-to-r from-cyan-500 to-blue-600 p-6 text-left"
        >

          <RefreshCcw size={32} />

          <h2 className="mt-5 text-2xl font-black">
            {deploymentRefreshing
              ? "Refreshing..."
              : "Refresh Deployment"}
          </h2>

          <p className="mt-2 text-[var(--button-text-color)]/80">
            Restart deployment services
          </p>

        </button>

      </div>

      {/* FOOTER */}

      <div className="mt-6 rounded-[30px] bg-gradient-to-r from-violet-600 to-fuchsia-600 p-6">

        <h2 className="text-3xl font-black">
          JembeeKart System
        </h2>

        <p className="mt-2 text-[var(--button-text-color)]/80">
          Advanced monitoring & server management panel
        </p>

      </div>

    </main>
  );
}
