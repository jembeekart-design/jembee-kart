// src/lib/auth.ts

import {
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  User,
} from "firebase/auth";
import { auth } from "./firebase";

// 🔐 Login
export const loginAdmin = async (email: string, password: string) => {
  try {
    const res = await signInWithEmailAndPassword(auth, email, password);

    // optional: role check later
    localStorage.setItem("isAdmin", "true");

    return res.user;
  } catch (error: any) {
    throw new Error(error.message);
  }
};

// 🚪 Logout
export const logoutAdmin = async () => {
  await signOut(auth);
  localStorage.removeItem("isAdmin");
};

// 👤 Get current user
export const getCurrentUser = (): User | null => {
  return auth.currentUser;
};

// 🔄 Auth state listener
export const onAuthChange = (callback: (user: User | null) => void) => {
  return onAuthStateChanged(auth, callback);
};
