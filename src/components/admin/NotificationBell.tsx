'use client';

import { useEffect, useState } from "react";

type Notification = {
  id: string;
  message: string;
  time: string;
  read: boolean;
};

export default function NotificationBell() {
  const [themeColor, setThemeColor] = useState("#6366f1");
  const [open, setOpen] = useState(false);

  const [notifications, setNotifications] = useState<Notification[]>([]);

  useEffect(() => {
    const saved = localStorage.getItem("themeColor");
    if (saved) setThemeColor(saved);

    // 🔥 Dummy (later Firestore realtime)
    setNotifications([
      {
        id: "1",
        message: "New order received 🛒",
        time: "2m ago",
        read: false,
      },
      {
        id: "2",
        message: "Banner updated 🎉",
        time: "10m ago",
        read: true,
      },
    ]);
  }, []);

  const unreadCount = notifications.filter((n) => !n.read).length;

  const toggleRead = (id: string) => {
    setNotifications((prev) =>
      prev.map((n) =>
        n.id === id ? { ...n, read: true } : n
      )
    );
  };

  return (
    <div className="relative">
      {/* Bell */}
      <button
        onClick={() => setOpen(!open)}
        className="relative text-xl"
      >
        🔔

        {/* Badge */}
        {unreadCount > 0 && (
          <span
            className="absolute -top-1 -right-1 text-xs px-1.5 rounded-full"
            style={{ background: themeColor }}
          >
            {unreadCount}
          </span>
        )}
      </button>

      {/* Dropdown */}
      {open && (
        <div className="absolute right-0 mt-3 w-72 glass rounded-xl p-3 space-y-2 z-50">
          <h3 className="text-sm font-semibold mb-2">
            Notifications
          </h3>

          {notifications.length === 0 && (
            <p className="text-xs opacity-50">
              No notifications
            </p>
          )}

          {notifications.map((note) => (
            <div
              key={note.id}
              onClick={() => toggleRead(note.id)}
              className={`p-2 rounded-lg cursor-pointer ${
                note.read ? "bg-white/5" : "bg-white/10"
              }`}
            >
              <p
                className={`text-sm ${
                  note.read ? "opacity-60" : "font-semibold"
                }`}
              >
                {note.message}
              </p>
              <p className="text-xs opacity-50">
                {note.time}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
