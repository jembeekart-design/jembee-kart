import { auth, db, storage } from "@/firebase/config";
import { doc, getDoc, collection, addDoc, deleteDoc, getDocs, limit, query } from "firebase/firestore";
import { ref, uploadBytes, deleteObject } from "firebase/storage";

export const checkAuth = async () => {
  const user = auth.currentUser;
  if (!user) throw new Error("No user logged in");
  return { uid: user.uid, email: user.email };
};

export const checkAdmin = async (uid: string) => {
  const snap = await getDoc(doc(db, "users", uid));
  const role = snap.data()?.role?.toLowerCase();
  if (role !== "admin" && role !== "superadmin") throw new Error(`Access Denied: ${role || "None"}`);
  return "Authorized";
};

// ... Is tarah baaki services (Storage, API) ke functions yahan define karein
