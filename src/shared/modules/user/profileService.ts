import { doc, setDoc, getDoc } from "firebase/firestore";
import { db } from "../../firebase/config";

// 🔹 Save Profile
export const saveProfile = async (uid: string, data: any) => {
  await setDoc(doc(db, "profiles", uid), data, { merge: true });
};

// 🔹 Get Profile
export const getProfile = async (uid: string) => {
  const snap = await getDoc(doc(db, "profiles", uid));
  return snap.exists() ? snap.data() : null;
};