"use client";

export const dynamic = "force-dynamic";

import { useEffect, useState } from "react";

import {
  addDoc,
  collection,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp
} from "firebase/firestore";

import {
  MessageCircle,
  Send,
  User,
  Shield
} from "lucide-react";

import { db } from "@/firebase/config";

interface ChatMessage {
  id?: string;
  sender: string;
  message: string;
  role: string;
  createdAt?: any;
}

export default function LiveChatPage() {

  const [messages, setMessages] =
    useState<ChatMessage[]>([]);

  const [message, setMessage] =
    useState("");

  const [loading, setLoading] =
    useState(true);

  useEffect(() => {

    const q = query(
      collection(
        db,
        "live_chat"
      ),
      orderBy(
        "createdAt",
        "asc"
      )
    );

    const unsubscribe =
      onSnapshot(q, (snapshot) => {

        const data:
          ChatMessage[] = [];

        snapshot.forEach((doc) => {

          data.push({
            id: doc.id,
            ...doc.data()
          } as ChatMessage);

        });

        setMessages(data);

        setLoading(false);

      });

    return () =>
      unsubscribe();

  }, []);

  async function sendMessage() {

    if (!message.trim()) {

      return;

    }

    try {

      await addDoc(
        collection(
          db,
          "live_chat"
        ),
        {
          sender: "Admin",
          role: "admin",
          message,
          createdAt:
            serverTimestamp()
        }
      );

      setMessage("");

    } catch (error) {

      console.log(error);

    }
  }

  if (loading) {

    return (

      <div className="flex min-h-screen items-center justify-center bg-[var(--card-color)] text-[var(--button-text-color)]">

        Loading Chat...

      </div>

    );
  }

  return (

    <main className="flex min-h-screen flex-col bg-[var(--primary-color)] text-[var(--button-text-color)]">

      {/* HEADER */}

      <div className="flex items-center gap-4 border-b border-[var(--border-color)]/10 bg-[var(--primary-color)] p-5">

        <div className="flex h-16 w-16 items-center justify-center rounded-[24px] bg-[var(--success-color)]">

          <MessageCircle size={30} />

        </div>

        <div>

          <h1 className="text-3xl font-black">
            Live Chat Support
          </h1>

          <p className="mt-1 text-sm text-[var(--muted-text-color)]">
            Real-time customer support
          </p>

        </div>

      </div>

      {/* MESSAGES */}

      <div className="flex-1 space-y-4 overflow-y-auto p-4">

        {messages.length === 0 && (

          <div className="flex h-full items-center justify-center text-[var(--muted-text-color)]">

            No Messages Yet

          </div>

        )}

        {messages.map(
          (msg) => (

            <div
              key={msg.id}
              className={`flex ${
                msg.role ===
                "admin"
                  ? "justify-end"
                  : "justify-start"
              }`}
            >

              <div
                className={`max-w-[85%] rounded-[30px] p-5 ${
                  msg.role ===
                  "admin"
                    ? "bg-[var(--success-color)] text-[var(--text-color)]"
                    : "bg-[var(--primary-color)]"
                }`}
              >

                <div className="mb-2 flex items-center gap-2">

                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[var(--card-color)]/20">

                    {msg.role ===
                    "admin" ? (

                      <Shield size={16} />

                    ) : (

                      <User size={16} />

                    )}

                  </div>

                  <h2 className="font-black">

                    {msg.sender}

                  </h2>

                </div>

                <p className="break-words text-sm">

                  {msg.message}

                </p>

              </div>

            </div>

          )
        )}

      </div>

      {/* INPUT */}

      <div className="border-t border-[var(--border-color)]/10 bg-[var(--primary-color)] p-4">

        <div className="flex items-center gap-3">

          <input
            type="text"
            value={message}
            onChange={(e) =>
              setMessage(
                e.target.value
              )
            }
            placeholder="Type message..."
            className="h-14 flex-1 rounded-2xl bg-[var(--card-color)] px-5 outline-none"
          />

          <button
            onClick={sendMessage}
            className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[var(--success-color)] text-[var(--text-color)]"
          >

            <Send size={22} />

          </button>

        </div>

      </div>

    </main>

  );
}
