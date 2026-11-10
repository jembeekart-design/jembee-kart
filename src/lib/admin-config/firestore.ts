// src/lib/admin-config/firestore.ts

import { doc, getDoc } from "firebase/firestore";
import { db } from "@/firebase/config";

import { AdminConfig } from "./types";
import { DEFAULT_ADMIN_CONFIG } from "./defaults";

/**
 * Safely merge Firestore config with defaults.
 */
function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function mergeConfig(
  defaults: Record<string, unknown>,
  firestore: Record<string, unknown>
): Record<string, unknown> {
  const output = { ...defaults };

  for (const key in firestore) {
    const firestoreValue = firestore[key];
    if (isRecord(firestoreValue)) {
      const defaultValue = defaults[key];
      output[key] = mergeConfig(
        isRecord(defaultValue) ? defaultValue : {},
        firestoreValue
      );
    } else {
      output[key] = firestore[key];
    }
  }

  return output;
}

/**
 * Load complete admin config from Firestore.
 */
export async function loadAdminConfig(): Promise<AdminConfig> {
  try {
    const snap = await getDoc(
      doc(db, "admin_settings", "config")
    );

    if (!snap.exists()) {
      console.warn(
        "⚠ admin_settings/config not found. Using defaults."
      );
      return DEFAULT_ADMIN_CONFIG;
    }

    const firestoreData = snap.data();

    return mergeConfig(
      DEFAULT_ADMIN_CONFIG as unknown as Record<string, unknown>,
      firestoreData as Record<string, unknown>
    ) as unknown as AdminConfig;
  } catch (error) {
    console.error(
      "❌ Failed to load Admin Config",
      error
    );

    return DEFAULT_ADMIN_CONFIG;
  }
}

/**
 * Load only one config section.
 *
 * Example:
 * const payment = await loadConfigSection("payment")
 */
export async function loadConfigSection<
  K extends keyof AdminConfig
>(
  section: K
): Promise<AdminConfig[K]> {
  const config = await loadAdminConfig();
  return config[section];
}
