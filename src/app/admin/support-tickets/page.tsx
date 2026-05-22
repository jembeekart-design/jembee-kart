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
  Headphones,
  Trash2,
  MessageCircle,
  User,
  Mail,
  ShieldCheck,
  Clock3
} from "lucide-react";

import { db } from "@/firebase/config";

interface TicketData {
  id?: string;
  name: string;
  email: string;
  subject: string;
  message: string;
  status: string;
}

export default function SupportTicketsPage() {

  const [tickets, setTickets] =
    useState<TicketData[]>([]);

  const [loading, setLoading] =
    useState(true);

  useEffect(() => {

    const q = query(
      collection(
        db,
        "support_tickets"
      ),
      orderBy(
        "status",
        "asc"
      )
    );

    const unsubscribe =
      onSnapshot(q, (snapshot) => {

        const data:
          TicketData[] = [];

        snapshot.forEach((doc) => {

          data.push({
            id: doc.id,
            ...doc.data()
          } as TicketData);

        });

        setTickets(data);

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
          "support_tickets",
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

  async function deleteTicket(
    id: string
  ) {

    try {

      await deleteDoc(
        doc(
          db,
          "support_tickets",
          id
        )
      );

    } catch (error) {

      console.log(error);

    }
  }

  if (loading) {

    return (

      <div className="flex min-h-screen items-center justify-center bg-black text-white">

        Loading...

      </div>

    );
  }

  return (

    <main className="min-h-screen bg-[#0b0b0b] p-4 text-white">

      {/* HEADER */}

      <div className="mb-8 flex items-center gap-4">

        <div className="flex h-16 w-16 items-center justify-center rounded-[24px] bg-cyan-500">

          <Headphones size={30} />

        </div>

        <div>

          <h1 className="text-3xl font-black">
            Support Tickets
          </h1>

          <p className="mt-1 text-sm text-gray-400">
            Manage customer support requests
          </p>

        </div>

      </div>

      {/* TICKETS */}

      <div className="space-y-5">

        {tickets.length === 0 && (

          <div className="rounded-[30px] bg-[#151515] p-10 text-center">

            No Support Tickets Found

          </div>

        )}

        {tickets.map(
          (ticket) => (

            <div
              key={ticket.id}
              className="rounded-[30px] bg-[#151515] p-5"
            >

              <div className="flex flex-col gap-6">

                {/* TOP */}

                <div className="flex flex-col gap-5 md:flex-row md:items-center md:justify-between">

                  <div>

                    <h2 className="text-2xl font-black text-cyan-400">

                      {ticket.subject}

                    </h2>

                    <div className="mt-4 flex flex-col gap-2 text-gray-300">

                      <div className="flex items-center gap-2">

                        <User size={16} />

                        {ticket.name}

                      </div>

                      <div className="flex items-center gap-2">

                        <Mail size={16} />

                        {ticket.email}

                      </div>

                    </div>

                  </div>

                  <StatusBadge
                    status={
                      ticket.status
                    }
                  />

                </div>

                {/* MESSAGE */}

                <div className="rounded-2xl bg-black p-4">

                  <div className="mb-3 flex items-center gap-2">

                    <MessageCircle size={18} />

                    <h3 className="font-bold">

                      Customer Message

                    </h3>

                  </div>

                  <p className="text-gray-300">

                    {ticket.message}

                  </p>

                </div>

                {/* ACTIONS */}

                <div className="flex flex-wrap gap-3">

                  <button
                    onClick={() =>
                      updateStatus(
                        ticket.id!,
                        "Pending"
                      )
                    }
                    className="rounded-2xl bg-yellow-500 px-5 py-3 font-bold text-black"
                  >

                    Pending

                  </button>

                  <button
                    onClick={() =>
                      updateStatus(
                        ticket.id!,
                        "Resolved"
                      )
                    }
                    className="rounded-2xl bg-green-500 px-5 py-3 font-bold text-black"
                  >

                    Resolved

                  </button>

                  <button
                    onClick={() =>
                      updateStatus(
                        ticket.id!,
                        "Closed"
                      )
                    }
                    className="rounded-2xl bg-blue-500 px-5 py-3 font-bold"
                  >

                    Closed

                  </button>

                  <button
                    onClick={() =>
                      deleteTicket(
                        ticket.id!
                      )
                    }
                    className="flex items-center gap-2 rounded-2xl bg-red-500 px-5 py-3 font-bold"
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

    if (status === "Resolved") {

      return "bg-green-500";

    }

    if (status === "Closed") {

      return "bg-blue-500";

    }

    return "bg-yellow-500";

  }

  function getIcon() {

    if (status === "Resolved") {

      return <ShieldCheck size={16} />;

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
