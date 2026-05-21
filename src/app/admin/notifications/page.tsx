"use client";

export const dynamic = "force-dynamic";

import { useEffect, useState } from "react";

import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDocs,
  updateDoc
} from "firebase/firestore";

import {
  Bell,
  Plus,
  Trash2,
  Eye,
  EyeOff,
  Send
} from "lucide-react";

import { db } from "@/firebase/config";

interface NotificationItem {
  id: string;
  title: string;
  message: string;
  imageUrl?: string;
  visible: boolean;
  createdAt?: number;
}

export default function NotificationsPage() {

  const [notifications, setNotifications] =
    useState<NotificationItem[]>([]);

  const [loading, setLoading] =
    useState(true);

  const [creating, setCreating] =
    useState(false);

  const [title, setTitle] =
    useState("");

  const [message, setMessage] =
    useState("");

  const [imageUrl, setImageUrl] =
    useState("");

  useEffect(() => {

    fetchNotifications();

  }, []);

  async function fetchNotifications() {

    try {

      const snapshot =
        await getDocs(
          collection(
            db,
            "notifications"
          )
        );

      const data =
        snapshot.docs.map(
          (doc) => ({
            id: doc.id,
            ...doc.data()
          })
        ) as NotificationItem[];

      setNotifications(data);

    } catch (error) {

      console.log(error);

    } finally {

      setLoading(false);

    }
  }

  async function createNotification() {

    if (!title || !message)
      return;

    try {

      setCreating(true);

      await addDoc(
        collection(
          db,
          "notifications"
        ),
        {
          title,
          message,
          imageUrl,
          visible: true,
          createdAt:
            Date.now()
        }
      );

      setTitle("");
      setMessage("");
      setImageUrl("");

      fetchNotifications();

    } catch (error) {

      console.log(error);

    } finally {

      setCreating(false);

    }
  }

  async function updateNotification(
    id: string,
    field: string,
    value: any
  ) {

    try {

      await updateDoc(
        doc(
          db,
          "notifications",
          id
        ),
        {
          [field]: value
        }
      );

      setNotifications((prev) =>
        prev.map((item) =>
          item.id === id
            ? {
                ...item,
                [field]: value
              }
            : item
        )
      );

    } catch (error) {

      console.log(error);

    }
  }

  async function deleteNotification(
    id: string
  ) {

    try {

      await deleteDoc(
        doc(
          db,
          "notifications",
          id
        )
      );

      setNotifications((prev) =>
        prev.filter(
          (item) =>
            item.id !== id
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

      <div className="mb-6 flex items-center justify-between">

        <div>

          <h1 className="text-3xl font-black">
            Notifications
          </h1>

          <p className="mt-2 text-sm text-gray-400">
            Send app notifications
          </p>

        </div>

        <button
          onClick={createNotification}
          disabled={creating}
          className="flex items-center gap-2 rounded-2xl bg-violet-600 px-5 py-3 font-bold"
        >

          <Plus size={18} />

          Send Notification

        </button>

      </div>

      {/* CREATE */}

      <div className="mb-6 rounded-[30px] border border-white/10 bg-[#151515] p-5">

        <div className="space-y-4">

          <input
            type="text"
            placeholder="Notification Title"
            value={title}
            onChange={(e) =>
              setTitle(
                e.target.value
              )
            }
            className="w-full rounded-2xl border border-white/10 bg-[#1e1e1e] px-4 py-3 outline-none"
          />

          <textarea
            placeholder="Notification Message"
            value={message}
            onChange={(e) =>
              setMessage(
                e.target.value
              )
            }
            rows={4}
            className="w-full rounded-2xl border border-white/10 bg-[#1e1e1e] px-4 py-3 outline-none"
          />

          <input
            type="text"
            placeholder="Image URL"
            value={imageUrl}
            onChange={(e) =>
              setImageUrl(
                e.target.value
              )
            }
            className="w-full rounded-2xl border border-white/10 bg-[#1e1e1e] px-4 py-3 outline-none"
          />

        </div>

      </div>

      {/* LIST */}

      <div className="space-y-5">

        {notifications.map(
          (item) => (

            <div
              key={item.id}
              className="overflow-hidden rounded-[30px] border border-white/10 bg-[#151515]"
            >

              {/* TOP */}

              <div className="flex items-center justify-between border-b border-white/10 p-5">

                <div className="flex items-center gap-4">

                  <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-violet-600">

                    <Bell size={28} />

                  </div>

                  <div>

                    <h2 className="text-xl font-black">
                      {item.title}
                    </h2>

                    <p className="mt-1 text-sm text-gray-400">
                      Notification Alert
                    </p>

                  </div>

                </div>

                <div>

                  {item.visible ? (

                    <span className="rounded-full bg-green-500/20 px-4 py-2 text-xs font-bold text-green-500">

                      Active

                    </span>

                  ) : (

                    <span className="rounded-full bg-red-500/20 px-4 py-2 text-xs font-bold text-red-500">

                      Hidden

                    </span>

                  )}

                </div>

              </div>

              {/* BODY */}

              <div className="space-y-5 p-5">

                <input
                  type="text"
                  value={item.title}
                  onChange={(e) =>
                    updateNotification(
                      item.id,
                      "title",
                      e.target.value
                    )
                  }
                  className="w-full rounded-2xl border border-white/10 bg-[#1e1e1e] px-4 py-3 outline-none"
                />

                <textarea
                  value={item.message}
                  onChange={(e) =>
                    updateNotification(
                      item.id,
                      "message",
                      e.target.value
                    )
                  }
                  rows={4}
                  className="w-full rounded-2xl border border-white/10 bg-[#1e1e1e] px-4 py-3 outline-none"
                />

                <input
                  type="text"
                  value={
                    item.imageUrl || ""
                  }
                  onChange={(e) =>
                    updateNotification(
                      item.id,
                      "imageUrl",
                      e.target.value
                    )
                  }
                  className="w-full rounded-2xl border border-white/10 bg-[#1e1e1e] px-4 py-3 outline-none"
                />

                {/* LIVE PREVIEW */}

                <div className="rounded-[30px] bg-gradient-to-r from-violet-600 to-fuchsia-500 p-5">

                  <div className="flex gap-4">

                    <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-white/20">

                      <Bell size={24} />

                    </div>

                    <div className="flex-1">

                      <h2 className="text-lg font-black">
                        {item.title}
                      </h2>

                      <p className="mt-2 text-sm text-white/80">
                        {item.message}
                      </p>

                      <button className="mt-4 flex items-center gap-2 rounded-2xl bg-white px-4 py-2 text-sm font-bold text-black">

                        <Send size={15} />

                        Open

                      </button>

                    </div>

                  </div>

                </div>

                {/* ACTIONS */}

                <div className="grid grid-cols-2 gap-3">

                  <button
                    onClick={() =>
                      updateNotification(
                        item.id,
                        "visible",
                        !item.visible
                      )
                    }
                    className={`flex items-center justify-center gap-2 rounded-2xl px-4 py-3 text-sm font-bold ${
                      item.visible
                        ? "bg-yellow-500/20 text-yellow-500"
                        : "bg-green-500/20 text-green-500"
                    }`}
                  >

                    {item.visible ? (
                      <EyeOff size={16} />
                    ) : (
                      <Eye size={16} />
                    )}

                    {item.visible
                      ? "Hide"
                      : "Show"}

                  </button>

                  <button
                    onClick={() =>
                      deleteNotification(
                        item.id
                      )
                    }
                    className="flex items-center justify-center gap-2 rounded-2xl bg-red-500/20 px-4 py-3 text-sm font-bold text-red-500"
                  >

                    <Trash2 size={16} />

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
