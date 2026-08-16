"use client";

export const dynamic = "force-dynamic";

import { useEffect, useState } from "react";

import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  onSnapshot,
  serverTimestamp
} from "firebase/firestore";

import {
  Bell,
  Trash2,
  Send,
  Save,
  Smartphone,
  MessageSquare,
  Globe
} from "lucide-react";

import { db } from "@/firebase/config";

interface NotificationData {
  id?: string;
  title: string;
  message: string;
  audience: string;
  createdAt?: any;
}

export default function PushNotificationsPage() {

  const [title, setTitle] =
    useState("");

  const [message, setMessage] =
    useState("");

  const [audience, setAudience] =
    useState("All Users");

  const [saving, setSaving] =
    useState(false);

  const [loading, setLoading] =
    useState(true);

  const [notifications, setNotifications] =
    useState<NotificationData[]>([]);

  useEffect(() => {

    const unsubscribe =
      onSnapshot(
        collection(
          db,
          "push_notifications"
        ),
        (snapshot) => {

          const data:
            NotificationData[] = [];

          snapshot.forEach((doc) => {

            data.push({
              id: doc.id,
              ...doc.data()
            } as NotificationData);

          });

          setNotifications(data);

          setLoading(false);

        }
      );

    return () =>
      unsubscribe();

  }, []);

  async function sendNotification() {

    if (
      !title ||
      !message
    ) {

      alert(
        "Fill all fields"
      );

      return;

    }

    try {

      setSaving(true);

      await addDoc(
        collection(
          db,
          "push_notifications"
        ),
        {
          title,
          message,
          audience,
          createdAt:
            serverTimestamp()
        }
      );

      setTitle("");

      setMessage("");

      setAudience(
        "All Users"
      );

      alert(
        "Notification Sent"
      );

    } catch (error) {

      console.log(error);

    } finally {

      setSaving(false);

    }
  }

  async function deleteNotification(
    id: string
  ) {

    try {

      await deleteDoc(
        doc(
          db,
          "push_notifications",
          id
        )
      );

    } catch (error) {

      console.log(error);

    }
  }

  if (loading) {

    return (

      <div className="flex min-h-screen items-center justify-center bg-[var(--card-color)] text-[var(--button-text-color)]">

        Loading...

      </div>

    );
  }

  return (

    <main className="min-h-screen bg-[var(--primary-color)] p-4 text-[var(--button-text-color)]">

      {/* HEADER */}

      <div className="mb-8 flex items-center gap-4">

        <div className="flex h-16 w-16 items-center justify-center rounded-[24px] theme-primary-bg">

          <Bell size={30} />

        </div>

        <div>

          <h1 className="text-3xl font-black">
            Push Notifications
          </h1>

          <p className="mt-1 text-sm text-[var(--muted-text-color)]">
            Send live app notifications
          </p>

        </div>

      </div>

      {/* SEND */}

      <div className="rounded-[30px] bg-[var(--primary-color)] p-5">

        <h2 className="mb-5 text-2xl font-black">

          Send Notification

        </h2>

        <div className="space-y-5">

          <div>

            <label className="mb-2 block text-sm text-[var(--muted-text-color)]">

              Notification Title

            </label>

            <div className="flex items-center gap-3 rounded-2xl bg-[var(--card-color)] px-4">

              <Smartphone size={18} />

              <input
                type="text"
                value={title}
                onChange={(e) =>
                  setTitle(
                    e.target.value
                  )
                }
                className="w-full bg-transparent py-4 outline-none"
              />

            </div>

          </div>

          <div>

            <label className="mb-2 block text-sm text-[var(--muted-text-color)]">

              Notification Message

            </label>

            <div className="flex items-start gap-3 rounded-2xl bg-[var(--card-color)] px-4 py-4">

              <MessageSquare size={18} />

              <textarea
                rows={4}
                value={message}
                onChange={(e) =>
                  setMessage(
                    e.target.value
                  )
                }
                className="w-full resize-none bg-transparent outline-none"
              />

            </div>

          </div>

          <div>

            <label className="mb-2 block text-sm text-[var(--muted-text-color)]">

              Audience

            </label>

            <div className="flex items-center gap-3 rounded-2xl bg-[var(--card-color)] px-4">

              <Globe size={18} />

              <select
                value={audience}
                onChange={(e) =>
                  setAudience(
                    e.target.value
                  )
                }
                className="w-full bg-[var(--card-color)] py-4 outline-none"
              >

                <option>
                  All Users
                </option>

                <option>
                  Sellers
                </option>

                <option>
                  Affiliates
                </option>

                <option>
                  Premium Members
                </option>

              </select>

            </div>

          </div>

        </div>

        <button
          onClick={
            sendNotification
          }
          disabled={saving}
          className="mt-6 flex items-center gap-2 rounded-2xl theme-primary-bg px-5 py-4 font-bold"
        >

          <Send size={18} />

          {saving
            ? "Sending..."
            : "Send Notification"}

        </button>

      </div>

      {/* LIST */}

      <div className="mt-6 space-y-5">

        {notifications.length === 0 && (

          <div className="rounded-[30px] bg-[var(--primary-color)] p-10 text-center">

            No Notifications Found

          </div>

        )}

        {notifications.map(
          (item) => (

            <div
              key={item.id}
              className="rounded-[30px] bg-[var(--primary-color)] p-5"
            >

              <div className="flex flex-col gap-5 md:flex-row md:items-center md:justify-between">

                <div>

                  <h2 className="text-2xl font-black theme-primary-text">

                    {item.title}

                  </h2>

                  <p className="mt-3 text-[var(--text-color)]">

                    {item.message}

                  </p>

                  <div className="mt-3 inline-block rounded-full theme-primary-bg/20 px-4 py-2 text-sm font-bold text-[var(--primary-color)]">

                    {item.audience}

                  </div>

                </div>

                <button
                  onClick={() =>
                    deleteNotification(
                      item.id!
                    )
                  }
                  className="flex items-center gap-2 rounded-2xl bg-[var(--danger-color)] px-5 py-3 font-bold"
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
