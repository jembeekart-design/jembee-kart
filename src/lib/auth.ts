// src/lib/auth.ts

import {
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  User,
} from "firebase/auth";

import { doc, getDoc, setDoc } from "firebase/firestore";
import { auth, db } from "./firebase";

// 🔐 Login + Admin Check
export const loginAdmin = async (email: string, password: string) => {
  try {
    const res = await signInWithEmailAndPassword(auth, email, password);
    const user = res.user;

    // 🔥 Admin check from Firestore
    const adminRef = doc(db, "admins", user.uid);
    const adminSnap = await getDoc(adminRef);

    // 👉 अगर admin नहीं है → first time create (optional)
    if (!adminSnap.exists()) {
      await setDoc(adminRef, {
        email: user.email,
        role: "admin",
        createdAt: new Date(),
      });
    }

    return user;
  } catch (error: any) {
    throw new Error(error.message);
  }
};

// 🚪 Logout
export const logoutAdmin = async () => {
  await signOut(auth);
};

// 👤 Get current user
export const getCurrentUser = (): User | null => {
  return auth.currentUser;
};

// 🔄 Auth state listener
export const onAuthChange = (callback: (user: User | null) => void) => {
  return onAuthStateChanged(auth, callback);
};
