'use client';

import { useEffect, useState } from "react";

type Notification = {
  id: string;
  message: string;
  time: string;
  read: boolean;
};

export default function NotificationsPage() {
  const [themeColor, setThemeColor] = useState("#6366f1");
  const [notifications, setNotifications] = useState<Notification[]>([]);

  useEffect(() => {
    const saved = localStorage.getItem("themeColor");
    if (saved) setThemeColor(saved);

    // 🔥 Dummy data (replace with Firestore realtime)
    setNotifications([
      {
        id: "1",
        message: "New order received 🛒",
        time: "2 mins ago",
        read: false,
      },
      {
        id: "2",
        message: "Product imported from Qikink",
        time: "10 mins ago",
        read: true,
      },
    ]);
  }, []);

  const toggleRead = (id: string) => {
    setNotifications((prev) =>
      prev.map((n) =>
        n.id === id ? { ...n, read: !n.read } : n
      )
    );
  };

  const deleteNotification = (id: string) => {
    setNotifications((prev) =>
      prev.filter((n) => n.id !== id)
    );
  };

  return (
    <div className="space-y-6 text-white">
      {/* Title */}
      <h1 className="text-3xl font-bold">🔔 Notifications</h1>

      {/* List */}
      <div className="glass p-5 rounded-2xl space-y-3">
        {notifications.length === 0 && (
          <p className="opacity-50 text-sm">
            No notifications
          </p>
        )}

        {notifications.map((note) => (
          <div
            key={note.id}
            className={`p-4 rounded-xl flex justify-between items-center ${
              note.read ? "bg-white/5" : "bg-white/10"
            }`}
          >
            <div>
              <p
                className={`${
                  note.read ? "opacity-60" : "font-semibold"
                }`}
              >
                {note.message}
              </p>
              <p className="text-xs opacity-50">
                {note.time}
              </p>
            </div>

            <div className="flex gap-2">
              {/* Read toggle */}
              <button
                onClick={() => toggleRead(note.id)}
                className="px-3 py-1 text-xs rounded-lg"
                style={{
                  border: `1px solid ${themeColor}`,
                  color: themeColor,
                }}
              >
                {note.read ? "Mark Unread" : "Mark Read"}
              </button>

              {/* Delete */}
              <button
                onClick={() =>
                  deleteNotification(note.id)
                }
                className="px-3 py-1 text-xs rounded-lg bg-red-500/30 text-red-400"
              >
                Delete
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Info */}
      <div className="glass p-4 rounded-xl text-sm opacity-70">
        Notifications alert you about new orders, product updates, and system activity.
      </div>
    </div>
  );
}
