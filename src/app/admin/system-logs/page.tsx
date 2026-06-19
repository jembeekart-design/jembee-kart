"use client";

export const dynamic = "force-dynamic";

import { useEffect, useState } from "react";

import {
  collection,
  onSnapshot,
  orderBy,
  query
} from "firebase/firestore";

import {
  Activity,
  ShieldAlert,
  Info,
  AlertTriangle,
  CheckCircle2,
  Clock3,
  Database
} from "lucide-react";

import { db } from "@/firebase/config";

interface SystemLog {
  id?: string;
  type: string;
  title: string;
  message: string;
  createdAt?: any;
}

export default function SystemLogsPage() {

  const [logs, setLogs] =
    useState<SystemLog[]>([]);

  const [loading, setLoading] =
    useState(true);

  useEffect(() => {

    const q = query(
      collection(
        db,
        "system_logs"
      ),
      orderBy(
        "createdAt",
        "desc"
      )
    );

    const unsubscribe =
      onSnapshot(q, (snapshot) => {

        const data:
          SystemLog[] = [];

        snapshot.forEach((doc) => {

          data.push({
            id: doc.id,
            ...doc.data()
          } as SystemLog);

        });

        setLogs(data);

        setLoading(false);

      });

    return () =>
      unsubscribe();

  }, []);

  function getStats(
    type: string
  ) {

    return logs.filter(
      (log) =>
        log.type === type
    ).length;

  }

  if (loading) {

    return (

      <div className="flex min-h-screen items-center justify-center bg-black text-white">

        Loading Logs...

      </div>

    );
  }

  return (

    <main className="min-h-screen bg-[#0b0b0b] p-4 text-white">

      {/* HEADER */}

      <div className="mb-8 flex items-center gap-4">

        <div className="flex h-16 w-16 items-center justify-center rounded-[24px] bg-indigo-500">

          <Database size={30} />

        </div>

        <div>

          <h1 className="text-3xl font-black">
            System Logs
          </h1>

          <p className="mt-1 text-sm text-gray-400">
            Monitor platform activities & errors
          </p>

        </div>

      </div>

      {/* STATS */}

      <div className="mb-6 grid grid-cols-1 gap-5 md:grid-cols-4">

        <StatCard
          title="Info Logs"
          value={getStats("info")}
          icon={
            <Info size={24} />
          }
          color="theme-primary-bg"
        />

        <StatCard
          title="Warnings"
          value={getStats("warning")}
          icon={
            <AlertTriangle size={24} />
          }
          color="bg-yellow-500"
        />

        <StatCard
          title="Errors"
          value={getStats("error")}
          icon={
            <ShieldAlert size={24} />
          }
          color="bg-red-500"
        />

        <StatCard
          title="Success"
          value={getStats("success")}
          icon={
            <CheckCircle2 size={24} />
          }
          color="bg-green-500"
        />

      </div>

      {/* LOGS */}

      <div className="space-y-5">

        {logs.length === 0 && (

          <div className="rounded-[30px] bg-[#151515] p-10 text-center">

            No Logs Found

          </div>

        )}

        {logs.map((log) => (

          <div
            key={log.id}
            className="rounded-[30px] bg-[#151515] p-5"
          >

            <div className="flex flex-col gap-5 md:flex-row md:items-start md:justify-between">

              {/* LEFT */}

              <div>

                <div className="flex items-center gap-3">

                  <div
                    className={`flex h-12 w-12 items-center justify-center rounded-2xl ${getLogColor(
                      log.type
                    )}`}
                  >

                    {getLogIcon(
                      log.type
                    )}

                  </div>

                  <div>

                    <h2 className="text-2xl font-black">

                      {log.title}

                    </h2>

                    <p className="text-sm text-gray-400 capitalize">

                      {log.type}

                    </p>

                  </div>

                </div>

                <p className="mt-5 text-gray-300">

                  {log.message}

                </p>

              </div>

              {/* RIGHT */}

              <div className="flex items-center gap-2 rounded-full bg-black px-4 py-2 text-sm text-gray-300">

                <Clock3 size={16} />

                Recent Activity

              </div>

            </div>

          </div>

        ))}

      </div>

    </main>

  );
}

function StatCard({
  title,
  value,
  icon,
  color
}: {
  title: string;
  value: number;
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

function getLogColor(
  type: string
) {

  if (type === "success") {

    return "bg-green-500";

  }

  if (type === "warning") {

    return "bg-yellow-500";

  }

  if (type === "error") {

    return "bg-red-500";

  }

  return "theme-primary-bg";

}

function getLogIcon(
  type: string
) {

  if (type === "success") {

    return <CheckCircle2 size={22} />;

  }

  if (type === "warning") {

    return <AlertTriangle size={22} />;

  }

  if (type === "error") {

    return <ShieldAlert size={22} />;

  }

  return <Activity size={22} />;

}
