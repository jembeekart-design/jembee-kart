"use client";

import { useEffect } from "react";
import { seedSystemSettings } from "@/lib/seed/seedSystemSettings";
import { isFirebaseConfigured } from "@/firebase/config";

export default function SystemSeeder() {
  useEffect(() => {
    if (!isFirebaseConfigured) {
      console.info("JEMBEE PLAY local preview: Firebase seeding skipped; configure .env.local for backend access.");
      return;
    }

    const init = async () => {
      try {
        await seedSystemSettings();
        console.log("✅ System settings initialized.");
      } catch (error) {
        console.error("❌ Failed to initialize system settings:", error);
      }
    };

    init();
  }, []);

  return null;
}
