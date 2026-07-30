"use client";

export const dynamic = "force-dynamic";

import { useState, useEffect } from "react";
import { useAdminConfig } from "@/lib/admin-config/provider";
import {
  collection,
  onSnapshot,
  query,
  orderBy,
  addDoc,
  serverTimestamp,
  doc
} from "firebase/firestore";
import { db } from "@/firebase/config";

import {
  MessageSquare,
  Send,
  Users,
  Shield,
  Bell,
  Search,
  Phone,
  Video,
  Smile,
  Paperclip,
  CheckCheck
} from "lucide-react";

interface Chat {
  id: string;
  name: string;
  lastMessage: string;
  online: boolean;
}

interface Message {
  id: string;
  sender: "admin" | "user";
  text: string;
  createdAt: any;
}

export default function AdminChatPage() {
  const { config } = useAdminConfig();
  const { adminChat } = config;
  const [message, setMessage] = useState("");
  const [chats, setChats] = useState<Chat[]>([]);
  const [messages, setMessages] = useState<Message[]>([]);
  const [selectedChatId, setSelectedChatId] = useState<string | null>(null);

  // Load Chats
  useEffect(() => {
    const q = query(collection(db, "chats"), orderBy("lastMessageAt", "desc"));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as Chat[];
      setChats(data);
      if (!selectedChatId && data.length > 0) setSelectedChatId(data[0].id);
    });
    return () => unsubscribe();
  }, []);

  // Load Messages
  useEffect(() => {
    if (!selectedChatId) return;
    const q = query(collection(db, "chats", selectedChatId, "messages"), orderBy("createdAt", "asc"));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as Message[];
      setMessages(data);
    });
    return () => unsubscribe();
  }, [selectedChatId]);

  async function sendMessage() {
    if (!message.trim() || !selectedChatId) return;
    const msgText = message;
    setMessage("");
    await addDoc(collection(db, "chats", selectedChatId, "messages"), {
      sender: "admin",
      text: msgText,
      createdAt: serverTimestamp(),
    });
  }

  function handleKeyPress(e: React.KeyboardEvent) {
    if (e.key === "Enter") sendMessage();
  }

  // ... (existing effects)

  return (
    <main className="min-h-screen bg-[var(--primary-color)] p-4 text-[var(--button-text-color)]">
      {/* HEADER */}
      <div className="mb-6 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="flex h-16 w-16 items-center justify-center rounded-[28px] bg-[var(--primary-color)]">
            <MessageSquare size={30} className="text-[var(--text-color)]" />
          </div>
          <div>
            <h1 className="text-3xl font-black">{adminChat.pageTitle}</h1>
            <p className="mt-1 text-sm text-[var(--muted-text-color)]">
              Realtime admin communication system
            </p>
          </div>
        </div>
      </div>

      {/* MAIN */}
      <div className="grid grid-cols-1 gap-5 lg:grid-cols-3">
        {/* SIDEBAR */}
        <div className="rounded-[30px] border border-[var(--border-color)]/10 bg-[var(--primary-color)] p-5">
          <div className="mt-5 space-y-4">
            {chats.map((chat) => (
              <div
                key={chat.id}
                onClick={() => setSelectedChatId(chat.id)}
                className={`flex cursor-pointer items-center justify-between rounded-2xl p-4 transition-all ${
                  selectedChatId === chat.id ? "bg-[var(--primary-color)]/20" : "bg-[var(--card-color)]/20"
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className="relative">
                    <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[var(--primary-color)] text-[var(--text-color)] font-black">
                      {chat.name.charAt(0)}
                    </div>
                    {chat.online && (
                      <div className="absolute bottom-0 right-0 h-3 w-3 rounded-full border-2 border-[var(--border-color)] bg-[var(--success-color)]" />
                    )}
                  </div>
                  <div>
                    <h2 className="font-black">{chat.name}</h2>
                    <p className="text-sm text-[var(--muted-text-color)]">{chat.lastMessage}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* CHAT AREA */}
        <div className="rounded-[30px] border border-[var(--border-color)]/10 bg-[var(--primary-color)] lg:col-span-2">
          {/* ... (rest of messages rendering) */}
          <div className="h-[500px] space-y-4 overflow-y-auto p-5">
            {messages.map((msg) => (
              <div key={msg.id} className={`flex ${msg.sender === "admin" ? "justify-end" : "justify-start"}`}>
                <div className={`max-w-[75%] rounded-3xl px-5 py-3 ${msg.sender === "admin" ? "bg-[var(--primary-color)] text-[var(--text-color)]" : "bg-[var(--card-color)]/30"}`}>
                  <p className="font-medium">{msg.text}</p>
                </div>
              </div>
            ))}
          </div>
          {/* ... (input) */}
        </div>
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

    <div className="rounded-[28px] border border-[var(--border-color)]/10 bg-[var(--primary-color)] p-5">

      <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[var(--primary-color)] text-[var(--text-color)]">

        {icon}

      </div>

      <p className="mt-4 text-sm text-[var(--muted-text-color)]">
        {title}
      </p>

      <h2 className="mt-2 text-3xl font-black">
        {value}
      </h2>

    </div>

  );
}
