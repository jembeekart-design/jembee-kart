// src/shared/config/configProvider.tsx

"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import { subscribeConfig } from "./configSync";
import { getConfig } from "./configClient";

const ConfigContext = createContext<any>(null);

export const ConfigProvider = ({ children }: { children: React.ReactNode }) => {
  const [config, setLocalConfig] = useState(getConfig());

  useEffect(() => {
    const unsub = subscribeConfig();

    const interval = setInterval(() => {
      setLocalConfig({ ...getConfig() });
    }, 500);

    return () => {
      unsub();
      clearInterval(interval);
    };
  }, []);

  return (
    <ConfigContext.Provider value={config}>
      {children}
    </ConfigContext.Provider>
  );
};

// 🔹 Hook
export const useConfig = () => {
  return useContext(ConfigContext);
};