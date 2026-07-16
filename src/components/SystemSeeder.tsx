"use client";

import { useEffect } from "react";
import { seedSystemSettings } from "@/lib/seed/seedSystemSettings";

export default function SystemSeeder() {
  useEffect(() => {
    seedSystemSettings().catch(console.error);
  }, []);

  return null;
}
