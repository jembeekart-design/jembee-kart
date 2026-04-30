import { doc, onSnapshot } from "firebase/firestore";
import { db } from "../firebase/config";
import { applyUIConfig } from "./ui-config";

export type Theme = {
  primary: string;
  mode: "light" | "dark";
  blur: number;
  opacity: number;
};

export const applyTheme = (t: Theme) => {
  const r = document.documentElement;
  r.style.setProperty("--primary", t.primary);
  r.dataset.theme = t.mode;
  applyUIConfig({ glass: true, blur: t.blur, opacity: t.opacity, radius: 16, shadow: "0 10px 30px rgba(0,0,0,0.25)" });
};

// 🔥 Realtime sync (Admin panel changes reflect instantly)
export const subscribeTheme = () => {
  return onSnapshot(doc(db, "theme", "global"), (snap) => {
    if (snap.exists()) applyTheme(snap.data() as Theme);
  });
};