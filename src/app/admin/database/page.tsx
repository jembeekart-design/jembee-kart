"use client";

export const dynamic = "force-dynamic";

import { useState } from "react";

import {
  Database,
  Trash2,
  RefreshCcw,
  Download,
  Upload,
  CheckCircle,
  AlertTriangle,
  HardDrive
} from "lucide-react";

interface CollectionItem {
  id: number;
  name: string;
  records: number;
  status: string;
}

export default function DatabasePage() {

  const [
    collections,
    setCollections
  ] = useState<CollectionItem[]>([
    {
      id: 1,
      name: "users",
      records: 1240,
      status: "active"
    },
    {
      id: 2,
      name: "orders",
      records: 532,
      status: "active"
    },
    {
      id: 3,
      name: "products",
      records: 220,
      status: "active"
    },
    {
      id: 4,
      name: "affiliate",
      records: 89,
      status: "active"
    }
  ]);

  function refreshDatabase() {

    alert(
      "Database Refreshed"
    );
  }

  function exportDatabase() {

    alert(
      "Database Export Started"
    );
  }

  function importDatabase() {

    alert(
      "Database Import Started"
    );
  }

  function deleteCollection(
    id: number
  ) {

    setCollections((prev) =>
      prev.filter(
        (item) =>
          item.id !== id
      )
    );
  }

  return (

    <main className="min-h-screen bg-[#0b0b0b] p-4 text-white">

      {/* HEADER */}

      <div className="mb-8 flex items-center justify-between">

        <div className="flex items-center gap-4">

          <div className="flex h-16 w-16 items-center justify-center rounded-[24px] bg-green-500">

            <Database size={30} />

          </div>

          <div>

            <h1 className="text-3xl font-black">
              Database Manager
            </h1>

            <p className="mt-1 text-sm text-gray-400">
              Manage Firebase collections & records
            </p>

          </div>

        </div>

        <button
          onClick={refreshDatabase}
          className="flex items-center gap-2 rounded-2xl bg-cyan-500 px-5 py-3 text-sm font-bold"
        >

          <RefreshCcw size={18} />

          Refresh

        </button>

      </div>

      {/* STATS */}

      <div className="grid grid-cols-3 gap-4">

        <div className="rounded-[30px] bg-[#151515] p-5">

          <Database
            size={28}
            className="text-cyan-400"
          />

          <p className="mt-4 text-sm text-gray-400">
            Collections
          </p>

          <h2 className="mt-2 text-3xl font-black">
            {collections.length}
          </h2>

        </div>

        <div className="rounded-[30px] bg-[#151515] p-5">

          <HardDrive
            size={28}
            className="text-pink-400"
          />

          <p className="mt-4 text-sm text-gray-400">
            Storage Used
          </p>

          <h2 className="mt-2 text-3xl font-black">
            4.2 GB
          </h2>

        </div>

        <div className="rounded-[30px] bg-[#151515] p-5">

          <CheckCircle
            size={28}
            className="text-green-400"
          />

          <p className="mt-4 text-sm text-gray-400">
            Status
          </p>

          <h2 className="mt-2 text-2xl font-black">
            Healthy
          </h2>

        </div>

      </div>

      {/* ACTIONS */}

      <div className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-2">

        <button
          onClick={exportDatabase}
          className="rounded-[30px] bg-gradient-to-r from-cyan-500 to-blue-600 p-6 text-left"
        >

          <Download size={32} />

          <h2 className="mt-5 text-2xl font-black">
            Export Database
          </h2>

          <p className="mt-2 text-white/80">
            Download complete database backup
          </p>

        </button>

        <button
          onClick={importDatabase}
          className="rounded-[30px] bg-gradient-to-r from-violet-600 to-fuchsia-600 p-6 text-left"
        >

          <Upload size={32} />

          <h2 className="mt-5 text-2xl font-black">
            Import Database
          </h2>

          <p className="mt-2 text-white/80">
            Restore database collections
          </p>

        </button>

      </div>

      {/* COLLECTION LIST */}

      <div className="mt-6 space-y-5">

        {collections.map(
          (item) => (

            <div
              key={item.id}
              className="rounded-[30px] bg-[#151515] p-5"
            >

              <div className="flex items-center justify-between gap-4">

                <div>

                  <h2 className="text-2xl font-black">
                    {item.name}
                  </h2>

                  <div className="mt-3 flex flex-wrap gap-3 text-sm text-gray-400">

                    <span>
                      Records:
                      {" "}
                      {item.records}
                    </span>

                  </div>

                  <div className="mt-4 inline-flex items-center gap-2 rounded-full bg-green-500 px-4 py-2 text-sm font-bold">

                    <CheckCircle size={16} />

                    {item.status}

                  </div>

                </div>

                <button
                  onClick={() =>
                    deleteCollection(
                      item.id
                    )
                  }
                  className="flex h-14 w-14 items-center justify-center rounded-2xl bg-red-500"
                >

                  <Trash2 size={22} />

                </button>

              </div>

            </div>

          )
        )}

      </div>

      {/* WARNING */}

      <div className="mt-6 rounded-[30px] bg-gradient-to-r from-yellow-500 to-orange-500 p-6 text-black">

        <div className="flex items-center gap-3">

          <AlertTriangle size={28} />

          <h2 className="text-3xl font-black">
            Warning
          </h2>

        </div>

        <p className="mt-3 font-medium">
          Deleting collections may permanently remove important data.
        </p>

      </div>

    </main>
  );
}
