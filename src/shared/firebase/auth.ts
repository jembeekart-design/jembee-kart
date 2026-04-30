// src/shared/firebase/auth.ts

import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
} from "firebase/auth";
import { auth, db } from "./config";
import { doc, getDoc, setDoc } from "firebase/firestore";

// 🔹 Signup
export const registerUser = async (email: string, password: string) => {
  const res = await createUserWithEmailAndPassword(auth, email, password);

  await setDoc(doc(db, "users", res.user.uid), {
    email,
    role: "user",
    createdAt: new Date(),
  });

  return res.user;
};

// 🔹 Login
export const loginUser = async (email: string, password: string) => {
  const res = await signInWithEmailAndPassword(auth, email, password);
  return res.user;
};

// 🔹 Logout
export const logoutUser = async () => {
  await signOut(auth);
};

// 🔥 Get User Role (Admin panel security)
export const getUserRole = async (uid: string) => {
  const snap = await getDoc(doc(db, "users", uid));
  return snap.data()?.role || "user";
};

// 🔹 Auth Listener
export const onUserChange = (callback: any) => {
  return onAuthStateChanged(auth, callback);
};