// src/lib/admin-config/firestore.ts

import { doc, getDoc } from "firebase/firestore";
import { db } from "@/firebase/config";

import { AdminConfig } from "./types";
import { DEFAULT_ADMIN_CONFIG } from "./defaults";

/**
 * Safely merge Firestore config with defaults.
 */
function mergeConfig(
  defaults: Record<string, any>,
  firestore: Record<string, any>
): Record<string, any> {
  const output = { ...defaults };

  for (const key in firestore) {
    if (
      firestore[key] &&
      typeof firestore[key] === "object" &&
      !Array.isArray(firestore[key])
    ) {
      output[key] = mergeConfig(
        defaults[key] || {},
        firestore[key]
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
      DEFAULT_ADMIN_CONFIG,
      firestoreData
    ) as AdminConfig;
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
