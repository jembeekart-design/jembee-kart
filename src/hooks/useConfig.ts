"use client";

import { useEffect, useState } from "react";
import { configStore } from "@/shared/store/configStore";

export const useConfig = () => {
  const [config, setConfig] = useState(configStore.get());

  useEffect(() => {
    return configStore.subscribe(setConfig);
  }, []);

  return {
    config,
    updateConfig: configStore.set,
  };
};