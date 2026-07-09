"use client";

export const dynamic = "force-dynamic";

import { useEffect, useState } from "react";

import {
  doc,
  getDoc,
  setDoc
} from "firebase/firestore";

import {
  Bot,
  Save,
  Sparkles,
  Image,
  MessageSquare,
  Mic,
  ShieldCheck,
  BrainCircuit
} from "lucide-react";

import { db } from "@/firebase/config";

interface AIToolsSettings {
  aiEnabled: boolean;
  aiChatbot: boolean;
  aiImageGenerator: boolean;
  aiVoiceAssistant: boolean;
  aiRecommendations: boolean;
  aiAutoReply: boolean;
  aiSearch: boolean;
  aiCreditsPerUser: string;
  aiModelName: string;
}

export default function AIToolsPage() {

  const [settings, setSettings] =
    useState<AIToolsSettings>({
      aiEnabled: true,
      aiChatbot: true,
      aiImageGenerator: true,
      aiVoiceAssistant: false,
      aiRecommendations: true,
      aiAutoReply: false,
      aiSearch: true,
      aiCreditsPerUser: "100",
      aiModelName: "GPT-5"
    });

  const [loading, setLoading] =
    useState(true);

  const [saving, setSaving] =
    useState(false);

  useEffect(() => {

    fetchSettings();

  }, []);

  async function fetchSettings() {

    try {

      const ref = doc(
        db,
        "admin_settings",
        "ai_tools"
      );

      const snap =
        await getDoc(ref);

      if (snap.exists()) {

        setSettings(
          snap.data() as AIToolsSettings
        );

      }

    } catch (error) {

      console.log(error);

    } finally {

      setLoading(false);

    }
  }

  async function saveSettings() {

    try {

      setSaving(true);

      await setDoc(
        doc(
          db,
          "admin_settings",
          "ai_tools"
        ),
        settings
      );

      alert(
        "AI Tools Settings Saved"
      );

    } catch (error) {

      console.log(error);

    } finally {

      setSaving(false);

    }
  }

  function updateField(
    field: keyof AIToolsSettings,
    value: any
  ) {

    setSettings((prev) => ({
      ...prev,
      [field]: value
    }));

  }

  if (loading) {

    return (

      <div className="flex min-h-screen items-center justify-center bg-black text-[var(--button-text-color)]">

        Loading...

      </div>

    );
  }

  return (

    <main className="min-h-screen bg-[#0b0b0b] p-4 text-[var(--button-text-color)]">

      {/* HEADER */}

      <div className="mb-8 flex items-center justify-between">

        <div className="flex items-center gap-4">

          <div className="flex h-16 w-16 items-center justify-center rounded-[24px] bg-[var(--secondary-color)]">

            <Bot size={30} />

          </div>

          <div>

            <h1 className="text-3xl font-black">
              AI Tools Manager
            </h1>

            <p className="mt-1 text-sm text-gray-400">
              Manage AI features & automation
            </p>

          </div>

        </div>

        <button
          onClick={saveSettings}
          disabled={saving}
          className="flex items-center gap-2 rounded-2xl bg-[var(--secondary-color)] px-5 py-3 font-bold"
        >

          <Save size={18} />

          {saving
            ? "Saving..."
            : "Save"}

        </button>

      </div>

      {/* TOGGLES */}

      <div className="grid grid-cols-1 gap-5 md:grid-cols-2">

        <ToggleCard
          title="AI System"
          description="Enable AI tools"
          icon={
            <BrainCircuit size={24} />
          }
          enabled={
            settings.aiEnabled
          }
          onClick={() =>
            updateField(
              "aiEnabled",
              !settings.aiEnabled
            )
          }
        />

        <ToggleCard
          title="AI Chatbot"
          description="Enable AI assistant"
          icon={
            <MessageSquare size={24} />
          }
          enabled={
            settings.aiChatbot
          }
          onClick={() =>
            updateField(
              "aiChatbot",
              !settings.aiChatbot
            )
          }
        />

        <ToggleCard
          title="AI Image Generator"
          description="Generate AI images"
          icon={
            <Image size={24} />
          }
          enabled={
            settings.aiImageGenerator
          }
          onClick={() =>
            updateField(
              "aiImageGenerator",
              !settings.aiImageGenerator
            )
          }
        />

        <ToggleCard
          title="AI Voice Assistant"
          description="Voice AI support"
          icon={
            <Mic size={24} />
          }
          enabled={
            settings.aiVoiceAssistant
          }
          onClick={() =>
            updateField(
              "aiVoiceAssistant",
              !settings.aiVoiceAssistant
            )
          }
        />

        <ToggleCard
          title="AI Recommendations"
          description="AI product suggestions"
          icon={
            <Sparkles size={24} />
          }
          enabled={
            settings.aiRecommendations
          }
          onClick={() =>
            updateField(
              "aiRecommendations",
              !settings.aiRecommendations
            )
          }
        />

        <ToggleCard
          title="AI Auto Reply"
          description="Automatic AI replies"
          icon={
            <ShieldCheck size={24} />
          }
          enabled={
            settings.aiAutoReply
          }
          onClick={() =>
            updateField(
              "aiAutoReply",
              !settings.aiAutoReply
            )
          }
        />

      </div>

      {/* INPUTS */}

      <div className="mt-6 grid grid-cols-1 gap-5 md:grid-cols-2">

        <InputCard
          title="AI Credits Per User"
          value={
            settings.aiCreditsPerUser
          }
          onChange={(value: string) =>
            updateField(
              "aiCreditsPerUser",
              value
            )
          }
        />

        <InputCard
          title="AI Model Name"
          value={
            settings.aiModelName
          }
          onChange={(value: string) =>
            updateField(
              "aiModelName",
              value
            )
          }
        />

      </div>

      {/* STATUS */}

      <div className="mt-6 rounded-[30px] bg-gradient-to-r from-violet-500 to-fuchsia-500 p-6">

        <div className="flex items-center gap-3">

          <Bot size={28} />

          <h2 className="text-3xl font-black">
            AI Status
          </h2>

        </div>

        <div className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-2">

          <StatusCard
            title="AI Model"
            value={
              settings.aiModelName
            }
          />

          <StatusCard
            title="Credits Per User"
            value={
              settings.aiCreditsPerUser
            }
          />

          <StatusCard
            title="AI Chatbot"
            value={
              settings.aiChatbot
                ? "Enabled"
                : "Disabled"
            }
          />

          <StatusCard
            title="Image Generator"
            value={
              settings.aiImageGenerator
                ? "Enabled"
                : "Disabled"
            }
          />

        </div>

      </div>

    </main>

  );
}

function InputCard({
  title,
  value,
  onChange
}: {
  title: string;
  value: string;
  onChange: (
    value: string
  ) => void;
}) {

  return (

    <div className="rounded-[30px] bg-[#151515] p-5">

      <h2 className="mb-4 text-2xl font-black">
        {title}
      </h2>

      <input
        type="text"
        value={value}
        onChange={(e) =>
          onChange(
            e.target.value
          )
        }
        className="w-full rounded-2xl bg-black px-4 py-4 outline-none"
      />

    </div>

  );
}

function ToggleCard({
  title,
  description,
  icon,
  enabled,
  onClick
}: {
  title: string;
  description: string;
  icon: React.ReactNode;
  enabled: boolean;
  onClick: () => void;
}) {

  return (

    <div className="rounded-[30px] bg-[#151515] p-5">

      <div className="flex items-center justify-between">

        <div className="flex items-center gap-3">

          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-black">

            {icon}

          </div>

          <div>

            <h2 className="text-xl font-black">
              {title}
            </h2>

            <p className="text-sm text-gray-400">
              {description}
            </p>

          </div>

        </div>

        <button
          onClick={onClick}
          className={`rounded-full px-5 py-3 text-sm font-bold ${
            enabled
              ? "bg-[var(--success-color)]"
              : "bg-[var(--danger-color)]"
          }`}
        >

          {enabled
            ? "Enabled"
            : "Disabled"}

        </button>

      </div>

    </div>

  );
}

function StatusCard({
  title,
  value
}: {
  title: string;
  value: string;
}) {

  return (

    <div className="rounded-2xl bg-[var(--card-color)]/10 p-4">

      <p className="text-sm text-[var(--button-text-color)]/70">
        {title}
      </p>

      <h3 className="mt-2 text-2xl font-black">
        {value}
      </h3>

    </div>

  );
}
