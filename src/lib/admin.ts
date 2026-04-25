import { doc, setDoc, getDoc } from "firebase/firestore";
import { db } from "./firebase";

/**
 * Admin create (auto collection create)
 */
export const createAdminIfNotExists = async (user: any) => {
  if (!user) return;

  const adminRef = doc(db, "admins", user.uid);
  const adminSnap = await getDoc(adminRef);

  if (!adminSnap.exists()) {
    await setDoc(adminRef, {
      email: user.email,
      role: "admin",
      createdAt: new Date(),
    });
  }
};

/**
 * Check admin
 */
export const isAdmin = async (uid: string) => {
  const adminRef = doc(db, "admins", uid);
  const adminSnap = await getDoc(adminRef);

  return adminSnap.exists();
};
