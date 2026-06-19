"use client";

export const dynamic = "force-dynamic";

import { useEffect, useState } from "react";

import {
  collection,
  deleteDoc,
  doc,
  getDocs
} from "firebase/firestore";

import {
  Database,
  Trash2,
  RefreshCcw,
  Table2,
  HardDrive,
  ShieldAlert
} from "lucide-react";

import { db } from "@/firebase/config";

interface CollectionInfo {
  name: string;
  total: number;
}

export default function DatabaseManagerPage() {

  const [collections, setCollections] =
    useState<CollectionInfo[]>([]);

  const [loading, setLoading] =
    useState(true);

  const [refreshing, setRefreshing] =
    useState(false);

  useEffect(() => {

    loadCollections();

  }, []);

  async function loadCollections() {

    try {

      setRefreshing(true);

      const collectionNames = [

        "users",
        "orders",
        "products",
        "coupons",
        "wallet_transactions",
        "support_tickets",
        "withdrawal_requests",
        "seller_verification_requests",
        "kyc_requests",
        "push_notifications",
        "flash_sales",
        "live_streams",
        "system_logs"

      ];

      const data:
        CollectionInfo[] = [];

      for (
        const name of collectionNames
      ) {

        const snapshot =
          await getDocs(
            collection(
              db,
              name
            )
          );

        data.push({
          name,
          total:
            snapshot.size
        });

      }

      setCollections(data);

    } catch (error) {

      console.log(error);

    } finally {

      setLoading(false);

      setRefreshing(false);

    }
  }

  async function clearCollection(
    collectionName: string
  ) {

    const confirmDelete =
      confirm(
        `Delete all documents from ${collectionName}?`
      );

    if (!confirmDelete) {

      return;

    }

    try {

      const snapshot =
        await getDocs(
          collection(
            db,
            collectionName
          )
        );

      const promises:
        Promise<void>[] = [];

      snapshot.forEach(
        (document) => {

          promises.push(
            deleteDoc(
              doc(
                db,
                collectionName,
                document.id
              )
            )
          );

        }
      );

      await Promise.all(
        promises
      );

      alert(
        `${collectionName} cleared`
      );

      loadCollections();

    } catch (error) {

      console.log(error);

    }
  }

  if (loading) {

    return (

      <div className="flex min-h-screen items-center justify-center bg-black text-white">

        Loading Database...

      </div>

    );
  }

  return (

    <main className="min-h-screen bg-[#0b0b0b] p-4 text-white">

      {/* HEADER */}

      <div className="mb-8 flex flex-col gap-5 md:flex-row md:items-center md:justify-between">

        <div className="flex items-center gap-4">

          <div className="flex h-16 w-16 items-center justify-center rounded-[24px] bg-purple-500">

            <Database size={30} />

          </div>

          <div>

            <h1 className="text-3xl font-black">
              Database Manager
            </h1>

            <p className="mt-1 text-sm text-gray-400">
              Manage Firestore collections
            </p>

          </div>

        </div>

        <button
          onClick={
            loadCollections
          }
          disabled={
            refreshing
          }
          className="flex items-center gap-2 rounded-2xl bg-purple-500 px-5 py-3 font-bold"
        >

          <RefreshCcw size={18} />

          {refreshing
            ? "Refreshing..."
            : "Refresh"}

        </button>

      </div>

      {/* STATS */}

      <div className="mb-6 grid grid-cols-1 gap-5 md:grid-cols-3">

        <StatsCard
          title="Collections"
          value={
            collections.length
          }
          icon={
            <Table2 size={24} />
          }
          color="theme-primary-bg"
        />

        <StatsCard
          title="Total Documents"
          value={collections.reduce(
            (
              total,
              item
            ) =>
              total +
              item.total,
            0
          )}
          icon={
            <HardDrive size={24} />
          }
          color="bg-green-500"
        />

        <StatsCard
          title="Database Status"
          value={"Active"}
          icon={
            <ShieldAlert size={24} />
          }
          color="bg-orange-500"
        />

      </div>

      {/* COLLECTIONS */}

      <div className="space-y-5">

        {collections.map(
          (item) => (

            <div
              key={item.name}
              className="rounded-[30px] bg-[#151515] p-5"
            >

              <div className="flex flex-col gap-5 md:flex-row md:items-center md:justify-between">

                <div>

                  <h2 className="text-2xl font-black text-purple-400">

                    {item.name}

                  </h2>

                  <p className="mt-2 text-gray-400">

                    Total Documents:
                    {" "}
                    {item.total}

                  </p>

                </div>

                <button
                  onClick={() =>
                    clearCollection(
                      item.name
                    )
                  }
                  className="flex items-center gap-2 rounded-2xl bg-red-500 px-5 py-3 font-bold"
                >

                  <Trash2 size={18} />

                  Clear Collection

                </button>

              </div>

            </div>

          )
        )}

      </div>

    </main>

  );
}

function StatsCard({
  title,
  value,
  icon,
  color
}: {
  title: string;
  value: string | number;
  icon: React.ReactNode;
  color: string;
}) {

  return (

    <div className="rounded-[30px] bg-[#151515] p-5">

      <div className="flex items-center justify-between">

        <div>

          <p className="text-sm text-gray-400">
            {title}
          </p>

          <h2 className="mt-2 text-3xl font-black">
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
