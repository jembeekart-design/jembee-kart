import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
} from "firebase/auth";
import { auth, db } from "../../firebase/config";
import { doc, setDoc, getDoc } from "firebase/firestore";

// 🔹 Register
export const register = async (email: string, password: string) => {
  const res = await createUserWithEmailAndPassword(auth, email, password);

  await setDoc(doc(db, "users", res.user.uid), {
    email,
    role: "user",
    createdAt: Date.now(),
  });

  return res.user;
};

// 🔹 Login
export const login = async (email: string, password: string) => {
  const res = await signInWithEmailAndPassword(auth, email, password);
  return res.user;
};

// 🔹 Logout
export const logout = async () => {
  await signOut(auth);
};

// 🔹 Get Role
export const getUserRole = async (uid: string) => {
  const snap = await getDoc(doc(db, "users", uid));
  return snap.data()?.role || "user";
};