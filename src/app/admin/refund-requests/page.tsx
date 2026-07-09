"use client";

export const dynamic = "force-dynamic";

import { useEffect, useState } from "react";

import {
  collection,
  deleteDoc,
  doc,
  onSnapshot,
  orderBy,
  query,
  updateDoc
} from "firebase/firestore";

import {
  RefreshCcw,
  User,
  Package,
  IndianRupee,
  CheckCircle2,
  XCircle,
  Trash2,
  Clock3
} from "lucide-react";

import { db } from "@/firebase/config";

interface RefundRequest {
  id?: string;
  userName: string;
  productName: string;
  amount: number;
  reason: string;
  status: string;
}

export default function RefundRequestsPage() {

  const [requests, setRequests] =
    useState<RefundRequest[]>([]);

  const [loading, setLoading] =
    useState(true);

  useEffect(() => {

    const q = query(
      collection(
        db,
        "refund_requests"
      ),
      orderBy(
        "status",
        "asc"
      )
    );

    const unsubscribe =
      onSnapshot(q, (snapshot) => {

        const data:
          RefundRequest[] = [];

        snapshot.forEach((doc) => {

          data.push({
            id: doc.id,
            ...doc.data()
          } as RefundRequest);

        });

        setRequests(data);

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
          "refund_requests",
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

  async function deleteRequest(
    id: string
  ) {

    try {

      await deleteDoc(
        doc(
          db,
          "refund_requests",
          id
        )
      );

    } catch (error) {

      console.log(error);

    }
  }

  if (loading) {

    return (

      <div className="flex min-h-screen items-center justify-center bg-black text-[var(--button-text-color)]">

        Loading Refund Requests...

      </div>

    );
  }

  return (

    <main className="min-h-screen bg-[#0b0b0b] p-4 text-[var(--button-text-color)]">

      {/* HEADER */}

      <div className="mb-8 flex items-center gap-4">

        <div className="flex h-16 w-16 items-center justify-center rounded-[24px] bg-cyan-500">

          <RefreshCcw size={30} />

        </div>

        <div>

          <h1 className="text-3xl font-black">
            Refund Requests
          </h1>

          <p className="mt-1 text-sm text-gray-400">
            Manage customer refunds
          </p>

        </div>

      </div>

      {/* REQUESTS */}

      <div className="space-y-5">

        {requests.length === 0 && (

          <div className="rounded-[30px] bg-[#151515] p-10 text-center">

            No Refund Requests Found

          </div>

        )}

        {requests.map(
          (request) => (

            <div
              key={request.id}
              className="rounded-[30px] bg-[#151515] p-5"
            >

              <div className="flex flex-col gap-6">

                {/* TOP */}

                <div className="flex flex-col gap-5 md:flex-row md:items-center md:justify-between">

                  <div>

                    <div className="flex items-center gap-3">

                      <User size={20} />

                      <h2 className="text-2xl font-black text-cyan-400">

                        {request.userName}

                      </h2>

                    </div>

                    <div className="mt-4 flex flex-col gap-2 text-gray-300">

                      <div className="flex items-center gap-2">

                        <Package size={16} />

                        {request.productName}

                      </div>

                      <div className="flex items-center gap-2">

                        <IndianRupee size={16} />

                        {request.amount}

                      </div>

                    </div>

                  </div>

                  <StatusBadge
                    status={
                      request.status
                    }
                  />

                </div>

                {/* REASON */}

                <div className="rounded-2xl bg-black/30 p-4">

                  <h3 className="mb-2 font-bold">
                    Refund Reason
                  </h3>

                  <p className="text-gray-300">

                    {request.reason}

                  </p>

                </div>

                {/* ACTIONS */}

                <div className="flex flex-wrap gap-3">

                  <button
                    onClick={() =>
                      updateStatus(
                        request.id!,
                        "Approved"
                      )
                    }
                    className="flex items-center gap-2 rounded-2xl bg-[var(--success-color)] px-5 py-3 font-bold text-[var(--text-color)]"
                  >

                    <CheckCircle2 size={18} />

                    Approve

                  </button>

                  <button
                    onClick={() =>
                      updateStatus(
                        request.id!,
                        "Rejected"
                      )
                    }
                    className="flex items-center gap-2 rounded-2xl bg-[var(--danger-color)] px-5 py-3 font-bold"
                  >

                    <XCircle size={18} />

                    Reject

                  </button>

                  <button
                    onClick={() =>
                      deleteRequest(
                        request.id!
                      )
                    }
                    className="flex items-center gap-2 rounded-2xl bg-zinc-700 px-5 py-3 font-bold"
                  >

                    <Trash2 size={18} />

                    Delete

                  </button>

                </div>

              </div>

            </div>

          )
        )}

      </div>

    </main>

  );
}

function StatusBadge({
  status
}: {
  status: string;
}) {

  function getColor() {

    if (status === "Approved") {

      return "bg-[var(--success-color)]";

    }

    if (status === "Rejected") {

      return "bg-[var(--danger-color)]";

    }

    return "bg-[var(--warning-color)]";

  }

  function getIcon() {

    if (status === "Approved") {

      return <CheckCircle2 size={16} />;

    }

    if (status === "Rejected") {

      return <XCircle size={16} />;

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
