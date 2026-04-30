// src/shared/firebase/db.ts

import {
  collection,
  doc,
  getDoc,
  getDocs,
  setDoc,
  updateDoc,
  onSnapshot,
} from "firebase/firestore";
import { db } from "./config";

// 🔹 Generic Fetch
export const getCollection = async (path: string) => {
  const snapshot = await getDocs(collection(db, path));
  return snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
};

// 🔹 Single Doc
export const getDocument = async (path: string, id: string) => {
  const snap = await getDoc(doc(db, path, id));
  return snap.exists() ? snap.data() : null;
};

// 🔹 Create / Update
export const setDocument = async (path: string, id: string, data: any) => {
  await setDoc(doc(db, path, id), data, { merge: true });
};

// 🔥 Theme Live Sync (Admin panel powered)
export const subscribeTheme = (callback: (theme: any) => void) => {
  return onSnapshot(doc(db, "theme", "global"), (snap) => {
    if (!snap.exists()) return;

    const theme = snap.data();

    // Apply CSS variables (Glass UI engine)
    document.documentElement.style.setProperty("--primary", theme.primary);
    document.documentElement.style.setProperty("--blur", theme.blur + "px");
    document.documentElement.style.setProperty("--opacity", theme.opacity);

    callback(theme);
  });
};