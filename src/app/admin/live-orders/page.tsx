"use client";

export const dynamic = "force-dynamic";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "@/firebase/config";

import {
  collection,
  onSnapshot,
  orderBy,
  query
} from "firebase/firestore";

import {
  ShoppingBag,
  Clock3,
  Truck,
  CheckCircle2,
  Package,
  IndianRupee
} from "lucide-react";

import { db } from "@/firebase/config";

interface OrderData {
  id: string;
  customerName?: string;
  productName?: string;
  amount?: number;
  paymentMethod?: string;
  orderStatus?: string;
  createdAt?: any;
}

export default function LiveOrdersPage() {
const router = useRouter();
  const [orders, setOrders] =
    useState<OrderData[]>([]);

  const [loading, setLoading] =
    useState(true);

  useEffect(() => {
    const unsubscribeAuth = onAuthStateChanged(auth, (user) => {
  if (!user) {
    router.push("/login");
  }
});

    const q = query(
      collection(db, "orders"),
      orderBy("createdAt", "desc")
    );

    const unsubscribe =
      onSnapshot(q, (snapshot) => {

        const data:
          OrderData[] = [];

        snapshot.forEach((doc) => {

          data.push({
            id: doc.id,
            ...doc.data()
          });

        });

        setOrders(data);

        setLoading(false);

      });

    return () =>
      unsubscribe();

  }, []);

  if (loading) {

    return (

      <div className="flex min-h-screen items-center justify-center bg-[var(--card-color)] text-[var(--button-text-color)]">

        Loading Live Orders...

      </div>

    );
  }

  return (

    <main className="min-h-screen bg-[#0b0b0b] p-4 text-[var(--button-text-color)]">

      {/* HEADER */}

      <div className="mb-8 flex items-center gap-4">

        <div className="flex h-16 w-16 items-center justify-center rounded-[24px] bg-orange-500">

          <ShoppingBag size={30} />

        </div>

        <div>

          <h1 className="text-3xl font-black">
            Live Orders
          </h1>

          <p className="mt-1 text-sm text-[var(--muted-text-color)]">
            Realtime customer orders tracking
          </p>

        </div>

      </div>

      {/* STATS */}

      <div className="mb-6 grid grid-cols-1 gap-5 md:grid-cols-4">

        <StatCard
          title="Total Orders"
          value={
            orders.length.toString()
          }
          icon={
            <Package size={24} />
          }
        />

        <StatCard
          title="Pending"
          value={
            orders
              .filter(
                (order) =>
                  order.orderStatus ===
                  "Pending"
              )
              .length
              .toString()
          }
          icon={
            <Clock3 size={24} />
          }
        />

        <StatCard
          title="Shipped"
          value={
            orders
              .filter(
                (order) =>
                  order.orderStatus ===
                  "Shipped"
              )
              .length
              .toString()
          }
          icon={
            <Truck size={24} />
          }
        />

        <StatCard
          title="Delivered"
          value={
            orders
              .filter(
                (order) =>
                  order.orderStatus ===
                  "Delivered"
              )
              .length
              .toString()
          }
          icon={
            <CheckCircle2 size={24} />
          }
        />

      </div>

      {/* ORDERS */}

      <div className="space-y-5">

        {orders.length === 0 && (

          <div className="rounded-[30px] bg-[#151515] p-10 text-center">

            No Orders Found

          </div>

        )}

        {orders.map((order) => (

          <div
            key={order.id}
            className="rounded-[30px] bg-[#151515] p-5"
          >

            <div className="flex flex-col gap-5 md:flex-row md:items-center md:justify-between">

              {/* LEFT */}

              <div>

                <h2 className="text-2xl font-black">

                  {order.productName ||
                    "Unnamed Product"}

                </h2>

                <p className="mt-2 text-sm text-[var(--muted-text-color)]">

                  Customer:
                  {" "}
                  {order.customerName ||
                    "Unknown"}

                </p>

                <p className="mt-1 text-sm text-[var(--muted-text-color)]">

                  Payment:
                  {" "}
                  {order.paymentMethod ||
                    "N/A"}

                </p>

                <p className="mt-1 text-sm text-[var(--muted-text-color)]">

                  Order ID:
                  {" "}
                  {order.id}

                </p>

              </div>

              {/* RIGHT */}

              <div className="flex flex-col items-start gap-3 md:items-end">

                <div className="flex items-center gap-2 rounded-full bg-[var(--card-color)] px-4 py-2">

                  <IndianRupee size={18} />

                  <span className="font-bold">

                    {order.amount || 0}

                  </span>

                </div>

                <StatusBadge
                  status={
                    order.orderStatus ||
                    "Pending"
                  }
                />

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
  icon
}: {
  title: string;
  value: string;
  icon: React.ReactNode;
}) {

  return (

    <div className="rounded-[30px] bg-[#151515] p-5">

      <div className="flex items-center justify-between">

        <div>

          <p className="text-sm text-[var(--muted-text-color)]">
            {title}
          </p>

          <h2 className="mt-2 text-3xl font-black">
            {value}
          </h2>

        </div>

        <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[var(--card-color)]">

          {icon}

        </div>

      </div>

    </div>

  );
}

function StatusBadge({
  status
}: {
  status: string;
}) {

  function getColor() {

    if (status === "Delivered") {

      return "bg-[var(--success-color)]";

    }

    if (status === "Shipped") {

      return "theme-primary-bg";

    }

    if (status === "Cancelled") {

      return "bg-[var(--danger-color)]";

    }

    return "bg-[var(--warning-color)]";

  }

  return (

    <div
      className={`rounded-full px-5 py-2 text-sm font-bold ${getColor()}`}
    >

      {status}

    </div>

  );
}
