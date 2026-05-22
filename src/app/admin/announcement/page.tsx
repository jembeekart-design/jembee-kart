"use client";

export const dynamic = "force-dynamic";

import { useEffect, useState } from "react";

import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp
} from "firebase/firestore";

import {
  Megaphone,
  Plus,
  Trash2,
  Bell,
  Calendar
} from "lucide-react";

import { db } from "@/firebase/config";

interface Announcement {
  id: string;
  title: string;
  message: string;
  createdAt?: any;
}

export default function AnnouncementPage() {

  const [announcements, setAnnouncements] =
    useState<Announcement[]>([]);

  const [title, setTitle] =
    useState("");

  const [message, setMessage] =
    useState("");

  const [loading, setLoading] =
    useState(true);

  const [adding, setAdding] =
    useState(false);

  useEffect(() => {

    const q = query(
      collection(
        db,
        "announcements"
      ),
      orderBy(
        "createdAt",
        "desc"
      )
    );

    const unsubscribe =
      onSnapshot(q, (snapshot) => {

        const data:
          Announcement[] = [];

        snapshot.forEach((doc) => {

          data.push({
            id: doc.id,
            ...doc.data()
          } as Announcement);

        });

        setAnnouncements(data);

        setLoading(false);

      });

    return () =>
      unsubscribe();

  }, []);

  async function addAnnouncement() {

    if (
      !title.trim() ||
      !message.trim()
    ) {

      alert(
        "Please fill all fields"
      );

      return;

    }

    try {

      setAdding(true);

      await addDoc(
        collection(
          db,
          "announcements"
        ),
        {
          title,
          message,
          createdAt:
            serverTimestamp()
        }
      );

      setTitle("");

      setMessage("");

      alert(
        "Announcement Added"
      );

    } catch (error) {

      console.log(error);

    } finally {

      setAdding(false);

    }
  }

  async function deleteAnnouncement(
    id: string
  ) {

    try {

      await deleteDoc(
        doc(
          db,
          "announcements",
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

        Loading Announcements...

      </div>

    );
  }

  return (

    <main className="min-h-screen bg-[#0b0b0b] p-4 text-white">

      {/* HEADER */}

      <div className="mb-8 flex items-center gap-4">

        <div className="flex h-16 w-16 items-center justify-center rounded-[24px] bg-red-500">

          <Megaphone size={30} />

        </div>

        <div>

          <h1 className="text-3xl font-black">
            Announcement Center
          </h1>

          <p className="mt-1 text-sm text-gray-400">
            Send announcements to all users
          </p>

        </div>

      </div>

      {/* CREATE */}

      <div className="rounded-[30px] bg-[#151515] p-5">

        <h2 className="mb-5 text-2xl font-black">
          Create Announcement
        </h2>

        <div className="space-y-4">

          <input
            type="text"
            placeholder="Announcement Title"
            value={title}
            onChange={(e) =>
              setTitle(
                e.target.value
              )
            }
            className="w-full rounded-2xl bg-black px-4 py-4 outline-none"
          />

          <textarea
            placeholder="Announcement Message"
            value={message}
            onChange={(e) =>
              setMessage(
                e.target.value
              )
            }
            rows={5}
            className="w-full rounded-2xl bg-black px-4 py-4 outline-none"
          />

          <button
            onClick={
              addAnnouncement
            }
            disabled={adding}
            className="flex items-center gap-2 rounded-2xl bg-red-500 px-5 py-3 font-bold"
          >

            <Plus size={18} />

            {adding
              ? "Publishing..."
              : "Publish Announcement"}

          </button>

        </div>

      </div>

      {/* LIST */}

      <div className="mt-6 space-y-5">

        {announcements.length === 0 && (

          <div className="rounded-[30px] bg-[#151515] p-10 text-center">

            No Announcements Found

          </div>

        )}

        {announcements.map(
          (item) => (

            <div
              key={item.id}
              className="rounded-[30px] bg-[#151515] p-5"
            >

              <div className="flex flex-col gap-5 md:flex-row md:items-start md:justify-between">

                {/* LEFT */}

                <div>

                  <div className="flex items-center gap-3">

                    <Bell
                      size={22}
                      className="text-red-500"
                    />

                    <h2 className="text-2xl font-black">

                      {item.title}

                    </h2>

                  </div>

                  <p className="mt-4 text-gray-300">

                    {item.message}

                  </p>

                  <div className="mt-4 flex items-center gap-2 text-sm text-gray-500">

                    <Calendar size={16} />

                    Announcement Published

                  </div>

                </div>

                {/* RIGHT */}

                <button
                  onClick={() =>
                    deleteAnnouncement(
                      item.id
                    )
                  }
                  className="flex items-center gap-2 rounded-2xl bg-red-500 px-4 py-3 font-bold"
                >

                  <Trash2 size={18} />

                  Delete

                </button>

              </div>

            </div>

          )
        )}

      </div>

    </main>

  );
}
