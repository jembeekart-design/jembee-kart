"use client";

export const dynamic = "force-dynamic";

import { useEffect, useState } from "react";

import {
  collection,
  doc,
  onSnapshot,
  orderBy,
  query,
  updateDoc
} from "firebase/firestore";

import {
  Truck,
  Package,
  CheckCircle2,
  Clock3,
  MapPin
} from "lucide-react";

import { db } from "@/firebase/config";

interface DeliveryOrder {
  id?: string;
  customerName: string;
  orderId: string;
  productName: string;
  address: string;
  status: string;
}

export default function DeliveryTrackingPage() {

  const [orders, setOrders] =
    useState<DeliveryOrder[]>([]);

  const [loading, setLoading] =
    useState(true);

  useEffect(() => {

    const q = query(
      collection(
        db,
        "orders"
      ),
      orderBy(
        "status",
        "asc"
      )
    );

    const unsubscribe =
      onSnapshot(q, (snapshot) => {

        const data:
          DeliveryOrder[] = [];

        snapshot.forEach((doc) => {

          data.push({
            id: doc.id,
            ...doc.data()
          } as DeliveryOrder);

        });

        setOrders(data);

        setLoading(false);

      });

    return () =>
      unsubscribe();

  }, []);

  async function updateStatus(
    id: string,
    status: string
  ) {

    try {

      await updateDoc(
        doc(
          db,
          "orders",
          id
        ),
        {
          status
        }
      );

    } catch (error) {

      console.log(error);

    }
  }

  if (loading) {

    return (

      <div className="flex min-h-screen items-center justify-center bg-black text-white">

        Loading Orders...

      </div>

    );
  }

  return (

    <main className="min-h-screen bg-[#0b0b0b] p-4 text-white">

      {/* HEADER */}

      <div className="mb-8 flex items-center gap-4">

        <div className="flex h-16 w-16 items-center justify-center rounded-[24px] bg-orange-500">

          <Truck size={30} />

        </div>

        <div>

          <h1 className="text-3xl font-black">
            Delivery Tracking
          </h1>

          <p className="mt-1 text-sm text-gray-400">
            Track all deliveries in real-time
          </p>

        </div>

      </div>

      {/* ORDERS */}

      <div className="space-y-5">

        {orders.length === 0 && (

          <div className="rounded-[30px] bg-[#151515] p-10 text-center">

            No Orders Found

          </div>

        )}

        {orders.map(
          (order) => (

            <div
              key={order.id}
              className="rounded-[30px] bg-[#151515] p-5"
            >

              <div className="flex flex-col gap-6">

                {/* TOP */}

                <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">

                  <div>

                    <h2 className="text-2xl font-black text-orange-400">

                      {order.customerName}

                    </h2>

                    <p className="mt-2 text-sm text-gray-400">

                      Order ID:
                      {" "}
                      {order.orderId}

                    </p>

                  </div>

                  <StatusBadge
                    status={
                      order.status
                    }
                  />

                </div>

                {/* PRODUCT */}

                <div className="rounded-2xl bg-black/30 p-4">

                  <div className="flex items-center gap-2">

                    <Package size={18} />

                    <h3 className="font-bold">

                      {order.productName}

                    </h3>

                  </div>

                  <div className="mt-3 flex items-start gap-2 text-sm text-gray-300">

                    <MapPin size={16} />

                    {order.address}

                  </div>

                </div>

                {/* TRACKING STEPS */}

                <div className="grid grid-cols-2 gap-3 md:grid-cols-4">

                  <TrackButton
                    title="Packed"
                    active={
                      order.status ===
                      "Packed"
                    }
                    onClick={() =>
                      updateStatus(
                        order.id!,
                        "Packed"
                      )
                    }
                  />

                  <TrackButton
                    title="Shipped"
                    active={
                      order.status ===
                      "Shipped"
                    }
                    onClick={() =>
                      updateStatus(
                        order.id!,
                        "Shipped"
                      )
                    }
                  />

                  <TrackButton
                    title="Out for Delivery"
                    active={
                      order.status ===
                      "Out for Delivery"
                    }
                    onClick={() =>
                      updateStatus(
                        order.id!,
                        "Out for Delivery"
                      )
                    }
                  />

                  <TrackButton
                    title="Delivered"
                    active={
                      order.status ===
                      "Delivered"
                    }
                    onClick={() =>
                      updateStatus(
                        order.id!,
                        "Delivered"
                      )
                    }
                  />

                </div>

              </div>

            </div>

          )
        )}

      </div>

    </main>

  );
}

function TrackButton({
  title,
  active,
  onClick
}: {
  title: string;
  active: boolean;
  onClick: () => void;
}) {

  return (

    <button
      onClick={onClick}
      className={`rounded-2xl px-4 py-4 text-sm font-bold transition ${
        active
          ? "bg-orange-500 text-black"
          : "bg-black/30 text-white"
      }`}
    >

      {title}

    </button>

  );
}

function StatusBadge({
  status
}: {
  status: string;
}) {

  function getColor() {

    if (status === "Delivered") {

      return "bg-green-500";

    }

    if (
      status ===
      "Out for Delivery"
    ) {

      return "bg-blue-500";

    }

    if (
      status ===
      "Shipped"
    ) {

      return "bg-yellow-500";

    }

    return "bg-orange-500";

  }

  function getIcon() {

    if (status === "Delivered") {

      return <CheckCircle2 size={16} />;

    }

    return <Clock3 size={16} />;

  }

  return (

    <div
      className={`flex items-center gap-2 rounded-full px-5 py-3 text-sm font-bold ${getColor()}`}
    >

      {getIcon()}

      {status}

    </div>

  );
}
