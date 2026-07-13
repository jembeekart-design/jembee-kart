"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  ReactNode,
} from "react";

import { loadAdminConfig } from "./firestore";
import { DEFAULT_ADMIN_CONFIG } from "./defaults";
import type { AdminConfig } from "./types";
import { DEFAULT_MLM_CONFIG } from "./mlmDefaults";
const AdminConfigContext = createContext<AdminConfig>(
  DEFAULT_ADMIN_CONFIG
);

export function AdminConfigProvider({
  children,
}: {
  children: ReactNode;
}) {
  const [config, setConfig] = useState<AdminConfig>({
  ...DEFAULT_ADMIN_CONFIG,
  mlmConfig: DEFAULT_MLM_CONFIG,
});

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const data = await loadAdminConfig();
        setConfig({
  ...DEFAULT_ADMIN_CONFIG,
  mlmConfig: DEFAULT_MLM_CONFIG,
  ...data,
});
      } catch (e) {
        console.error("Admin Config Load Error", e);
      } finally {
        setLoading(false);
      }
    }

    load();
  }, []);

  if (loading) {
    return null;
  }

  return (
    <AdminConfigContext.Provider value={config}>
      {children}
    </AdminConfigContext.Provider>
  );
}

export function useAdminConfig() {
  return useContext(AdminConfigContext);
}
