"use client";

export const dynamic = "force-dynamic";

import { useState, useEffect } from "react";
import { useAdminConfig } from "@/lib/admin-config/provider";
import {
  collection,
  onSnapshot,
  query,
  orderBy,
  doc
} from "firebase/firestore";
import { auth, db } from "@/firebase/config";
import { sendMessage, updatePresence, setTyping } from "@/firestore/services/chatService";
import { createCall } from "@/firestore/services/callService";
import { initializeAdminChat } from "@/firestore/services/adminChatInitializer";
import { FIRESTORE_PATHS } from "@/firestore/collections/firestorePaths";

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

  // Presence
  useEffect(() => {
    const uid = auth.currentUser?.uid;
    if (uid) {
      updatePresence(uid, true);
      return () => {
        updatePresence(uid, false);
      };
    }
  }, []);

  // Load Chats
  useEffect(() => {
    async function initAndLoad() {
      await initializeAdminChat();
      const q = query(collection(db, FIRESTORE_PATHS.ADMIN_CHAT.CHATS), orderBy("lastMessageAt", "desc"));
      return onSnapshot(q, (snapshot) => {
        const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as Chat[];
        setChats(data);
        if (!selectedChatId && data.length > 0) setSelectedChatId(data[0].id);
      });
    }

    const unsubPromise = initAndLoad();
    return () => {
      unsubPromise.then(unsub => unsub && unsub());
    };
  }, []);

  // Load Messages
  useEffect(() => {
    if (!selectedChatId) return;
    const q = query(collection(db, FIRESTORE_PATHS.ADMIN_CHAT.CHATS, selectedChatId, FIRESTORE_PATHS.ADMIN_CHAT.MESSAGES), orderBy("createdAt", "asc"));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as Message[];
      setMessages(data);
    });
    return () => unsubscribe();
  }, [selectedChatId]);

  async function handleSendMessage() {
    const uid = auth.currentUser?.uid;
    if (!message.trim() || !selectedChatId || !uid) return;
    const msgText = message;
    setMessage("");
    await sendMessage(selectedChatId, uid, "Admin", msgText);
  }

  async function handleCall(type: "voice" | "video") {
    const uid = auth.currentUser?.uid;
    if (!selectedChatId || !uid) return;
    await createCall(uid, selectedChatId, type);
  }

  function handleInputChange(e: React.ChangeEvent<HTMLInputElement>) {
    setMessage(e.target.value);
    if (selectedChatId && auth.currentUser?.uid) {
      setTyping(selectedChatId, auth.currentUser.uid, true);
    }
  }

  function handleKeyPress(e: React.KeyboardEvent) {
    if (e.key === "Enter") handleSendMessage();
  }

  return (
    <main className="min-h-screen bg-[var(--color-page-background)] p-4 text-[var(--button-text-color)]">
      {/* HEADER */}
      <div className="mb-6 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="flex h-16 w-16 items-center justify-center rounded-[28px] bg-[var(--color-primary-button)]">
            <MessageSquare size={30} className="text-[var(--text-primary)]" />
          </div>
          <div>
            <h1 className="text-3xl font-black">{adminChat.pageTitle}</h1>
            <p className="mt-1 text-sm text-[var(--text-muted)]">
              Realtime admin communication system
            </p>
          </div>
        </div>
        <div className="flex gap-3">
          <button className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[var(--color-card-background)]/30" onClick={() => handleCall("voice")}>
            <Phone size={18} />
          </button>
          <button className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[var(--color-card-background)]/30" onClick={() => handleCall("video")}>
            <Video size={18} />
          </button>
        </div>
      </div>

      {/* MAIN */}
      <div className="grid grid-cols-1 gap-5 lg:grid-cols-3">
        {/* SIDEBAR */}
        <div className="rounded-[30px] border border-[var(--color-border)]/10 bg-[var(--color-card-background)] p-5">
          <div className="mt-5 space-y-4">
            {chats.map((chat) => (
              <div
                key={chat.id}
                onClick={() => setSelectedChatId(chat.id)}
                className={`flex cursor-pointer items-center justify-between rounded-2xl p-4 transition-all ${
                  selectedChatId === chat.id ? "bg-[var(--color-primary-button)]/20" : "bg-[var(--color-card-background)]/20"
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className="relative">
                    <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[var(--color-primary-button)] text-[var(--text-primary)] font-black">
                      {chat.name.charAt(0)}
                    </div>
                    {chat.online && (
                      <div className="absolute bottom-0 right-0 h-3 w-3 rounded-full border-2 border-[var(--color-border)] bg-[var(--color-success)]" />
                    )}
                  </div>
                  <div>
                    <h2 className="font-black">{chat.name}</h2>
                    <p className="text-sm text-[var(--text-muted)]">{chat.lastMessage}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* CHAT AREA */}
        <div className="rounded-[30px] border border-[var(--color-border)]/10 bg-[var(--color-primary-button)] lg:col-span-2">
          {/* MESSAGES */}
          <div className="h-[500px] space-y-4 overflow-y-auto p-5">
            {messages.map((msg) => (
              <div key={msg.id} className={`flex ${msg.sender === "admin" ? "justify-end" : "justify-start"}`}>
                <div className={`max-w-[75%] rounded-3xl px-5 py-3 ${msg.sender === "admin" ? "bg-[var(--color-primary-button)] text-[var(--text-primary)]" : "bg-[var(--color-card-background)]/30"}`}>
                  <p className="font-medium">{msg.text}</p>
                </div>
              </div>
            ))}
          </div>
          {/* INPUT */}
          <div className="border-t border-[var(--color-border)]/10 p-5">
            <div className="flex items-center gap-3 rounded-2xl bg-[var(--color-card-background)]/30 p-3">
              <input
                type="text"
                placeholder="Type message..."
                value={message}
                onChange={handleInputChange}
                onKeyDown={handleKeyPress}
                className="w-full bg-transparent outline-none placeholder:text-[var(--text-muted)]"
              />
              <button 
                onClick={handleSendMessage}
                className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[var(--color-primary-button)] text-[var(--text-primary)]"
              >
                <Send size={20} />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* STATS */}
      <div className="mt-6 grid grid-cols-2 gap-4 md:grid-cols-4">
        <StatCard
          title="Online Users"
          value="124"
          icon={<Users size={22} />}
        />
        <StatCard
          title="Messages"
          value="12K"
          icon={<MessageSquare size={22} />}
        />
        <StatCard
          title="Support Staff"
          value="18"
          icon={<Shield size={22} />}
        />
        <StatCard
          title="Realtime"
          value="Active"
          icon={<Bell size={22} />}
        />
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

    <div className="rounded-[28px] border border-[var(--color-border)]/10 bg-[var(--color-primary-button)] p-5">

      <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[var(--color-primary-button)] text-[var(--text-primary)]">

        {icon}

      </div>

      <p className="mt-4 text-sm text-[var(--text-muted)]">
        {title}
      </p>

      <h2 className="mt-2 text-3xl font-black">
        {value}
      </h2>

    </div>

  );

}


