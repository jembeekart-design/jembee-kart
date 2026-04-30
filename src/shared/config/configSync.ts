// src/shared/config/configSync.ts

import { doc, onSnapshot } from "firebase/firestore";
import { db } from "../firebase/config";
import { setConfig } from "./configClient";

// 🔥 Sync full app config from Firestore
export const subscribeConfig = () => {
  return onSnapshot(doc(db, "config", "global"), (snap) => {
    if (!snap.exists()) return;

    const data = snap.data();

    setConfig({
      theme: data.theme,
      ui: data.ui,
      features: data.features,
    });
  });
};