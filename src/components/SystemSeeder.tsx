"use client";

import { useEffect } from "react";
import { seedSystemSettings } from "@/lib/seed/seedSystemSettings";

export default function SystemSeeder() {
  useEffect(() => {
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
