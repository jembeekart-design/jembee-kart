"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  useMemo, // Added for optimization
  ReactNode,
} from "react";
import {
  doc,
  onSnapshot,
  getDoc,
} from "firebase/firestore";
import { db } from "@/firebase/config";
import { DEFAULT_ADMIN_CONFIG } from "./defaults";
import { validateConfig } from "./validator";
import type { AdminConfig } from "./types";

type ConfigStatus = "loading" | "ready";
type ConfigSource = "firestore" | "defaults";

interface AdminConfigContextType {
  config: AdminConfig;
  status: ConfigStatus;
  source: ConfigSource;
  error: Error | null;
  lastUpdated: Date | null;
}

const AdminConfigContext = createContext<AdminConfigContextType | undefined>(undefined);

export function AdminConfigProvider({ children }: { children: ReactNode }) {
  const [config, setConfig] = useState<AdminConfig>(DEFAULT_ADMIN_CONFIG);
  const [status, setStatus] = useState<ConfigStatus>("loading");
  const [source, setSource] = useState<ConfigSource>("defaults");
  const [error, setError] = useState<Error | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  useEffect(() => {
    const configRef = doc(db, "settings", "global_config");
const themeRef = doc(db, "settings", "theme");
    const featureFlagsRef = doc(db, "settings", "feature_flags");
    const walletRef = doc(db, "settings", "wallet");
const homepageRef = doc(db, "settings", "homepage");
const paymentRef = doc(db, "settings", "payment");
const shippingRef = doc(db, "settings", "shipping");
const notificationRef = doc(db, "settings", "notification");
    const unsubscribe = onSnapshot(
      configRef,
      (docSnap) => {
        const data = docSnap.exists() ? docSnap.data() : null;

        if (!data) {
          console.warn("Global config document not found. Using defaults.");
          setConfig(DEFAULT_ADMIN_CONFIG);
          setSource("defaults");
        } else {
          const loadConfig = async () => {
  const themeSnap = await getDoc(themeRef);
const featureFlagsSnap = await getDoc(featureFlagsRef);
  const mergedConfig = {
  ...DEFAULT_ADMIN_CONFIG,
  ...data,

  theme: themeSnap.exists()
    ? themeSnap.data()
    : DEFAULT_ADMIN_CONFIG.theme,

  featureFlags: featureFlagsSnap.exists()
    ? featureFlagsSnap.data()
    : DEFAULT_ADMIN_CONFIG.featureFlags,
};

  setConfig(validateConfig(mergedConfig));
  setSource("firestore");
};

loadConfig();
        }
        
        const updatedAt =
          data?.updatedAt && typeof data.updatedAt.toDate === "function"
            ? data.updatedAt.toDate()
            : new Date();
            
        setLastUpdated(updatedAt);
        setStatus("ready");
        setError(null);
      },
      (err) => {
        console.error("Firestore Config Sync Error:", err);
        setConfig(DEFAULT_ADMIN_CONFIG);
        setSource("defaults");
        setLastUpdated(new Date());
        setError(err as Error);
        setStatus("ready");
      }
    );

    return () => unsubscribe();
  }, []);

  // Performance Optimization: Prevent unnecessary re-renders
  const contextValue = useMemo(
    () => ({ config, status, source, error, lastUpdated }),
    [config, status, source, error, lastUpdated]
  );

  if (status === "loading") {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[var(--background)]">
        <div className="text-[14px] font-black uppercase tracking-widest text-[var(--primary)] animate-pulse">
          Loading JembeeKart...
        </div>
      </div>
    );
  }

  return (
    <AdminConfigContext.Provider value={contextValue}>
      {children}
    </AdminConfigContext.Provider>
  );
}

export function useAdminConfig() {
  const context = useContext(AdminConfigContext);
  
  if (!context) {
    throw new Error("useAdminConfig must be used within an AdminConfigProvider");
  }
  
  return context;
}
